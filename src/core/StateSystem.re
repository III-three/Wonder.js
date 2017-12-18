open StateDataType;

open RenderConfigParseUtils;

let getState = (stateData: stateData) : state => Js.Option.getExn(stateData.state);

let setState = (stateData: stateData, state: state) => {
  stateData.state = Some(state);
  state
};

let deepCopyState = (state: StateDataType.state) =>
  state
  |> MeshRendererAdmin.deepCopyState
  |> TransformAdmin.deepCopyState
  |> CameraControllerAdmin.deepCopyState
  |> GeometryAdmin.deepCopyState
  |> VboBufferSystem.deepCopyState
  |> GLSLSenderSystem.deepCopyState
  |> MaterialAdmin.deepCopyState
  |> ShaderSystem.deepCopyState
  |> ProgramSystem.deepCopyState
  |> GLSLLocationSystem.deepCopyState
  |> DeviceManagerSystem.deepCopyState
  |> TypeArrayPoolSystem.deepCopyState
  |> SourceInstanceAdmin.deepCopyState
  |> ObjectInstanceAdmin.deepCopyState
  |> GameObjectAdmin.deepCopyState
  |> ScheduleControllerSystem.deepCopyState;

let _getSharedData = (currentState: StateDataType.state) => {
  gl: [@bs] DeviceManagerSystem.getGl(currentState),
  float32ArrayPoolMap: TypeArrayPoolSystem.getFloat32ArrayPoolMap(currentState),
  uint16ArrayPoolMap: TypeArrayPoolSystem.getUint16ArrayPoolMap(currentState)
};

let restoreFromState =
    (stateData: stateData, currentState: StateDataType.state, targetState: StateDataType.state) => {
  let intersectShaderIndexDataArray =
    ShaderSystem.getIntersectShaderIndexDataArray(currentState, targetState);
  let sharedData = _getSharedData(currentState);
  let (targetState, sharedData) =
    targetState |> GeometryAdmin.restoreFromState(currentState, sharedData);
  let (targetState, sharedData) =
    targetState |> TransformAdmin.restoreFromState(currentState, sharedData);
  let (targetState, sharedData) =
    targetState |> SourceInstanceAdmin.restoreFromState(currentState, sharedData);
  let targetState = targetState |> DeviceManagerSystem.restoreFromState(currentState, sharedData);
  let gl = [@bs] DeviceManagerSystem.getGl(targetState);
  targetState
  |> TypeArrayPoolSystem.restoreFromState(currentState, sharedData)
  |> VboBufferSystem.restoreFromState(currentState)
  |> ShaderSystem.restoreFromState(currentState)
  |> ProgramSystem.restoreFromState(intersectShaderIndexDataArray, currentState)
  |> GLSLLocationSystem.restoreFromState(intersectShaderIndexDataArray, currentState)
  |> GLSLSenderSystem.restoreFromState(intersectShaderIndexDataArray, currentState)
  |> MaterialAdmin.restoreFromState(gl, currentState)
  |> RenderDataSystem.restoreFromState(currentState)
  |> GlobalTempSystem.restoreFromState(currentState)
  |> setState(stateData)
};

/* let createState = (( render_setting, init_pipelines, render_pipelines, init_jobs, render_jobs, shaders, shader_libs )) => { */
let createState =
    /* ~renderConfig=(
         Render_setting.render_setting,
         Init_pipelines.init_pipelines,
         Render_pipelines.render_pipelines,
         Init_jobs.init_jobs,
         Render_jobs.render_jobs,
         Shaders.shaders,
         Shader_libs.shader_libs
       ), */
    (
      ~renderConfig=(
                      Render_setting.render_setting,
                      Init_pipelines.init_pipelines,
                      Render_pipelines.render_pipelines,
                      Init_jobs.init_jobs,
                      Render_jobs.render_jobs,
                      Shaders.shaders,
                      Shader_libs.shader_libs
                    ),
      ()
    ) => {
  let (
    render_setting,
    init_pipelines,
    render_pipelines,
    init_jobs,
    render_jobs,
    shaders,
    shader_libs
  ) = renderConfig;
  {
    bufferConfig: None,
    memoryConfig: MemoryConfigSystem.initData(),
    renderConfig: {
      jobHandleMap: JobHandleSystem.createJobHandleMap(),
      render_setting: convertRenderSettingToRecord(render_setting),
      init_pipelines: convertInitPipelinesToRecord(init_pipelines),
      render_pipelines: convertRenderPipelinesToRecord(render_pipelines),
      init_jobs: convertInitJobsToRecord(init_jobs),
      render_jobs: convertRenderJobsToRecord(render_jobs),
      shaders: convertShadersToRecord(shaders),
      shader_libs: convertShaderLibsToRecord(shader_libs)
    },
    gpuDetectData: {extensionInstancedArrays: None, precision: None},
    viewData: {canvas: None, contextConfig: None},
    initConfig: {isTest: false},
    sourceInstanceData: SourceInstanceHelper.initData(),
    objectInstanceData: ObjectInstanceHelper.initData(),
    deviceManagerData: {gl: None, colorWrite: None, clearColor: None},
    gameObjectData: GameObjectHelper.initData(),
    transformData: None,
    cameraControllerData: CameraControllerHelper.initData(),
    materialData: None,
    geometryData: None,
    meshRendererData: MeshRendererHelper.initData(),
    shaderData: ShaderHelper.initData(),
    programData: ProgramHelper.initData(),
    glslLocationData: GLSLLocationHelper.initData(),
    glslSenderData: GLSLSenderHelper.initData(),
    glslChunkData: ShaderChunkSystem.initData(),
    renderData: RenderDataHelper.initData(),
    schedulerData: ScheduleControllerHelper.initData(),
    timeControllerData: TimeControllerHelper.initData(),
    vboBufferData: VboBufferHelper.initData(),
    globalTempData: GlobalTempHelper.initData(),
    typeArrayPoolData: TypeArrayPoolHelper.initData()
  }
};