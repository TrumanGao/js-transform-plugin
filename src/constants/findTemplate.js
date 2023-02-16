import j from "jscodeshift";

// 不区分导入语法，减少循环优化性能
const findRequire = {
  declarations: [
    {
      init: {
        callee: {
          name: "require",
        },
      },
    },
  ],
};

const findRequireExpression = {
  expression: {
    type: j.CallExpression.name,
    callee: {
      name: "require",
    },
  },
};

// 不区分导出语法，减少循环优化性能
const findExports = {
  expression: {
    operator: "=",
    left: {
      type: j.MemberExpression.name,
      object: {
        type: j.Identifier.name,
        name: "module",
      },
      property: {
        type: j.Identifier.name,
        name: "exports",
      },
    },
  },
};

export { findRequire, findRequireExpression, findExports };
