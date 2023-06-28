# js-transform-plugin

An ast plugin for transforming js/ts/jsx/tsx files from commonJS to ESmodule. Here for the [examples](https://github.com/TrumanGao/js-transform-plugin#examples).

代码转化 AST 工具，用于将指定目录内所有 js/ts/jsx/tsx 文件的模块导入导出语法由 commonJS 转化为 ESmodule。[转化示例](https://github.com/TrumanGao/js-transform-plugin#examples)

## Usage:

1. ```bash
    npm install -D js-transform-plugin
   ```

   项目内安装依赖 js-transform-plugin

2. Add this script to package.json:

   package.json 文件添加代码转化 script：

   ```json
   {
     "scripts": {
       "transform": "js-transform"
     }
   }
   ```

3. ```bash
    npm run transform [absolute path]
   ```

   执行代码转化 script

   - Then js/ts/jsx/tsx files in [absolute path] will be transformed from commonJS to ESmodule recursively. The default value of [absolute path] is process.cwd().
   - The configuration of ignored files has not been supported. To avoid transforming node_modules dir, you can provide param, like, the absolute path of src dir. Or easier, just delete node_modules dir.

   - 可选参数 [absolute path] 为目标目录的绝对路径，不传则默认 process.cwd()。
   - 暂不支持配置忽略文件夹。为避免转化 node_modules，建议将参数设置为 src 目录的绝对路径，或直接删除 node_modules 后再执行。

## Examples

```js
// before
const a = require("my-package");

// after
import a from "my-package";
```

```js
// before
const { a, b, c } = require("my-package");

// after
import { a, b, c } from "my-package";
```

```js
// before
require("my-package");

// after
import "my-package";
```

```js
// before
module.exports = { ... }

// after
export { ... }
// or
export default { ... }
```

```js
// before
module.exports = abc;
module.exports = new Abc();
module.exports = fun(a, b);
module.exports = function(){};
module.exports = () => {};

// after
export default abc;
export default new Abc();
export default fun(a, b);
export default function(){};
export default () => {};
```

```js
// before
const { b, c } = require("my-package");

// after
import { b, c } from "my-package";
```

```js
// before
const { d: aliasD } = require("my-package");

// after
import { d as aliasD } from "my-package";
```

## Dependencies

[jscodeshift](https://github.com/facebook/jscodeshift)

[@babel/core](https://babeljs.io/docs/en/babel-core)
