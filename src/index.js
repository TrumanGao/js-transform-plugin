const fs = require('fs');
const path = require('path');

import { require2Import } from './utils/cjs2esm';

export function myReadfile (MyUrl = `${process.cwd()}/src`) {
    fs.readdir(MyUrl, (err, files) => {
        if (err) {
            throw err;
        }
        files.forEach(file => {
            let fPath = path.join(MyUrl, file);
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
                        const result = require2Import(code);
                        console.log('当前遍历的文件编译结果', result);

                        // fs.writeFile(fPath, result, 'utf8', err => {
                        //     if (err) {
                        //         console.log('写入错误 err：', err);
                        //     }
                        // });
                    }
                } else {
                    myReadfile(fPath);
                }
            });
        });
    });
}
