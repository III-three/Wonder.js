// Generated by BUCKLESCRIPT VERSION 2.1.0, PLEASE EDIT WITH CARE
'use strict';

var GameObjectAPI$Wonderjs                           = require("../../../../src/api/GameObjectAPI.js");
var GameObjectTool$Wonderjs                          = require("../gameObject/GameObjectTool.js");
var LightMaterialAPI$Wonderjs                        = require("../../../../src/api/material/LightMaterialAPI.js");
var ShaderIndicesService$Wonderjs                    = require("../../../../src/service/primitive/material/ShaderIndicesService.js");
var JudgeInstanceMainService$Wonderjs                = require("../../../../src/service/state/main/instance/JudgeInstanceMainService.js");
var GroupLightMaterialService$Wonderjs               = require("../../../../src/service/record/main/material/light/GroupLightMaterialService.js");
var InitInitLightMaterialService$Wonderjs            = require("../../../../src/service/state/init_material/init_lightMaterial/material/InitInitLightMaterialService.js");
var InitLightMaterialMainService$Wonderjs            = require("../../../../src/service/state/main/material/light/InitLightMaterialMainService.js");
var RecordLightMaterialMainService$Wonderjs          = require("../../../../src/service/state/main/material/light/RecordLightMaterialMainService.js");
var ShaderIndexLightMaterialMainService$Wonderjs     = require("../../../../src/service/state/main/material/light/ShaderIndexLightMaterialMainService.js");
var CreateInitLightMaterialStateMainService$Wonderjs = require("../../../../src/service/state/main/material/light/CreateInitLightMaterialStateMainService.js");

var getRecord = RecordLightMaterialMainService$Wonderjs.getRecord;

function createGameObject(state) {
  var match = LightMaterialAPI$Wonderjs.createLightMaterial(state);
  var material = match[1];
  var match$1 = GameObjectAPI$Wonderjs.createGameObject(match[0]);
  var gameObject = match$1[1];
  var state$1 = GameObjectAPI$Wonderjs.addGameObjectLightMaterialComponent(gameObject, material, match$1[0]);
  return /* tuple */[
          state$1,
          gameObject,
          material
        ];
}

function createGameObjectWithMaterial(material, state) {
  var match = GameObjectAPI$Wonderjs.createGameObject(state);
  var gameObject = match[1];
  var state$1 = GameObjectAPI$Wonderjs.addGameObjectLightMaterialComponent(gameObject, material, match[0]);
  return /* tuple */[
          state$1,
          gameObject,
          material
        ];
}

function getDefaultShaderIndex(state) {
  return RecordLightMaterialMainService$Wonderjs.getRecord(state)[/* defaultShaderIndex */6];
}

function getDefaultDiffuseColor(state) {
  return RecordLightMaterialMainService$Wonderjs.getRecord(state)[/* defaultDiffuseColor */7];
}

function getDefaultSpecularColor(state) {
  return RecordLightMaterialMainService$Wonderjs.getRecord(state)[/* defaultSpecularColor */8];
}

function getDefaultShininess(state) {
  return RecordLightMaterialMainService$Wonderjs.getRecord(state)[/* defaultShininess */9];
}

function initMaterials(gl, state) {
  var gameObjectRecord = state[/* gameObjectRecord */10];
  var match = RecordLightMaterialMainService$Wonderjs.getRecord(state);
  var index = match[/* index */0];
  InitInitLightMaterialService$Wonderjs.init(gl, /* tuple */[
        JudgeInstanceMainService$Wonderjs.buildMap(index, RecordLightMaterialMainService$Wonderjs.getRecord(state)[/* gameObjectMap */10], gameObjectRecord),
        JudgeInstanceMainService$Wonderjs.isSupportInstance(state)
      ], CreateInitLightMaterialStateMainService$Wonderjs.createInitMaterialState(/* tuple */[
            index,
            match[/* disposedIndexArray */12],
            match[/* shaderIndices */2]
          ], state));
  return state;
}

function getShaderIndex(materialIndex, state) {
  return ShaderIndicesService$Wonderjs.getShaderIndex(materialIndex, RecordLightMaterialMainService$Wonderjs.getRecord(state)[/* shaderIndices */2]);
}

function setShaderIndex(materialIndex, shaderIndex, state) {
  return ShaderIndexLightMaterialMainService$Wonderjs.setShaderIndex(materialIndex, shaderIndex, state);
}

function dispose(material, state) {
  return GameObjectTool$Wonderjs.disposeGameObjectLightMaterialComponent(-1, material, state);
}

var initMaterial = InitLightMaterialMainService$Wonderjs.handleInitComponent;

function isMaterialDisposed(material, state) {
  var match = RecordLightMaterialMainService$Wonderjs.getRecord(state);
  return +match[/* disposedIndexArray */12].includes(material);
}

function getGroupCount(material, state) {
  return GroupLightMaterialService$Wonderjs.getGroupCount(material, RecordLightMaterialMainService$Wonderjs.getRecord(state));
}

exports.getRecord                    = getRecord;
exports.createGameObject             = createGameObject;
exports.createGameObjectWithMaterial = createGameObjectWithMaterial;
exports.getDefaultShaderIndex        = getDefaultShaderIndex;
exports.getDefaultDiffuseColor       = getDefaultDiffuseColor;
exports.getDefaultSpecularColor      = getDefaultSpecularColor;
exports.getDefaultShininess          = getDefaultShininess;
exports.initMaterials                = initMaterials;
exports.getShaderIndex               = getShaderIndex;
exports.setShaderIndex               = setShaderIndex;
exports.dispose                      = dispose;
exports.initMaterial                 = initMaterial;
exports.isMaterialDisposed           = isMaterialDisposed;
exports.getGroupCount                = getGroupCount;
/* GameObjectAPI-Wonderjs Not a pure module */