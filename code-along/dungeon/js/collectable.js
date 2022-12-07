WL.registerComponent('collectable', {
    controller: { type: WL.Type.Object },
    collectablesGroup: { type: WL.Type.Int, default: 6 },
    collisionIndicator: { type: WL.Type.Object }, 
    moveToController: { type: WL.Type.Bool, default: false },
    rotateYOnMove: { type: WL.Type.Float, default: 0 },
    handedness: {type: WL.Type.Enum, values: ['input component', 'left', 'right', 'none'], default: 'input component'}
}, {
    init: function() {    
        this._tempVec = new Float32Array(3);
        this._tempVec0 = new Float32Array(3);
        this._grabParent = null;
        this._grabTransform = new Float32Array(8);
        this._grabScale = new Float32Array(3);

    },
    start: function() {
        console.log('collectable start()');
        this._input = this.object.getComponent('input');
        if(!this._input) {
            console.error(this.object.name, "collectable.js: input component is required on the object");
            return;
        }else if(this.handedness == 0){
            this.handedness = this._input.handedness;
        }
        this._cursor = this.object.getComponent('cursor'); 
        this._teleport = this.object.getComponent('teleport');
        this.collisionIndicator.active = false;
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },
    setupVREvents: function(s){
        this.session = s;
        s.addEventListener('end', function() {
            /* Reset cache once the session ends to rebind select etc, in case
             * it starts again */
            this.session = null;
        }.bind(this));

        s.addEventListener('select', (e) => {
            console.log(`collectable select ${this.handedness}`);
            if (e.inputSource.handedness != this.handedness) return;
        });
    },
    showController: function( mode ){
    },
    update: function(dt) {
  
    },
    reparentReset: function (object, newParent) {
        object.resetTransform( );
        object.rotateAxisAngleDeg([0, 1, 0], this.rotateYOnMove ); 
        object.scalingLocal.set( this._grabScale );
        object.parent = newParent;
        object.setDirty();
    },
    reparentKeepTransform: function (object, newParent) {
        //From Pipo's code
        let newParentTransformWorld = [];
        glMatrix.quat2.identity(newParentTransformWorld);
        let newParentScalingWorld = [1, 1, 1];

        if (newParent) {
            newParentTransformWorld = newParent.transformWorld;
            newParentScalingWorld = newParent.scalingWorld;
        }

        let tempTransform = new Float32Array(8);

        glMatrix.quat2.conjugate(tempTransform, newParentTransformWorld);
        glMatrix.quat2.mul(tempTransform, tempTransform, object.transformWorld);
        object.transformLocal.set(tempTransform);

        let newScale = new Float32Array(3);
        glMatrix.vec3.divide(newScale, object.scalingLocal, newParentScalingWorld);
        object.resetScaling();
        object.scale(newScale);

        object.parent = newParent;

        object.setDirty();
    }
});
