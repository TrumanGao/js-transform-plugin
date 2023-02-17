import j from "jscodeshift";
import babelCore from "@babel/core";
const { template } = babelCore;
import {
  findRequire,
  findRequireExpression,
  findExports,
} from "../constants/findTemplate.js";
import parser from "recast/parsers/typescript.js";

function require2Import(code) {
  const ast = j(code, { parser });

  ast.find(j.VariableDeclaration, findRequire).forEach((path) => {
    const { id, init } = path.value.declarations[0];
    const importPath = init.arguments[0].value;
    let replaceDeclaration; // 用于替换的表达式

    if (path.parent.value.type === "Program") {
      // 根节点导入

      if (id.type === j.Identifier.name) {
        // eg. const a = require('my-package');
        // to. import a from 'my-package';
        const varName = id.name;

        const replaceDeclarationTemplate = template(`
                import %%varName%% from %%importPath%%; 
                `);
        replaceDeclaration = replaceDeclarationTemplate({
          varName,
          importPath,
        });
      } else if (id.type === j.ObjectPattern.name) {
        // eg. const { ... } = require('my-package');
        // to. import { ... } from 'my-package';
        const { varNames, template: replaceDeclarationTemplate } =
          replaceDeclarationTemplate_ObjectPattern({
            id,
          });
        replaceDeclaration = replaceDeclarationTemplate({
          varNames,
          importPath,
        });
      } else {
        // @TODO 未覆盖的逻辑
        // debugger;
        // console.log("未覆盖的导入逻辑 3: ", id);
      }
    } else {
      // @TODO 嵌套导入
      // debugger;
      // console.log("未覆盖的导入逻辑 4: ", id);
    }

    if (replaceDeclaration) {
      j(path).replaceWith(replaceDeclaration);
    }
  });

  ast.find(j.ExpressionStatement, findRequireExpression).forEach((path) => {
    const { arguments: _arguments } = path.value.expression;
    const importPath = _arguments[0].value;
    let replaceDeclaration; // 用于替换的表达式
    if (path.parent.value.type === "Program") {
      // 根节点导入
      // eg. require('my-package')
      const replaceDeclarationTemplate = template(`
                import %%importPath%%; 
                `);
      replaceDeclaration = replaceDeclarationTemplate({
        importPath,
      });
    } else {
      // @TODO 嵌套导入
      // debugger;
      // console.log("未覆盖的导入逻辑 5: ", _arguments);
    }

    if (replaceDeclaration) {
      j(path).replaceWith(replaceDeclaration);
    }
  });

  return ast.toSource();
}

function exports2Export(code) {
  let ast = j(code, { parser });

  ast.find(j.ExpressionStatement, findExports).forEach((path) => {
    const { left, right } = path.value.expression;
    let replaceDeclaration;

    if (right.type === j.Identifier.name) {
      // eg. module.exports = a
      const varName = right.name;

      const replaceDeclarationTemplate = template(
        `export default %%varName%%; `
      );
      replaceDeclaration = replaceDeclarationTemplate({
        varName,
      });
    } else if (right.type === j.ObjectExpression.name) {
      // eg. module.exports = { ... }
      const varNames = right.properties
        .map((property) => {
          const propertyKey = j(property.key).toSource();

          if (property.type === j.ObjectProperty.name) {
            if (
              property.key.type === j.Identifier.name &&
              property.value.type === j.Identifier.name
            ) {
              if (property.key.name === property.value.name) {
                // eg. module.exports = { b, c }
                return propertyKey;
              } else {
                // eg. module.exports = { d: aliasD }
                return `${property.value.name} as ${propertyKey}`;
              }
            } else if (
              property.key.type === j.Identifier.name &&
              property.value.type === j.ObjectPattern.name
            ) {
              // eg. module.exports = { e, f: {fA, fB} }
              return `${propertyKey}: {
                            ${property.value.properties
                              .map((p) => p.key.name)
                              .join(", ")}
                            }`;
            } else if (property.key.type === j.Literal.name) {
              // eg.
              // module.exports = {
              //   "package01": require("my-package")
              // };
              return `${propertyKey}: ${j(property.value).toSource()}`;
            } else {
              // eg.
              // module.exports = {
              //   root: true,
              //   extends: ["scratch", "scratch/es6"],
              //   env: {
              //     browser: true,
              //   },
              // };
              // @TODO 未覆盖的逻辑，直接使用右边的源码
              // debugger;
              // console.log("未覆盖的导出逻辑 1: ", right, property);
              return `${propertyKey}: ${j(property.value).toSource()}`;
            }
          } else if (property.type === j.SpreadElement.name) {
            // eg. module.exports = { ...a }
            // @TODO 无法直接转换，暂不处理
            // debugger;
            // console.log("未覆盖的导出逻辑 2: ", right, property);
          } else {
            // @TODO 未覆盖的逻辑
            // debugger;
            // console.log("未覆盖的导出逻辑 3: ", right, property);
          }
        })
        .join(", ");

      const replaceDeclarationTemplate = template(`
            export {
                %%varNames%%,
            }
            `);
      replaceDeclaration = replaceDeclarationTemplate({
        varNames,
      });
    } else if (right.type === j.NewExpression.name) {
      // eg. module.exports = new Abc()
      const calleeName = right.callee.name;
      const argumentsStr = right.arguments
        .map((arg) => j(arg).toSource())
        .join(", ");

      const replaceDeclarationTemplate = template(
        `export default new %%calleeName%%(%%argumentsStr%%); `
      );
      replaceDeclaration = replaceDeclarationTemplate({
        calleeName,
        argumentsStr,
      });
    } else if (right.type === j.CallExpression.name) {
      // eg. module.exports = fun(a, b)
      const calleeName = right.callee.name;
      const argumentsStr = right.arguments
        .map((arg) => j(arg).toSource())
        .join(", ");

      const replaceDeclarationTemplate = template(
        `export default %%calleeName%%(%%argumentsStr%%); `
      );
      replaceDeclaration = replaceDeclarationTemplate({
        calleeName,
        argumentsStr,
      });
    } else {
      // @TODO 未覆盖的逻辑
      // debugger;
      // console.log("未覆盖的导出逻辑 4: ", right);
    }

    if (replaceDeclaration) {
      j(path).replaceWith(replaceDeclaration);
    }
  });

  return ast.toSource();
}

function replaceDeclarationTemplate_ObjectPattern(option = { id: "" }) {
  // eg. const { ... } = require('my-package')
  const { id } = option;
  const varNames = id.properties
    .map((property) => {
      if (property.value.type === j.Identifier.name) {
        if (property.key.name === property.value.name) {
          // eg. const { b, c } = require('my-package')
          // to. import { b, c } from 'my-package'
          return property.key.name;
        } else {
          // eg. const { d: aliasD } = require('my-package')
          // to. import { d as aliasD } from 'my-package'
          return `${property.key.name} as ${property.value.name}`;
        }
      } else if (property.value.type === j.ObjectPattern.name) {
        // eg. const { e, f: {fA, fB} } = require('my-package')
        // @TODO 无法直接转换，暂不处理
        // debugger;
        // console.log("未覆盖的导入逻辑 1: ", id, property);
      } else {
        // @TODO 未覆盖的逻辑
        // debugger;
        // console.log("未覆盖的导入逻辑 2: ", id, property);
      }
    })
    .join(", ");

  return {
    varNames,
    template: template(`
    import { %%varNames%% } from %%importPath%%; 
    `),
  };
}

export { require2Import, exports2Export };
