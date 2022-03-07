import j from 'jscodeshift';
import babel from '@babel/core';
const { template } = babel;
import { findRequire, findExports } from '../constants/findTemplate.js';

// 引入变量
export function require2Import (code) {
    const ast = j(code);

    ast.find(j.VariableDeclaration, findRequire).forEach(path => {
        const { id, init } = path.value.declarations[0];
        const importPath = init.arguments[0].value;
        let replaceDeclaration; // 用于替换的表达式

        if (path.parent.value.type === 'Program') {
            // 根节点引入，转为 import

            if (id.type === j.Identifier) {
                // const a = require('a')
                const varName = id.name;

                replaceDeclaration = j.importDeclaration(
                    [ j.importSpecifier(j.identifier(varName), j.identifier(varName)) ],
                    j.stringLiteral(importPath),
                );
            } else if (id.type === j.ObjectPattern) {
                // const { b, c } = require('bc')
                const varNames = id.properties.map(property => property.key.name).join(',');

                const replaceDeclarationTemplate = template(`
                import { %%varNames%% } from %%importPath%%
                `);
                replaceDeclaration = replaceDeclarationTemplate({
                    varNames,
                    importPath,
                });
            }
        } else {
            // 嵌套引入，转为 import()
        }

        // console.log('新创建的表达式：replaceDeclaratino', replaceDeclaration);
        if (replaceDeclaration) {
            j(path).replaceWith(replaceDeclaration);
        }
    });

    return ast.toSource();
}

// 导出变量
export function exports2Export (code) {
    let ast = j(code);

    ast.find(j.ExpressionStatement, findExports).forEach(path => {
        const { left, right } = path.value.expression;
        let replaceDeclaration;

        if (right.type === j.Identifier) {
            // module.exports = a
            const varName = right.name;

            const replaceDeclarationTemplate = template(`
            export { 
                %%varName%%,
            } 
            `);
            replaceDeclaration = replaceDeclarationTemplate({
                varName,
            });
        } else if (right.type === j.ObjectExpression) {
            // module.exports = { a, b }
            const varNames = right.properties.map(property => property.key.name).join(', ');

            const replaceDeclarationTemplate = template(`
            export { 
                %%varNames%%,
            }
            `);
            replaceDeclaration = replaceDeclarationTemplate({
                varNames,
            });
        } else if (right.type === j.NewExpression) {
            // module.exports = new Abc()
            const calleeName = right.callee.name;
            const varName = `${calleeName.charAt(0).toLocaleLowerCase()}${calleeName.slice(1)}`;
            const argumentsStr = right.arguments.map(arg => arg.name).join(', ');

            const replaceDeclarationTemplate = template(
                `export const %%varName%% = new %%calleeName%%(%%argumentsStr%%)`,
            );
            replaceDeclaration = replaceDeclarationTemplate({
                calleeName,
                varName,
                argumentsStr,
            });
        }

        // console.log('新创建的表达式：replaceDeclaratino', replaceDeclaration);
        if (replaceDeclaration) {
            j(path).replaceWith(replaceDeclaration);
        }
    });

    return ast.toSource();
}
