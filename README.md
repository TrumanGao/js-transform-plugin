English | [简体中文](./README.zh.md)

<div align="center">
  <h1>js-transform-plugin</h1>
</div>

An ast plugin for transforming js/ts/jsx/tsx files from commonJS to ESmodule. Here for the [examples](https://github.com/TrumanGao/js-transform-plugin#examples).

[![license](https://img.shields.io/github/license/trumangao/js-transform-plugin?style=flat-square)](https://en.wikipedia.org/wiki/MIT_License)

---

## Usage

1. ```bash
   npm install -D js-transform-plugin
   ```

2. Add this script to package.json

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
   - The default value of [absolute path] is process.cwd().
   - The configuration of ignored files has not been supported. To avoid transforming node_modules dir, you can provide param, like, the absolute path of src dir. Or easier, just delete node_modules dir.

- Then js/ts/jsx/tsx files in [absolute path] will be transformed from commonJS to ESmodule recursively.

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
