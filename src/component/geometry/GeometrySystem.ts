import { GPUDetector } from "../../renderer/device/GPUDetector";
import { ensureFunc, it, requireCheckFunc } from "../../definition/typescript/decorator/contract";
import { Geometry } from "./Geometry";
import { Map } from "immutable";
import { EBufferType } from "../../renderer/enum/EBufferType";
import {
    createMap, deleteBySwap as deleteObjectBySwap, deleteVal, isNotValidMapValue,
    isValidMapValue
} from "../../utils/objectUtils";
import {
    addAddComponentHandle as addAddComponentHandleToMap, addComponentToGameObjectMap,
    addDisposeHandle as addDisposeHandleToMap, addInitHandle as addInitHandleToMap, deleteComponentBySwap,
    generateComponentIndex, getComponentGameObject
} from "../ComponentSystem";
import { GameObject } from "../../core/entityObject/gameObject/GameObject";
import { EDrawMode } from "../../renderer/enum/EDrawMode";
import { checkIndexShouldEqualCount } from "../utils/contractUtils";
import { GeometryData } from "./GeometryData";
import { createSharedArrayBufferOrArrayBuffer, getSubarray } from "../../utils/typeArrayUtils";
import { getIndexDataSize, getUIntArrayClass, getVertexDataSize } from "../../utils/geometryUtils";
import { GeometryInfoList, GeometryWorkerInfoList } from "../../definition/type/geometryType";
import { isDisposeTooManyComponents, reAllocateGeometryMap } from "../../utils/memoryUtils";
import { isSupportRenderWorkerAndSharedArrayBuffer } from "../../device/WorkerDetectSystem";
import {
    getDrawMode as getDrawModeUtils, getIndexType as getIndexTypeUtils, getIndexType as getIndexTypeUtils, getIndicesCount as getIndicesCountUtils, getVerticesCount as getVerticesCountUtils,
    hasIndices as hasIndicesUtils
} from "../../renderer/utils/geometry/geometryUtils";

export var addAddComponentHandle = (_class: any) => {
    addAddComponentHandleToMap(_class, addComponent);
}

export var addDisposeHandle = (_class: any) => {
    addDisposeHandleToMap(_class, disposeComponent);
}

export var addInitHandle = (_class: any) => {
    addInitHandleToMap(_class, initGeometry);
}

export var create = requireCheckFunc((geometry: Geometry, GeometryData: any) => {
    // checkIndexShouldEqualCount(GeometryData);
}, (geometry: Geometry, GeometryData: any) => {
    var index = generateComponentIndex(GeometryData);

    geometry.index = index;

    GeometryData.count += 1;

    GeometryData.geometryMap[index] = geometry;

    return geometry;
})

export var init = (GeometryData: any, state: Map<any, any>) => {
    for (let i = 0, count = GeometryData.count; i < count; i++) {
        initGeometry(i, state);
    }

    _markIsInit(GeometryData);

    return state;
}

export var initGeometry = (index: number, state: Map<any, any>) => {
    var computeDataFunc = GeometryData.computeDataFuncMap[index];

    if (_isComputeDataFuncNotExist(computeDataFunc)) {
        return;
    }

    let {
        vertices,
        indices
    } = computeDataFunc(index, GeometryData);

    setVertices(index, vertices, GeometryData);

    setIndices(index, indices, GeometryData);
}

var _isComputeDataFuncNotExist = (func: Function) => isNotValidMapValue(func);

export var getVertices = (index: number, GeometryData: any) => {
    return _getPointData(index, GeometryData.vertices, GeometryData.verticesCacheMap, GeometryData.verticesInfoList);
}

export var setVertices = requireCheckFunc((index: number, vertices: Array<number>, GeometryData: any) => {
    // it("vertices should not already exist", () => {
    //     expect(GeometryData.verticesCacheMap[index]).not.exist;
    // });
}, (index: number, vertices: Array<number>, GeometryData: any) => {
    GeometryData.verticesOffset = _setPointData(index, vertices, getVertexDataSize(), GeometryData.vertices, GeometryData.verticesCacheMap, GeometryData.verticesInfoList, GeometryData.verticesWorkerInfoList, GeometryData.verticesOffset, GeometryData);
})

export var getIndices = (index: number, GeometryData: any) => {
    return _getPointData(index, GeometryData.indices, GeometryData.indicesCacheMap, GeometryData.indicesInfoList);
}

