const fs = require("fs");
const path = require("path");
const { require2Import, exports2Export } = require("./cjs2esm.js");

/**
 * transform js/ts/jsx/tsx files in specifiedPath recursively from commonJS to ESmodule
 * @param { string } specifiedPath default: process.cwd()
 */
function readFile(specifiedPath) {
  if (!specifiedPath || typeof specifiedPath !== "string") {
    throw new Error("required param: absolute path");
  }
  fs.readdir(specifiedPath, (err, files) => {
    if (err) {
      console.log("fs.readdir err: ", err);
      throw err;
    }
    files.forEach((file) => {
      let fPath = path.join(specifiedPath, file);

      fs.stat(fPath, (err, stat) => {
        if (err) {
          console.log("fs.stat err: ", err);
          throw err;
        }
        if (!stat.isFile()) {
          console.log("folder: ", fPath);
          readFile(fPath);
        } else if (/\.(j|t)sx?$/.test(fPath)) {
          console.log("\tfile: ", fPath);
          const code = fs.readFileSync(fPath, {
            encoding: "utf8",
          });
          const result = [require2Import, exports2Export].reduce(
            (code, currentFn) => {
              return currentFn(code);
            },
            code
          );

          fs.writeFile(fPath, result, "utf8", (err) => {
            if (err) {
              console.log("\tfs.writeFile err: ", err);
            }
          });
        }
      });
    });
  });
}

module.exports = {
  readFile,
};
