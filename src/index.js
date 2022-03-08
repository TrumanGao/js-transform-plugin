#!/usr/bin/env node
const { readFile } = require('./utils/readFile.js');

const argvs = process.argv.slice(2);
const argvPath = argvs[0]; // 参数一：路径
readFile(argvPath);