export var setIndices = requireCheckFunc((index: number, indices: Array<number>, GeometryData: any) => {
    // it("indices should not already exist", () => {
    //     expect(GeometryData.indicesCacheMap[index]).not.exist;
    // });
}, (index: number, indices: Array<number>, GeometryData: any) => {
    GeometryData.indicesOffset = _setPointData(index, indices, getIndexDataSize(), GeometryData.indices, GeometryData.indicesCacheMap, GeometryData.indicesInfoList, GeometryData.indicesWorkerInfoList, GeometryData.indicesOffset, GeometryData);
})

var _getPointData = (index: number, points:Float32Array | Uint16Array | Uint32Array, cacheMap: object, infoList:object) => {
    var dataArr = cacheMap[index];

    if(isValidMapValue(dataArr)){
        return dataArr;
    }

    let info = infoList[index];

    dataArr = getSubarray(points, info.startIndex, info.endIndex);

    cacheMap[index] = dataArr;

    return dataArr;
}

var _setPointData = requireCheckFunc (() => {
    ////todo unit test: if set after init and has render worker, contract error
    //todo unit test: test allow set after init and has render worker
    // it("should not set point data after init", () => {
    //     expect(GeometryData.isInit).false;
    // });
}, (index: number, dataArr:Array<number>, dataSize:number, points:Float32Array | Uint16Array | Uint32Array, cacheMap:object, infoList:GeometryInfoList, workerInfoList:GeometryWorkerInfoList, offset:number, GeometryData:any) => {
    var count = dataArr.length,
        startIndex = offset;

    offset += count;

    infoList[index] = _buildInfo(startIndex, offset);

    _fillTypeArr(points, dataArr, startIndex, count);

    _removeCache(index, cacheMap);

    //todo judge whether support worker
    if(_isInit(GeometryData)){
        _addWorkerInfo(workerInfoList, index, startIndex, offset);
    }

    return offset;
})

var _fillTypeArr = (typeArr: Float32Array | Uint32Array | Uint16Array, dataArr: Array<number>, startIndex: number, count: number) => {
    for (let i = 0; i < count; i++) {
        typeArr[i + startIndex] = dataArr[i];
    }
}

var _removeCache = (index:number, cacheMap:object) => {
    deleteVal(index, cacheMap);
}

var _buildInfo = (startIndex: number, endIndex:number) => {
    return {
        startIndex:startIndex,
        endIndex:endIndex
    }
}

export var addComponent = (component: Geometry, gameObject: GameObject) => {
    addComponentToGameObjectMap(GeometryData.gameObjectMap, component.index, gameObject);
}

export var disposeComponent = ensureFunc((returnVal, component: Geometry) => {
    // checkIndexShouldEqualCount(GeometryData);
}, (component: Geometry) => {
    var sourceIndex = component.index;

    deleteVal(sourceIndex, GeometryData.gameObjectMap);

    GeometryData.count -= 1;
    GeometryData.disposeCount += 1;
    GeometryData.isReallocate = false;

    if (isDisposeTooManyComponents(GeometryData.disposeCount) || _isBufferNearlyFull(GeometryData)) {
        reAllocateGeometryMap(GeometryData);

        clearWorkerInfoList(GeometryData);
        GeometryData.isReallocate = true;

        GeometryData.disposeCount = 0;
    }
})

export var isReallocate = (GeometryData:any) => {
    return GeometryData.isReallocate;
}

var _isBufferNearlyFull = (GeometryData:any) => {
    var infoList = GeometryData.indicesInfoList;

    return infoList[infoList.length - 1].endIndex >= GeometryData.maxDisposeIndex;
}

export var getGameObject = (index: number, Data: any) => {
    return getComponentGameObject(Data.gameObjectMap, index);
}

export var getConfigData = (index: number, GeometryData: any) => {
    return GeometryData.configDataMap[index];
}

// var _createVerticesTypeArray = () => {
//     var count = DataBufferConfig.geometryDataBufferCount,
//         size = Float32Array.BYTES_PER_ELEMENT * 3 + indicesArrayBytes * 1;
//
//     GeometryData.vertices = new Float32Array(buffer, 0, count * getVertexDataSize());
// }

