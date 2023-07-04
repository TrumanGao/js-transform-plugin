简体中文 | [English](./README.md)

<div align="center">
  <h1>js-transform-plugin</h1>
</div>

代码转化 AST 工具，用于将指定目录内所有 js/ts/jsx/tsx 文件的模块导入导出语法由 commonJS 递归转化为 ESmodule。[效果示例](https://github.com/TrumanGao/js-transform-plugin#examples)

[![license](https://img.shields.io/github/license/TrumanGao/js-transform-plugin?style=flat-square)](https://en.wikipedia.org/wiki/MIT_License)

---

## Usage

1. 项目内安装

   ```bash
   npm install -D js-transform-plugin
   ```

2. package.json 文件添加代码转化 script

   ```json
   {
     "scripts": {
       "transform": "js-transform"
     }
   }
   ```

3. 执行代码转化 script
   ```bash
   npm run transform [absolute path]
   ```
   - 可选参数 [absolute path] 为目标目录的绝对路径。不传则默认 process.cwd()，即执行命令行的路径。
   - 暂不支持配置忽略文件夹。为避免转化 node_modules，建议将参数设置为 src 目录的绝对路径，或直接删除 node_modules 后再执行。

## Examples

```js
// 转化前
const a = require("my-package");

// 转化后
import a from "my-package";
```

```js
// 转化前
const { a, b, c } = require("my-package");

// 转化后
import { a, b, c } from "my-package";
```

```js
// 转化前
require("my-package");

// 转化后
import "my-package";
```

```js
// 转化前
module.exports = { ... }

// 转化后
export { ... }
// or
export default { ... }
```

```js
// 转化前
module.exports = abc;
module.exports = new Abc();
module.exports = fun(a, b);
module.exports = function(){};
module.exports = () => {};

// 转化后
export default abc;
export default new Abc();
export default fun(a, b);
export default function(){};
export default () => {};
```

```js
// 转化前
const { b, c } = require("my-package");

// 转化后
import { b, c } from "my-package";
```

```js
// 转化前
const { d: aliasD } = require("my-package");

// 转化后
import { d as aliasD } from "my-package";
```

## Dependencies

[jscodeshift](https://github.com/facebook/jscodeshift)

[@babel/core](https://babeljs.io/docs/en/babel-core)
