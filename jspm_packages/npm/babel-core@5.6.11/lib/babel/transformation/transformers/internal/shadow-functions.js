/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _types = require("../../../types");

var t = _interopRequireWildcard(_types);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var metadata = {
  group: "builtin-trailing"
};

exports.metadata = metadata;
function remap(path, key, create) {
  // ensure that we're shadowed
  if (!path.inShadow()) return;

  var shadowed = path.node._shadowedFunctionLiteral;
  var currentFunction;

  var fnPath = path.findParent(function (path) {
    if (shadowed) {
      // only match our shadowed function parent
      if (path === shadowed) {
        // found our target reference function
        currentFunction = path;
        return true;
      } else {
        return false;
      }
    } else if (path.isFunction() || path.isProgram()) {
      // catch current function in case this is the shadowed one
      if (!currentFunction) currentFunction = path;

      return !path.is("shadow");
    } else {
      return false;
    }
  });

  // no point in realiasing if we're in this function
  if (fnPath === currentFunction) return;

  var cached = fnPath.getData(key);
  if (cached) return cached;

  var init = create();
  var id = path.scope.generateUidIdentifier(key);

  fnPath.setData(key, id);
  fnPath.scope.push({ id: id, init: init });

  return id;
}

var visitor = {
  ThisExpression: function ThisExpression() {
    return remap(this, "this", function () {
      return t.thisExpression();
    });
  },

  ReferencedIdentifier: function ReferencedIdentifier(node) {
    if (node.name === "arguments") {
      return remap(this, "arguments", function () {
        return t.identifier("arguments");
      });
    }
  }
};
exports.visitor = visitor;