var _checkIsIndicesBufferNeed32BitsByConfig = (DataBufferConfig: any) => {
    if (DataBufferConfig.geometryIndicesBufferBits === 16) {
        return false;
    }

    //todo refactor: use function
    return GPUDetector.getInstance().extensionUintIndices === true;
}

export var isIndicesBufferNeed32BitsByData = (GeometryData: any) => {
    return GeometryData.indexType === EBufferType.UNSIGNED_INT;
}


var _markIsInit = (GeometryData: any) => {
    GeometryData.isInit = true;
}

var _isInit = (GeometryData: any) => {
    return GeometryData.isInit;
}

export var clearWorkerInfoList = (GeometryData:any) => {
    GeometryData.verticesWorkerInfoList = [];
    GeometryData.indicesWorkerInfoList = [];
}

export var hasNewPointData = (GeometryData:any) => {
    return GeometryData.verticesWorkerInfoList.length > 0;
}

var _addWorkerInfo = (infoList:GeometryWorkerInfoList, index:number, startIndex:number, endIndex:number) => {
    infoList.push(_buildWorkerInfo(index, startIndex, endIndex));
}

var _buildWorkerInfo = (index:number, startIndex: number, endIndex:number) => {
    return {
        index:index,
        startIndex:startIndex,
        endIndex:endIndex
    }
}

export var initData = (DataBufferConfig: any, GeometryData: any) => {
    var isIndicesBufferNeed32Bits = _checkIsIndicesBufferNeed32BitsByConfig(DataBufferConfig),
        indicesArrayBytes:number = null;

    if (isIndicesBufferNeed32Bits) {
        indicesArrayBytes = Uint32Array.BYTES_PER_ELEMENT;

        GeometryData.indexType = EBufferType.UNSIGNED_INT;
    }
    else {
        indicesArrayBytes = Uint16Array.BYTES_PER_ELEMENT;

        GeometryData.indexType = EBufferType.UNSIGNED_SHORT;
    }

    GeometryData.indexTypeSize = indicesArrayBytes;

    GeometryData.configDataMap = createMap();

    GeometryData.verticesCacheMap = createMap();
    GeometryData.indicesCacheMap = createMap();

    GeometryData.computeDataFuncMap = createMap();

    GeometryData.gameObjectMap = createMap();

    GeometryData.geometryMap = createMap();

    GeometryData.index = 0;
    GeometryData.count = 0;

    _initBufferData(indicesArrayBytes, getUIntArrayClass(GeometryData.indexType), DataBufferConfig, GeometryData);

    GeometryData.verticesInfoList = [];
    GeometryData.indicesInfoList = [];

    GeometryData.verticesWorkerInfoList = [];
    GeometryData.indicesWorkerInfoList = [];

    GeometryData.verticesOffset = 0;
    GeometryData.indicesOffset = 0;

    GeometryData.disposeCount = 0;

    GeometryData.isReallocate = false;
}

var _initBufferData = (indicesArrayBytes:number, UintArray:any, DataBufferConfig: any, GeometryData: any) => {
    var buffer: any = null,
        count = DataBufferConfig.geometryDataBufferCount,
        size = Float32Array.BYTES_PER_ELEMENT * 3 + indicesArrayBytes * 1;

    buffer = createSharedArrayBufferOrArrayBuffer(count * size);

    GeometryData.vertices = new Float32Array(buffer, 0, count * getVertexDataSize());
    GeometryData.indices = new UintArray(buffer, count * getVertexDataSize(), count * getIndexDataSize());

    GeometryData.buffer = buffer;

    GeometryData.maxDisposeIndex = GeometryData.indices.length * 0.9;
}

export var getIndexType = null;

export var getIndexTypeSize = null;

export var hasIndices = null;

export var getDrawMode = null;

export var getVerticesCount = null;

export var getIndicesCount = null;

if(!isSupportRenderWorkerAndSharedArrayBuffer()){
    getIndexType = getIndexTypeUtils;

    getIndexTypeSize = getIndexTypeUtils;

    hasIndices = (index: number, GeometryData: any) => hasIndicesUtils(index, getIndices, GeometryData);

    getDrawMode = getDrawModeUtils;

    getVerticesCount = (index: number, GeometryData: any) => getVerticesCountUtils(index, getVertices, GeometryData);

    getIndicesCount = (index: number, GeometryData: any) => getIndicesCountUtils(index, getIndices, GeometryData);
}
