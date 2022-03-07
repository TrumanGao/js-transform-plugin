import fs from 'fs';
import path from 'path';
import j from 'jscodeshift';
import babel from '@babel/core';

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
      type: j.MemberExpression,
      object: {
        type: j.Identifier,
        name: 'module'
      },
      property: {
        type: j.Identifier,
        name: 'exports'
      }
    }
  }
};

var template = babel.template;

function require2Import(code) {
  var ast = j(code);
  ast.find(j.VariableDeclaration, findRequire).forEach(function (path) {
    var _path$value$declarati = path.value.declarations[0],
        id = _path$value$declarati.id,
        init = _path$value$declarati.init;
    var importPath = init.arguments[0].value;
    var replaceDeclaration; // 用于替换的表达式

    if (path.parent.value.type === 'Program') {
      // 根节点引入，转为 import
      if (id.type === j.Identifier) {
        // const a = require('a')
        var varName = id.name;
        replaceDeclaration = j.importDeclaration([j.importSpecifier(j.identifier(varName), j.identifier(varName))], j.stringLiteral(importPath));
      } else if (id.type === j.ObjectPattern) {
        // const { b, c } = require('bc')
        var varNames = id.properties.map(function (property) {
          return property.key.name;
        }).join(',');
        var replaceDeclarationTemplate = template("\n                import { %%varNames%% } from %%importPath%%\n                ");
        replaceDeclaration = replaceDeclarationTemplate({
          varNames: varNames,
          importPath: importPath
        });
      }
    } // console.log('新创建的表达式：replaceDeclaratino', replaceDeclaration);


    if (replaceDeclaration) {
      j(path).replaceWith(replaceDeclaration);
    }
  });
  return ast.toSource();
} // 导出变量

function exports2Export(code) {
  var ast = j(code);
  ast.find(j.ExpressionStatement, findExports).forEach(function (path) {
    var _path$value$expressio = path.value.expression;
        _path$value$expressio.left;
        var right = _path$value$expressio.right;
    var replaceDeclaration;

    if (right.type === j.Identifier) {
      // module.exports = a
      var varName = right.name;
      var replaceDeclarationTemplate = template("\n            export { \n                %%varName%%,\n            } \n            ");
      replaceDeclaration = replaceDeclarationTemplate({
        varName: varName
      });
    } else if (right.type === j.ObjectExpression) {
      // module.exports = { a, b }
      var varNames = right.properties.map(function (property) {
        return property.key.name;
      }).join(', ');

      var _replaceDeclarationTemplate = template("\n            export { \n                %%varNames%%,\n            }\n            ");

      replaceDeclaration = _replaceDeclarationTemplate({
        varNames: varNames
      });
    } else if (right.type === j.NewExpression) {
      // module.exports = new Abc()
      var calleeName = right.callee.name;

      var _varName = "".concat(calleeName.charAt(0).toLocaleLowerCase()).concat(calleeName.slice(1));

      var argumentsStr = right.arguments.map(function (arg) {
        return arg.name;
      }).join(', ');

      var _replaceDeclarationTemplate2 = template("export const %%varName%% = new %%calleeName%%(%%argumentsStr%%)");

      replaceDeclaration = _replaceDeclarationTemplate2({
        calleeName: calleeName,
        varName: _varName,
        argumentsStr: argumentsStr
      });
    } // console.log('新创建的表达式：replaceDeclaratino', replaceDeclaration);


    if (replaceDeclaration) {
      j(path).replaceWith(replaceDeclaration);
    }
  });
  return ast.toSource();
}

function readFile() {
  var argvPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "".concat(process.cwd(), "/src");
  console.log('传入的参数path', argvPath);
  fs.readdir(argvPath, function (err, files) {
    if (err) {
      throw err;
    }

    files.forEach(function (file) {
      var fPath = path.join(argvPath, file); // console.log('当前遍历的绝对路径', fPath);

      fs.stat(fPath, function (err, stat) {
        if (err) {
          throw err;
        }

        if (stat.isFile()) {
          if (/\.(j|t)s$/.test(fPath)) {
            var code = fs.readFileSync(fPath, {
              encoding: 'utf8'
            }); // console.log('当前遍历的文件内容', code);

            var result = require2Import(code);
            result = exports2Export(result);
            console.log('当前遍历的文件编译结果', result);
            fs.writeFile(fPath, result, 'utf8', function (err) {
              if (err) {
                console.log('写入错误 err：', err);
              }
            });
          }
        } else {
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
