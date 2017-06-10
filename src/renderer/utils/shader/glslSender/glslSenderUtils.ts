import {
    SendAttributeConfigMap, SendUniformConfigMap, UniformCacheMap
} from "../../../shader/glslSender/GLSLSenderDataFromSystem";
import { forEach, hasDuplicateItems } from "../../../../utils/arrayUtils";
import { Vector3 } from "../../../../math/Vector3";
import { isConfigDataExist } from "../../renderConfigUtils";
import { error, info } from "../../../../utils/Log";
import { Matrix4 } from "../../../../math/Matrix4";
import {
    getUniformLocation, isUniformLocationNotExist
} from "../../../shader/location/LocationSystem";
import {
    ISendAttributeConfig, ISendUniformConfig,
    IShaderLibContentGenerator
} from "../../../data/shaderLib_generator";
import { MaterialShaderLibConfig } from "../../../data/material_config";
import { RenderCommand } from "../../../command/RenderCommand";
import { ensureFunc, it, requireCheckFunc } from "../../../../definition/typescript/decorator/contract";
import { expect } from "wonder-expect.js";
import { createMap, isNotValidMapValue } from "../../../../utils/objectUtils";
import { getColorArr3, getOpacity } from "../../../worker/material/MaterialWorkerSystem";
import { RenderCommandUniformData, UniformShaderLocationMap } from "../../../type/dataType";

export var getUniformData = (field: string, from: string, renderCommandUniformData: RenderCommandUniformData, MaterialWorkerData: any) => {
    var data: any = null;

    switch (from) {
        case "cmd":
            data = renderCommandUniformData[field];
            break;
        case "material":
            data = _getUnifromDataFromMaterial(field, renderCommandUniformData.materialIndex, MaterialWorkerData);
            break;
        default:
            error(true, info.FUNC_UNKNOW(`from:${from}`));
            break;
    }

    return data;
}

var _getUnifromDataFromMaterial = (field: string, materialIndex: number, MaterialWorkerData: any) => {
    var data: any = null;

    switch (field) {
        case "color":
            data = getColorArr3(materialIndex, MaterialWorkerData);
            break;
        case "opacity":
            data = getOpacity(materialIndex, MaterialWorkerData);
            break;
        default:
            error(true, info.FUNC_UNKNOW(`field:${field}`));
            break;
    }

    return data;
}

export var sendBuffer = (gl: WebGLRenderingContext, pos: number, buffer: WebGLBuffer, geometryIndex: number, GLSLSenderDataFromSystem: any, ArrayBufferData: any) => {
    var {
            size,
        type
        } = ArrayBufferData.bufferDataMap[geometryIndex],
        vertexAttribHistory = GLSLSenderDataFromSystem.vertexAttribHistory;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(pos, size, gl[type], false, 0, 0);

    if (vertexAttribHistory[pos] !== true) {
        gl.enableVertexAttribArray(pos);

        vertexAttribHistory[pos] = true;
    }
}

export var sendMatrix4 = (gl: WebGLRenderingContext, name: string, data: Float32Array, uniformLocationMap: UniformShaderLocationMap) => {
    _sendUniformData<Float32Array>(gl, name, data, uniformLocationMap, (pos, data) => {
        gl.uniformMatrix4fv(pos, false, data);
    })
}

export var sendVector3 = (gl: WebGLRenderingContext, shaderIndex: number, name: string, data: Array<number>, uniformCacheMap: UniformCacheMap, uniformLocationMap: UniformShaderLocationMap) => {
    var recordedData: any = _getUniformCache(shaderIndex, name, uniformCacheMap),
        x = data[0],
        y = data[1],
        z = data[2];

    if (recordedData && recordedData[0] == x && recordedData[1] == y && recordedData[2] == z) {
        return;
    }

    _setUniformCache(shaderIndex, name, data, uniformCacheMap);

    _sendUniformData<Array<number>>(gl, name, data, uniformLocationMap, (pos, data) => {
        gl.uniform3f(pos, x, y, z);
    })
}

