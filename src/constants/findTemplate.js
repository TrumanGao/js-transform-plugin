const j = require('jscodeshift');

// 不区分导入语法，减少循环优化性能
const findRequire = {
    declarations: [
        {
            init: {
                callee: {
                    name: 'require',
                },
            },
        },
    ],
};

// 不区分导出语法，减少循环优化性能
const findExports = {
    expression: {
        operator: '=',
        left: {
            type: j.MemberExpression.name,
            object: {
                type: j.Identifier.name,
                name: 'module',
            },
            property: {
                type: j.Identifier.name,
                name: 'exports',
            },
        },
    },
};

module.exports = {
    findRequire,
    findExports,
};
