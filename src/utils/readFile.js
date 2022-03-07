import fs from 'fs';
import path from 'path';
import { require2Import, exports2Export } from './cjs2esm.js';

export function readFile (argvPath = `${process.cwd()}/src`) {
    console.log('传入的参数path', argvPath);
    fs.readdir(argvPath, (err, files) => {
        if (err) {
            throw err;
        }
        files.forEach(file => {
            let fPath = path.join(argvPath, file);
            // console.log('当前遍历的绝对路径', fPath);

            fs.stat(fPath, (err, stat) => {
                if (err) {
                    throw err;
                }
                if (stat.isFile()) {
                    if (/\.(j|t)s$/.test(fPath)) {
                        const code = fs.readFileSync(fPath, {
                            encoding: 'utf8',
                        });

                        // console.log('当前遍历的文件内容', code);
                        let result = require2Import(code);
                        result = exports2Export(result);
                        console.log('当前遍历的文件编译结果', result);

                        fs.writeFile(fPath, result, 'utf8', err => {
                            if (err) {
                                console.log('写入错误 err：', err);
                            }
                        });
                    }
                } else {
                    readFile(fPath);
                }
            });
        });
    });
}
