module wd{
    @singleton()
    export class AnimationEngine extends ComponentContainer{
        public static getInstance():any {}

        protected list:wdCb.Collection<Animation>;

        public update(elapsed:number){
            this.list.forEach(function(child:Animation){
                child.update(elapsed);
            });
        }
    }
}

