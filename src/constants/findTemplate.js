import j from 'jscodeshift';

// 不区分引入语法，减少循环优化性能
export const findRequire = {
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
export const findExports = {
    expression: {
        operator: '=',
        left: {
            type: j.MemberExpression,
            object: {
                type: j.Identifier,
                name: 'module',
            },
            property: {
                type: j.Identifier,
                name: 'exports',
            },
        },
    },
};
