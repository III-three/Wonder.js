module Engine3D {
    export class GameObject {
        private static _count:number = 1;

        private _uid:number = null;
        get uid() {
            return this._uid;
        }

        set uid(uid:number) {
            this._uid = uid;
        }

        //todo add mesh,scene position
        private _position:Position = null;
        get position() {
            return this._position;
        }

        set position(position:Position) {
            this._position = position;
        }

        private _parent:GameObject = null;
        get parent() {
            return this._parent;
        }

        set parent(parent:GameObject) {
            this._parent = parent;
        }

        private _childs:Collection = Collection.create();

        constructor() {
            this._uid = GameObject._count;
            GameObject._count += 1;
        }

        public init() {
            Log.error(true, Log.info.ABSTRACT_METHOD);
        }

        /*!
         virtual
         */
        public dispose() {
            this.parent = null;
            EventManager.off(this);
        }

        /*!
         hook method
         */
        public onEnter() {
        }

        public onStartLoop() {
        }

        public onEndLoop() {
        }

        public onExit() {
        }

        public hasChild(child:GameObject):boolean {
            return this._childs.hasChild(child);
        }

        //public addChild(child:GameObject, sort:boolean=true):boolean {
        public addChild(child:GameObject):GameObject {
            //need user judge it!
            //if(this._childs.hasChild(child)) {
            //    return false;
            //}

            if (child.parent) {
                //will remove bind event,remove from parent ...
                child.removeMe();
            }

            child.parent = this;


            //child.dispatchEvent(new CoreEvent('beforeadd', false, {
            //    parent: this
            //}));


            this._childs.addChild(child);

            //if(sort) {


            /*!
            sort when add child/childs, not when get childs.
            because each loop will get childs(to render), so if using the latter, each loop should sort!
             */
                this.sort();
            //}
            //child._parent = this;
            //child.setBubbleParent(this);
            //child._transform.dirty = true;
            //child.dispatchEvent(new CoreEvent('add', false));
            //this.dispatchEvent(new CoreEvent('childadd', false, {
            //    child: child
            //}));


            child.init();
            child.onEnter();

            return this;
        }

        public sort(){
            this._childs.sort(this._ascendZ);
        }

        private _ascendZ(a:GameObject, b:GameObject){
            return function(a, b) {
                return a.position.z - b.position.z;
            }
        }

        public removeChild(child:GameObject):GameObject {
            child.onExit();

            this._childs.removeChild(child);
            //var idx = this._children.indexOf(child);
            //if(idx !== -1) {
            //    child.dispatchEvent(new CoreEvent('beforeremove', false));
            //    this._children.splice(idx, 1);
            child.dispose();
            //child.setBubbleParent(null);
            //    child.dispatchEvent(new CoreEvent('remove', false, {
            //        parent: this
            //    }));
            //    this.dispatchEvent(new CoreEvent('childremove', false, {
            //        child: child
            //    }));
            //    return true;
            //}
            //return false;


            return this;
        }

        /**
         * remove this game object from parent.
         * @returns {boolean}
         */
        public removeMe():GameObject {
            var parent = this._parent;

            parent && parent.removeChild(this);

            return this;
        }

        public getTopChildUnderPoint(point:Point):GameObject {
            //var found, localP, child;
            //var childrenArr;
            //if(!this._active || !this._visible) return null;
            //if(this._interactiveRect) {
            //    localP = this.transform.globalToLocal(x, y);
            //    if(!this._interactiveRect.containsXY(localP.x, localP.y)) {
            //        return null;
            //    }
            //}
            //childrenArr = this._children;
            //if(childrenArr.length > 0) {
            //    for(var i=childrenArr.length-1; i>=0; i--) {
            //        child = childrenArr[i];
            //        found = child.getUnderPoint(x, y, touchable);
            //        if(found) {
            //            return found;
            //        }
            //    }
            //}
            //
            //if(!touchable || this._touchable) {
            //    if(!localP) {
            //        localP = this.transform.globalToLocal(x, y);
            //    }
            //    if(this.testHit(localP.x, localP.y)) {
            //        return this;
            //    }
            //}
            //return null;

            var result = null,
                i = null;

            childrenArr = this._childs;
            if(childrenArr.length > 0) {
                for(i=childrenArr.length-1; i>=0; i--) {
                    let child = childrenArr[i];

                    result = child.getTopChildUnderPoint(x, y);
                    if(result) {
                        return result;
                    }
                }
            }

            if(this.isHit(point)) {
                return this;
            }

            return null;
        }

        public isHit(point:Point):boolean {
            //todo extract collider?
            //var collider:Collider = this._collider;
            //return collider && collider.collideXY(localX, localY);


            var RANGE = 10;

            return Math.abs(this._position.x - point.x) < RANGE
            && Math.abs(this._position.y - point.y) < RANGE;
        }
    }
}
