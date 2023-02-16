#!/usr/bin/env node
import { readFile } from "./utils/readFile.js";

const argvs = process.argv.slice(2);
const argvPath = argvs[0] || process.cwd();

console.log("enter path: ", argvPath);

readFile(argvPath);