export var sendFloat1 = requireCheckFunc((gl: WebGLRenderingContext, shaderIndex: number, name: string, data: number, uniformCacheMap: UniformCacheMap, uniformLocationMap: UniformShaderLocationMap) => {
    it("data should be number", () => {
        expect(data).be.a("number");
    });
}, (gl: WebGLRenderingContext, shaderIndex: number, name: string, data: number, uniformCacheMap: UniformCacheMap, uniformLocationMap: UniformShaderLocationMap) => {
    var recordedData: any = _getUniformCache(shaderIndex, name, uniformCacheMap);

    if (recordedData === data) {
        return;
    }

    _setUniformCache(shaderIndex, name, data, uniformCacheMap);

    _sendUniformData<number>(gl, name, data, uniformLocationMap, (pos, data) => {
        gl.uniform1f(pos, data);
    })
})

var _getUniformCache = (shaderIndex: number, name: string, uniformCacheMap: UniformCacheMap) => {
    var cache = uniformCacheMap[shaderIndex];

    if(_isCacheNotExist(cache)){
        cache = {};
        uniformCacheMap[shaderIndex] = cache;

        return null;
    }

    return cache[name];
}

var _isCacheNotExist = (cache:any) => isNotValidMapValue(cache);

var _setUniformCache = (shaderIndex: number, name: string, data: any, uniformCacheMap: UniformCacheMap) => {
    uniformCacheMap[shaderIndex][name] = data;
}

var _sendUniformData = <T>(gl: WebGLRenderingContext, name: string, data: T, uniformLocationMap: UniformShaderLocationMap, sendFunc: (pos: WebGLUniformLocation, data: T) => void) => {
    var pos = getUniformLocation(name, uniformLocationMap);

    if (isUniformLocationNotExist(pos)) {
        return;
    }

    sendFunc(pos, data);
}

export var addSendAttributeConfig = ensureFunc((returnVal, shaderIndex: number, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, sendAttributeConfigMap: SendAttributeConfigMap) => {
    it("sendAttributeConfigMap should not has duplicate attribute name", () => {
        expect(hasDuplicateItems(sendAttributeConfigMap[shaderIndex])).false;
    });
}, requireCheckFunc((shaderIndex: number, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, sendAttributeConfigMap: SendAttributeConfigMap) => {
    it("sendAttributeConfigMap[shaderIndex] should not be defined", () => {
        expect(sendAttributeConfigMap[shaderIndex]).not.exist;
    });
}, (shaderIndex: number, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, sendAttributeConfigMap: SendAttributeConfigMap) => {
    var sendDataArr: Array<ISendAttributeConfig> = [];

    forEach(materialShaderLibConfig, (shaderLibName: string) => {
        var sendData = shaderLibData[shaderLibName].send;

        if (isConfigDataExist(sendData) && isConfigDataExist(sendData.attribute)) {
            sendDataArr = sendDataArr.concat(sendData.attribute);
        }
    })

    sendAttributeConfigMap[shaderIndex] = sendDataArr;
}))

export var addSendUniformConfig = ensureFunc((returnVal, shaderIndex: number, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, sendUniformConfigMap: SendUniformConfigMap) => {
    it("sendUniformConfigMap should not has duplicate attribute name", () => {
        expect(hasDuplicateItems(sendUniformConfigMap[shaderIndex])).false;
    });
}, requireCheckFunc((shaderIndex: number, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, sendUniformConfigMap: SendUniformConfigMap) => {
    it("sendUniformConfigMap[shaderIndex] should not be defined", () => {
        expect(sendUniformConfigMap[shaderIndex]).not.exist;
    });
}, (shaderIndex: number, materialShaderLibConfig: MaterialShaderLibConfig, shaderLibData: IShaderLibContentGenerator, sendUniformConfigMap: SendUniformConfigMap) => {
    var sendDataArr: Array<ISendUniformConfig> = [];

    forEach(materialShaderLibConfig, (shaderLibName: string) => {
        var sendData = shaderLibData[shaderLibName].send;

        if (isConfigDataExist(sendData) && isConfigDataExist(sendData.uniform)) {
            sendDataArr = sendDataArr.concat(sendData.uniform);
        }
    })

    sendUniformConfigMap[shaderIndex] = sendDataArr;
}))

export var initData = (GLSLSenderDataFromSystem: any) => {
    GLSLSenderDataFromSystem.sendAttributeConfigMap = createMap();
    GLSLSenderDataFromSystem.sendUniformConfigMap = createMap();
    GLSLSenderDataFromSystem.vertexAttribHistory = [];
    GLSLSenderDataFromSystem.uniformCacheMap = createMap();
}
