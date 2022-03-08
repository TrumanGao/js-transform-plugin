'use strict';

var fs = require('fs');
var path = require('path');
var j = require('jscodeshift');
var babel = require('@babel/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var j__default = /*#__PURE__*/_interopDefaultLegacy(j);
var babel__default = /*#__PURE__*/_interopDefaultLegacy(babel);

var findRequire = {
  declarations: [{
    init: {
      callee: {
        name: 'require'
      }
    }
  }]
}; // 不区分导出语法，减少循环优化性能

var findExports = {
  expression: {
    operator: '=',
    left: {
      type: j__default["default"].MemberExpression.name,
      object: {
        type: j__default["default"].Identifier.name,
        name: 'module'
      },
      property: {
        type: j__default["default"].Identifier.name,
        name: 'exports'
      }
    }
  }
};

var template = babel__default["default"].template;

function require2Import(code) {
  console.log('进入引入变量函数');
  var ast = j__default["default"](code, {
    parser: require('recast/parsers/typescript')
  }); // console.log('引入变量 ast：', ast);

  ast.find(j__default["default"].VariableDeclaration, findRequire).forEach(function (path) {
    var _path$value$declarati = path.value.declarations[0],
        id = _path$value$declarati.id,
        init = _path$value$declarati.init;
    var importPath = init.arguments[0].value;
    var replaceDeclaration; // 用于替换的表达式

    console.log('导入变量');

    if (path.parent.value.type === 'Program') {
      // 根节点引入，转为 import
      if (id.type === j__default["default"].Identifier.name) {
        // const a = require('a')
        console.log('导入单个', j__default["default"].Identifier);
        var varName = id.name;
        var replaceDeclarationTemplate = template("\n                import { %%varName%% } from %%importPath%%\n                ");
        replaceDeclaration = replaceDeclarationTemplate({
          varName: varName,
          importPath: importPath
        });
      } else if (id.type === j__default["default"].ObjectPattern.name) {
        // const { b, c } = require('bc')
        console.log('导入多个', j__default["default"].ObjectPattern);
        var varNames = id.properties.map(function (property) {
          return property.key.name;
        }).join(',');

        var _replaceDeclarationTemplate = template("\n                import { %%varNames%% } from %%importPath%%\n                ");

        replaceDeclaration = _replaceDeclarationTemplate({
          varNames: varNames,
          importPath: importPath
        });
      }
    }

    if (replaceDeclaration) {
      j__default["default"](path).replaceWith(replaceDeclaration);
    }
  });
  return ast.toSource();
} // 导出变量

function exports2Export(code) {
  console.log('进入导出变量函数');
  var ast = j__default["default"](code, {
    parser: require('recast/parsers/typescript')
  }); // console.log('导出变量 ast：', ast);

  ast.find(j__default["default"].ExpressionStatement, findExports).forEach(function (path) {
    var _path$value$expressio = path.value.expression;
        _path$value$expressio.left;
        var right = _path$value$expressio.right;
    var replaceDeclaration;
    console.log('导出变量');

    if (right.type === j__default["default"].Identifier.name) {
      // module.exports = a
      console.log('导出单个', j__default["default"].Identifier);
      var varName = right.name;
      var replaceDeclarationTemplate = template("\n            export { \n                %%varName%%,\n            } \n            ");
      replaceDeclaration = replaceDeclarationTemplate({
        varName: varName
      });
    } else if (right.type === j__default["default"].ObjectExpression.name) {
      // module.exports = { a, b }
      console.log('导出多个', j__default["default"].ObjectExpression);
      var varNames = right.properties.map(function (property) {
        return property.key.name;
      }).join(', ');

      var _replaceDeclarationTemplate2 = template("\n            export {\n                %%varNames%%,\n            }\n            ");

      replaceDeclaration = _replaceDeclarationTemplate2({
        varNames: varNames
      });
    } else if (right.type === j__default["default"].NewExpression.name) {
      // module.exports = new Abc()
      console.log('导出类的实例化', j__default["default"].NewExpression);
      var calleeName = right.callee.name;

      var _varName = "".concat(calleeName.charAt(0).toLocaleLowerCase()).concat(calleeName.slice(1));

      var argumentsStr = right.arguments.map(function (arg) {
        return arg.name;
      }).join(', ');

      var _replaceDeclarationTemplate3 = template("export const %%varName%% = new %%calleeName%%(%%argumentsStr%%)");

      replaceDeclaration = _replaceDeclarationTemplate3({
        calleeName: calleeName,
        varName: _varName,
        argumentsStr: argumentsStr
      });
    }

    if (replaceDeclaration) {
      j__default["default"](path).replaceWith(replaceDeclaration);
    }
  });
  return ast.toSource();
}

function readFile() {
  var argvPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "".concat(process.cwd(), "\\src");
  fs__default["default"].readdir(argvPath, function (err, files) {
    if (err) {
      throw err;
    }

    files.forEach(function (file) {
      var fPath = path__default["default"].join(argvPath, file);
      fs__default["default"].stat(fPath, function (err, stat) {
        if (err) {
          throw err;
        }

        if (stat.isFile()) {
          console.log('访问文件：', fPath);

          if (/\.(j|t)s$/.test(fPath)) {
            var code = fs__default["default"].readFileSync(fPath, {
              encoding: 'utf8'
            }); // console.log('当前遍历的文件内容', code);

            var result = [require2Import, exports2Export].reduce(function (code, currentFn) {
              return currentFn(code);
            }, code); // console.log('当前遍历的文件编译结果', result);

            fs__default["default"].writeFile(fPath, result, 'utf8', function (err) {
              if (err) {
                console.log('写入错误 err：', err);
              }
            });
          } else {
            console.log('访问文件 - 文件未通过校验', fPath);
          }
        } else {
          console.log('访问文件夹：', fPath);
          readFile(fPath);
        }
      });
    });
  });
}

var argvs = process.argv.slice(2);
var argvPath = argvs[0]; // 参数一：路径

readFile(argvPath);
//# sourceMappingURL=index.js.map
