var prepareTool = (function () {
    return {
        createBox: function(size, materialClass){
            var size = size || 5;

            var material;

            if(materialClass){
                material = materialClass.create();
            }
            else{
                material = wd.BasicMaterial.create();
            }

            var geo = wd.BoxGeometry.create();
            geo.width = size;
            geo.height = size;
            geo.depth = size;

            geo.material = material;

            var box = wd.GameObject.create();

            box.addComponent(geo);
            box.addComponent(wd.MeshRenderer.create());

            return box;
        },
        createRect: function(size, materialClass){
            var size = size || 5;

            var material;

            if(materialClass){
                material = materialClass.create();
            }
            else{
                material = wd.BasicMaterial.create();
            }

            var geo = wd.RectGeometry.create();
            geo.width = size;
            geo.height = size;

            geo.material = material;

            var rect = wd.GameObject.create();

            rect.addComponent(geo);
            rect.addComponent(wd.MeshRenderer.create());

            return rect;
        },
        createSphere: function(radius, materialClass){
            var radius = radius || 5;

            var material;

            if(materialClass){
                material = materialClass.create();
            }
            else{
                material = wd.BasicMaterial.create();
            }

            var geo = wd.SphereGeometry.create();
            geo.radius = radius;

            geo.material = material;

            var sphere = wd.GameObject.create();

            sphere.addComponent(geo);
            sphere.addComponent(wd.MeshRenderer.create());

            return sphere;
        },
        addScript:function(gameObject, script, scriptName){
            wd.ScriptComponentContainer.getInstance().addChild(gameObject, scriptName || "scriptName", script);
        },
        prepareGeo: function(sandbox, model,geo,material,setMaterialFunc) {
            setMaterialFunc = setMaterialFunc || function(){};

            setMaterialFunc(material);


            geo.material = material;


            model.addComponent(geo);


            //anim = createAnimation("play");
            //model.addComponent(anim);


            //fps = 10;


            model.addComponent(wd.MeshRenderer.create());

            var director = wd.Director.getInstance();

            director.scene.addChild(model);

            director.scene.addChild(testTool.createCamera());


            //program = shaderTool.getAndStubProgram(sandbox, material.shader);
        },
        prepareForMap:function(sandbox){
            sandbox.stub(wd.DeviceManager.getInstance(), "view", {
                width:100,
                height:100
            });

            var gl = wd.DeviceManager.getInstance().gl;
            gl.createTexture.returns({});
            gl.createRenderbuffer.returns({});
        },
        createGL: function(domId){
            wd.DeviceManager.getInstance().createGL("#" + domId, {});
        }
    }
})();
