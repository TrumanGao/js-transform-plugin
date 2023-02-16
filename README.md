# js-transform-plugin

An ast plugin for transforming js/ts/jsx/tsx files from commonJS to ESmodule.

## Usage:

1. Enter the program which needs to be transformed.

2. `npm install -D js-transform-plugin`

3. Add this script to package.json:

   ```json
   {
     "scripts": {
       "transform": "js-transform"
     }
   }
   ```

4. `npm run transform [absolute path]`

Then js/ts/jsx/tsx files in [absolute path] will be transform from commonJS to ESmodule recursively.
The default value of [absolute path] is process.cwd().

## Dependencies

[jscodeshift](https://github.com/facebook/jscodeshift)
[@babel/core](https://babeljs.io/docs/en/babel-core)
