WL.registerComponent('pickup', {
    colliderGroup: { type: WL.Type.Int, default: 6 },
    collisionIndicator: { type: WL.Type.Object }, 
    returnOnRelease: { type: WL.Type.Bool, default: true },
    handedness: {type: WL.Type.Enum, values: ['input component', 'left', 'right', 'none'], default: 'input component'}
}, {
    init: function() {    
        this._tmpVec = new Float32Array(3);
        this._tmpVec1 = new Float32Array(3);
        this._collisionGroup = 1 << this.colliderGroup;
    },
    start: function() {
        const input = this.object.getComponent('input');
        if(!input) {
            console.warn(this.object.name, "pickup.js: input component is required on the object");
            return;
        }else if(this.handedness == 0){
            this.handedness = input.handedness;
        }else{
            this.handedness = ['left', 'right', 'none'][this.handedness-1];
        }
        this.collisionIndicator.active = false;
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },
    setupVREvents: function(s){
        this.session = s;
        s.addEventListener('end', () => {
            this.session = null;
        });

        s.addEventListener('selectstart', (e) => {
            if ( e.inputSource.handedness != this.handedness ) return;
        });

        s.addEventListener('selectend', (e) => {
            console.log(`Drop ${this._holding}`);      
        });
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
