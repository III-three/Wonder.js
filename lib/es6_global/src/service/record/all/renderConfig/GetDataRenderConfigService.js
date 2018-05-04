// Generated by BUCKLESCRIPT VERSION 2.1.0, PLEASE EDIT WITH CARE
'use strict';

import * as Caml_array                   from "../../../../../../../node_modules/bs-platform/lib/es6/caml_array.js";
import * as Log$WonderLog                from "../../../../../../../node_modules/wonder-log/lib/es6_global/src/Log.js";
import * as ArrayService$Wonderjs        from "../../../atom/ArrayService.js";
import * as StateDataMain$Wonderjs       from "../../../state/main/data/StateDataMain.js";
import * as JobConfigService$Wonderjs    from "../../../primitive/JobConfigService.js";
import * as IsDebugMainService$Wonderjs  from "../../../state/main/state/IsDebugMainService.js";
import * as ArrayService$WonderCommonlib from "../../../../../../../node_modules/wonder-commonlib/lib/es6_global/src/ArrayService.js";

function getShaders(param) {
  return param[/* shaders */0];
}

function getShaderLibs(param) {
  return param[/* shaderLibs */1];
}

function _findFirstShaderData(shaderLibName, shaderLibs) {
  return JobConfigService$Wonderjs.unsafeFindFirst(shaderLibs, shaderLibName, (function (item) {
                return JobConfigService$Wonderjs.filterTargetName(item[/* name */0], shaderLibName);
              }));
}

function _getMaterialShaderLibDataArrByGroup(groups, name, shaderLibs, resultDataArr) {
  return resultDataArr.concat(JobConfigService$Wonderjs.unsafeFindFirst(groups, name, (function (item) {
                        return JobConfigService$Wonderjs.filterTargetName(item[/* name */0], name);
                      }))[/* value */1].map((function (name) {
                    return _findFirstShaderData(name, shaderLibs);
                  })));
}

function _getMaterialShaderLibDataArrByStaticBranchInstance(param, param$1, resultDataArr) {
  var value = param$1[1];
  return ArrayService$Wonderjs.push(_findFirstShaderData(param[0] ? (
                    param[1] ? Caml_array.caml_array_get(value, 1) : Caml_array.caml_array_get(value, 2)
                  ) : Caml_array.caml_array_get(value, 0), param$1[0]), resultDataArr);
}

function _getMaterialShaderLibDataArrByStaticBranch(param, param$1, resultDataArr) {
  var staticBranchs = param$1[0];
  var name = param[0];
  var exit = 0;
  switch (name) {
    case "modelMatrix_instance" : 
    case "normalMatrix_instance" : 
        exit = 1;
        break;
    default:
      var partial_arg = "staticBranchs";
      Log$WonderLog.debugJson((function (param) {
              return Log$WonderLog.buildDebugJsonMessage(partial_arg, staticBranchs, param);
            }), IsDebugMainService$Wonderjs.getIsDebug(StateDataMain$Wonderjs.stateData));
      return Log$WonderLog.fatal(Log$WonderLog.buildFatalMessage("_getMaterialShaderLibDataArrByStaticBranch", "unknown name:" + (String(name) + ""), "", "", ""));
  }
  if (exit === 1) {
    var match = JobConfigService$Wonderjs.unsafeFindFirst(staticBranchs, name, (function (item) {
            return JobConfigService$Wonderjs.filterTargetName(item[/* name */0], name);
          }));
    return _getMaterialShaderLibDataArrByStaticBranchInstance(/* tuple */[
                param[1],
                param[2]
              ], /* tuple */[
                param$1[1],
                match[/* value */1]
              ], resultDataArr);
  }
  
}

function _getMaterialShaderLibDataArrByType(param, param$1, resultDataArr) {
  var shaderLibs = param$1[0];
  var name = param[2];
  var type_ = param[0];
  switch (type_) {
    case "group" : 
        return _getMaterialShaderLibDataArrByGroup(param[1], name, shaderLibs, resultDataArr);
    case "static_branch" : 
        return _getMaterialShaderLibDataArrByStaticBranch(/* tuple */[
                    name,
                    param[3],
                    param[4]
                  ], /* tuple */[
                    param$1[1],
                    shaderLibs
                  ], resultDataArr);
    default:
      var partial_arg = "shaderLibs";
      Log$WonderLog.debugJson((function (param) {
              return Log$WonderLog.buildDebugJsonMessage(partial_arg, shaderLibs, param);
            }), IsDebugMainService$Wonderjs.getIsDebug(StateDataMain$Wonderjs.stateData));
      return Log$WonderLog.fatal(Log$WonderLog.buildFatalMessage("_getMaterialShaderLibDataArrByType", "unknown type_:" + (String(type_) + ""), "", "", ""));
  }
}

function getMaterialShaderLibDataArr(isSourceInstance, isSupportInstance, param) {
  var shaderLibs = param[2];
  var match = param[0];
  var groups = match[/* groups */1];
  var staticBranchs = match[/* staticBranchs */0];
  return ArrayService$WonderCommonlib.reduceOneParam((function (resultDataArr, param) {
                var name = param[/* name */1];
                var type_ = param[/* type_ */0];
                if (type_) {
                  return _getMaterialShaderLibDataArrByType(/* tuple */[
                              type_[0],
                              groups,
                              name,
                              isSourceInstance,
                              isSupportInstance
                            ], /* tuple */[
                              shaderLibs,
                              staticBranchs
                            ], resultDataArr);
                } else {
                  return ArrayService$Wonderjs.push(_findFirstShaderData(name, shaderLibs), resultDataArr);
                }
              }), ArrayService$WonderCommonlib.createEmpty(/* () */0), param[1]);
}

export {
  getShaders                                         ,
  getShaderLibs                                      ,
  _findFirstShaderData                               ,
  _getMaterialShaderLibDataArrByGroup                ,
  _getMaterialShaderLibDataArrByStaticBranchInstance ,
  _getMaterialShaderLibDataArrByStaticBranch         ,
  _getMaterialShaderLibDataArrByType                 ,
  getMaterialShaderLibDataArr                        ,
  
}
/* Log-WonderLog Not a pure module */