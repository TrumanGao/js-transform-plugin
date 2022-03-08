import fs from 'fs';
import path from 'path';
import { require2Import, exports2Export } from './cjs2esm.js';

export function readFile (argvPath = `${process.cwd()}\\src`) {
    fs.readdir(argvPath, (err, files) => {
        if (err) {
            throw err;
        }
        files.forEach(file => {
            let fPath = path.join(argvPath, file);

            fs.stat(fPath, (err, stat) => {
                if (err) {
                    throw err;
                }
                if (stat.isFile()) {
                    console.log('访问文件：', fPath);
                    if (/\.(j|t)s$/.test(fPath)) {
                        const code = fs.readFileSync(fPath, {
                            encoding: 'utf8',
                        });

                        // console.log('当前遍历的文件内容', code);
                        const result = [ require2Import, exports2Export ].reduce((code, currentFn) => {
                            return currentFn(code);
                        }, code);
                        console.log('当前遍历的文件编译结果', result);

                        fs.writeFile(fPath, result, 'utf8', err => {
                            if (err) {
                                console.log('写入错误 err：', err);
                            }
                        });
                    } else {
                        console.log('访问文件 - 文件未通过校验', fPath);
                    }
                } else {
                    console.log('访问文件夹：', fPath);
                    readFile(fPath);
                }
            });
        });
    });
}
