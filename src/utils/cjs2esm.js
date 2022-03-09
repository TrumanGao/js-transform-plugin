const j = require('jscodeshift');
const { template } = require('@babel/core');
const { findRequire, findExports } = require('../constants/findTemplate.js');

// 导入变量
function require2Import (code) {
    console.log('进入导入变量函数');
    const ast = j(code, {
        parser: require('recast/parsers/typescript'),
    });
    // console.log('导入变量 ast：', ast);

    ast.find(j.VariableDeclaration, findRequire).forEach(path => {
        const { id, init } = path.value.declarations[0];
        const importPath = init.arguments[0].value;
        let replaceDeclaration; // 用于替换的表达式
        console.log('导入变量');

        if (path.parent.value.type === 'Program') {
            // 根节点导入，转为 import

            if (id.type === j.Identifier.name) {
                // const a = require('a')
                console.log('导入单个', j.Identifier);
                const varName = id.name;

                const replaceDeclarationTemplate = template(`
                import { %%varName%% } from %%importPath%%
                `);
                replaceDeclaration = replaceDeclarationTemplate({
                    varName,
                    importPath,
                });
            } else if (id.type === j.ObjectPattern.name) {
                // const { b, c } = require('bc')
                console.log('导入多个', j.ObjectPattern);
                const varNames = id.properties
                    .map(property => {
                        if (property.key.type === j.Identifier.name && property.value.type === j.Identifier.name) {
                            if (property.key.name === property.value.name) {
                                // const { b, c } = require('bc')
                                return property.key.name;
                            } else {
                                // const { a:aa } = require('bc')
                                return `${property.key.name} as ${property.value.name}`;
                            }
                        } else if (
                            property.key.type === j.Identifier.name &&
                            property.value.type === j.ObjectPattern.name
                        ) {
                            // const { b, c: {d, e} } = require('bc') 无法直接转换，暂不处理
                        }
                    })
                    .join(', ');

                const replaceDeclarationTemplate = template(`
                import { %%varNames%% } from %%importPath%%
                `);
                replaceDeclaration = replaceDeclarationTemplate({
                    varNames,
                    importPath,
                });
            }
        } else {
            // 嵌套导入，转为 import()
        }

        if (replaceDeclaration) {
            j(path).replaceWith(replaceDeclaration);
        }
    });

    return ast.toSource();
}

// 导出变量
function exports2Export (code) {
    console.log('进入导出变量函数');
    let ast = j(code, {
        parser: require('recast/parsers/typescript'),
    });
    // console.log('导出变量 ast：', ast);

    ast.find(j.ExpressionStatement, findExports).forEach(path => {
        const { left, right } = path.value.expression;
        let replaceDeclaration;
        console.log('导出变量');

        if (right.type === j.Identifier.name) {
            // module.exports = a
            console.log('导出单个', j.Identifier);
            const varName = right.name;

            const replaceDeclarationTemplate = template(`
            export { 
                %%varName%%,
            } 
            `);
            replaceDeclaration = replaceDeclarationTemplate({
                varName,
            });
        } else if (right.type === j.ObjectExpression.name) {
            // module.exports = { a, b }
            console.log('导出多个', j.ObjectExpression);
            const varNames = right.properties
                .map(property => {
                    if (property.type === j.ObjectProperty.name) {
                        // 键值对
                        if (property.key.type === j.Identifier.name && property.value.type === j.Identifier.name) {
                            if (property.key.name === property.value.name) {
                                // module.exports = { a }
                                return property.key.name;
                            } else {
                                // module.exports = { a: '123' }
                                return `${property.value.name} as ${property.key.name}`;
                            }
                        } else if (
                            property.key.type === j.Identifier.name &&
                            property.value.type === j.ObjectPattern.name
                        ) {
                            // module.exports = { a: { b, c, d} }
                            return `${property.key.name}: {
                            ${property.value.properties.map(p => p.key.name).join(', ')}
                            }`;
                        }
                    } else if (property.type === j.SpreadElement.name) {
                        // module.exports = { ...a } 无法直接转换，暂不处理
                    } else {
                        // 暂不处理
                    }
                })
                .join(', ');

            const replaceDeclarationTemplate = template(`
            export {
                %%varNames%%,
            }
            `);
            replaceDeclaration = replaceDeclarationTemplate({
                varNames,
            });
        } else if (right.type === j.NewExpression.name) {
            // module.exports = new Abc()
            console.log('导出类的实例化', j.NewExpression);
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

        if (replaceDeclaration) {
            j(path).replaceWith(replaceDeclaration);
        }
    });

    return ast.toSource();
}

module.exports = {
    require2Import,
    exports2Export,
};
