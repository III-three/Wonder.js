/// <reference path="Camera.ts"/>
/// <reference path="Sprite.ts"/>
/// <reference path="Light.ts"/>
/// <reference path="Program.ts"/>
module Engine3D {
    declare var gl:any;

    export class Scene {
        constructor(camera) {
            this._camera = camera;
        }

        private _sprites:Sprite[] = null;
        private _pointLightArr:Light.PointLight[] = null;
        private _frameBuffer = null;
        //todo refactor, should be dynamic,not get here
        private _vpMatrix = null;


        private _scenesInFrameBuffer:Scene[] = null;
        get scenesInFrameBuffer(){
            return this._scenesInFrameBuffer;
        }
        set scenesInFrameBuffer(scenesInFrameBuffer:Scene[]){
            this._scenesInFrameBuffer = scenesInFrameBuffer;
        }

        private _camera:Camera = null;
        get camera(){
            return this._camera;
        }
        set camera(camera:Camera){
            this._camera = camera;
        }

        private _program:Program = null;
        get program(){
            return this._program;
        }
        set program(program:Program){
            this._program = program;
        }

        private _ambientColor:number[] = null;
        get ambientColor(){
            return this._ambientColor;
        }
        set ambientColor(ambientColor:number[]){
            this._ambientColor = ambientColor;
        }


        addSprites(spriteArr){
            this._sprites = this._sprites.concat(spriteArr);
        }

        addLight(pointLightArr){
            this._pointLightArr = pointLightArr;
        }

        onStartLoop(){
            this._sprites.forEach(x => x.onStartLoop());
        }
        onEndLoop(){
            this._sprites.forEach(x => x.onEndLoop());
        }

        run(){
            var self = this;

            this._program.use();

            this._sprites.forEach((sprite)=> {
                //draw in frameBuffer is before this draw
                //and already update in that draw!
                //todo refactor
                if(!self._frameBuffer){
                    sprite.update();
                }

                self._setData(sprite);

                sprite.draw(self._program);
            });
        }

    //{
    //    sceneArr: [sceneReflectBackground1, sceneReflectBackground2],
    //    vpMatrix: vpMatrix
    //}
        setFrameData(frameBuffer, data){
            this._frameBuffer = frameBuffer;
            this._scenesInFrameBuffer = data.sceneArr;
            //todo refactor, should be dynamic,not get here
            this._vpMatrix = data.vpMatrix;
        }
    //    scene4.setFrameData(fbo, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT,
    //{
    //    sceneArr: [sceneReflectBackground1, sceneReflectBackground2],
    //        vpMatrix: vpMatrix
    //}
    //);
drawScenesInFrameBuffer(){
    this._frameBuffer.bind();
    //gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT); // Set a viewport for FBO

    //gl.clearColor(0.2, 0.2, 0.4, 1.0); // Set clear color (the color is slightly changed)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear FBO



    this._scenesInFrameBuffer.forEach(function(scene){
        scene.drawInFrameBuffer();
    });


    this._frameBuffer.unBind();


}
        drawInFrameBuffer(){
            var self = this;

            this._program.use();



            this._sprites.forEach((sprite)=> {
                sprite.update();

                self._setData(sprite);

                sprite.draw(self._program);
            });

        }


        private _setData(sprite){
            var dataArr = [];
            var self = this;

            this.onSetData(sprite, this._program);

            if(sprite.buffers.vertexBuffer){
                dataArr.push({
                    name: "a_position",
                    buffer: sprite.buffers.vertexBuffer  ,
                    category: "attribute"
                });
            }
            if(sprite.buffers.texCoordBuffer){
                dataArr.push({
                    name: "a_texCoord",
                    buffer: sprite.buffers.texCoordBuffer ,
                    category: "attribute"
                });
            }
            if(sprite.buffers.normalBuffer){
                dataArr.push({
                    name: "a_normal",
                    buffer: sprite.buffers.normalBuffer ,
                    category: "attribute"
                });
            }

            if(this._hasLight()){
                var viewPos = this._camera.computeViewPosInWorldCoordinate();
                var normalMatrix = Math3D.Matrix.create();

                normalMatrix.setInverseOf(sprite.matrix);
                normalMatrix.transpose();


                dataArr = dataArr.concat([{
                    name:"u_normalMatrix",
                    type: Engine3D.DataType.FLOAT_MAT4,
                    val: normalMatrix.values,
                    category: "uniform"
                },
                    {
                        name:"u_mMatrix",
                        type: Engine3D.DataType.FLOAT_MAT4,
                        val: sprite.matrix.values,
                        category: "uniform"
                    },
                    {
                        name:"u_ambient",
                        type: Engine3D.DataType.FLOAT_3,
                        val: this._ambientColor,
                        category: "uniform"
                    },
                    {
                        name:"u_viewPos",
                        type: Engine3D.DataType.FLOAT_3,
                        val: viewPos,
                        category: "uniform"
                    }]);

                this._pointLightArr.forEach((light, index) => {
                    dataArr.push({
                        name:"u_pointLights[" + index + "]",
                        type: Engine3D.DataType.STRUCT,
                        val: {
                            member: [
                                ["FLOAT_3", "position"],
                                ["FLOAT_3", "color"],
                                ["FLOAT", "intensity"],
                                ["FLOAT", "range"],
                                ["FLOAT", "constant"],
                                ["FLOAT", "linear"],
                                ["FLOAT", "quadratic"]
                            ],
                            val:light
                        },
                        category: "uniform"
                    });
                });
            }



            var mvpMatrix = this._computeMvpMatrix(sprite);

            dataArr.push({
                name:"u_mvpMatrix",
                type: Engine3D.DataType.FLOAT_MAT4,
                val: mvpMatrix.values,
                category: "uniform"
            });



            dataArr.forEach((dataObj) => {
                switch (dataObj.category){
                    case "attribute":
                        self._program.setAttributeData(dataObj.name, dataObj.buffer);
                        break;
                    case "uniform":
                        self._program.setUniformData(dataObj.name, dataObj.type,dataObj.val);
                        break;
                    default:
                        break;

                }
            });
        }

        private _computeMvpMatrix(sprite){
            return sprite.matrix.copy().concat(this._camera.computeVpMatrix());
        }

        private _hasLight(){
            return !!(this._pointLightArr && this._pointLightArr.length > 0);
        }


        initWhenCreate() {
            this._sprites = [];
        }

        public static create(camera) {
            var obj = new this(camera);

            obj.initWhenCreate();

            return obj;
        }


        //hook
        onSetData(sprite, program){
        }
    }
}
