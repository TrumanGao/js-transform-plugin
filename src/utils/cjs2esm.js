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
    const importPath = init.arguments[0]?.value;
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
    const importPath = _arguments[0]?.value;
    let replaceDeclaration; // 用于替换的表达式

    if (path.parent.value.type === "Program") {
      // 根节点导入

      // eg. require('my-package');
      // to. import 'my-package';
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

    if (right.type === j.ObjectExpression.name) {
      // eg. module.exports = { ... }
      // to. export { ... } 或 export default { ... }
      // 取决于 { ... } 是否包含表达式，esmodule 不支持 export { ... } 导出表达式。

      const hasExpression = right.properties.some(
        (property) =>
          j(property.key).toSource() !== j(property.value).toSource()
      );

      if (hasExpression) {
        const rigthSource = j(right).toSource();

        const replaceDeclarationTemplate = template(
          `export default %%rigthSource%%`
        );
        replaceDeclaration = replaceDeclarationTemplate({
          rigthSource,
        });
      } else {
        const varNames = right.properties
          .map((property) => property.key.name)
          .join(", ");

        const replaceDeclarationTemplate = template(`
          export {
              %%varNames%%
          }
          `);
        replaceDeclaration = replaceDeclarationTemplate({
          varNames,
        });
      }
    } else if (
      right.type === j.Identifier.name ||
      right.type === j.NewExpression.name ||
      right.type === j.CallExpression.name ||
      right.type === j.FunctionExpression.name ||
      right.type === j.ArrowFunctionExpression.name
    ) {
      // eg. module.exports = a
      // eg. module.exports = new Abc()
      // eg. module.exports = fun(a, b)
      // eg. module.exports = function(){}
      // eg. module.exports = ()=>{}

      const rightSource = j(right).toSource();
      const replaceDeclarationTemplate = template(
        `export default %%rightSource%%`
      );
      replaceDeclaration = replaceDeclarationTemplate({
        rightSource,
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
