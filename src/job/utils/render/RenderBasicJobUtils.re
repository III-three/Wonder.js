let _getShaderIndex = (materialIndex, state) =>
  ShaderIndexRenderService.getShaderIndex(
    materialIndex,
    ShaderIndexBasicMaterialRenderService.getShaderIndex,
    state,
  );

let render =
    (
      gl,
      (
        renderArray,
        transformIndices,
        materialIndices,
        meshRendererIndices,
        geometryIndices,
        sourceInstanceIndices,
      ),
      state,
    ) =>
  renderArray
  |> WonderCommonlib.ArrayService.reduceOneParam(
       (. state, index) => {
         let transformIndex =
           RenderObjectBufferTypeArrayService.getComponent(
             index,
             transformIndices,
           );
         let materialIndex =
           RenderObjectBufferTypeArrayService.getComponent(
             index,
             materialIndices,
           );
         let shaderIndex = _getShaderIndex(materialIndex, state);
         let meshRendererIndex =
           RenderObjectBufferTypeArrayService.getComponent(
             index,
             meshRendererIndices,
           );
         let geometryIndex =
           RenderObjectBufferTypeArrayService.getComponent(
             index,
             geometryIndices,
           );
         let sourceInstance =
           RenderObjectBufferTypeArrayService.getComponent(
             index,
             sourceInstanceIndices,
           );
         if (RenderObjectBufferTypeArrayService.hasSourceInstance(
               sourceInstance,
             )) {
           RenderBasicInstanceJobCommon.render(
             gl,
             (
               transformIndex,
               materialIndex,
               shaderIndex,
               meshRendererIndex,
               geometryIndex,
               sourceInstance,
             ),
             state,
           );
         } else {
           let state =
             RenderBasicJobCommon.render(.
               gl,
               (
                 transformIndex,
                 materialIndex,
                 shaderIndex,
                 meshRendererIndex,
                 geometryIndex,
               ),
               state,
             );
           RenderJobUtils.draw(
             gl,
             meshRendererIndex,
             geometryIndex,
             state,
           );
           state;
         };
       },
       state,
     );