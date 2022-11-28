WL.registerComponent('pickup', {
    colliderGroup: { type: WL.Type.Int, default: 6 },
    collisionIndicator: { type: WL.Type.Object }, 
    returnOnRelease: { type: WL.Type.Bool, default: true },
    handedness: {type: WL.Type.Enum, values: ['input component', 'left', 'right', 'none'], default: 'input component'}
}, {
    init: function() {    
        this._tmpVec = new Float32Array(3);
        this._tmpVec1 = new Float32Array(3);
        this._grabParent = null;
        this._grabTransform = new Float32Array(8);
        this._grabScale = new Float32Array(3);
        this._holding = false;
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

            if(this._hitData) {
                const grabObject = this._hitData.object;

                if (grabObject){
                    this._grabParent = grabObject.parent;
                    this._grabTransform.set( grabObject.transformLocal );
                    this._grabScale.set( grabObject.scalingLocal );
                    
                    this.reparentKeepTransform( grabObject, this.object );
                    this._grabObject = grabObject;

                    this.collisionIndicator.active = false;

                    this._holding = true;
                }
            }
        });

        s.addEventListener('selectend', (e) => {
            console.log(`Drop ${this._holding}`);
            if (this._holding){
                if (this.returnOnRelease){
                    this._grabObject.transformLocal.set( this._grabTransform );
                    this._grabObject.scalingLocal.set( this._grabScale );
                    this._grabObject.parent = this._grabParent;
                }else{
                    this.reparentKeepTransform( this._grabObject, this._grabParent );
                }
                this._grabObject.setDirty();
                this._holding = false; 
            }       
        });
    },
    update: function(dt) {
        if ( !this._holding ){
            const origin = this._tmpVec;
            glMatrix.quat2.getTranslation(origin, this.object.transformWorld);
            const direction = this.object.getForward( this._tmpVec1 );
            let rayHit = WL.scene.rayCast(origin, direction, this._collisionGroup, 20 );
            if(rayHit.hitCount > 0) {
                this.collisionIndicator.setTranslationWorld( rayHit.locations[0] );
                //console.log( `pickup.update: rayHit.locations[0] = ${rayHit.locations[0]} `);
                this.collisionIndicator.active = true; 
                this._hitData = { location: rayHit.locations[0], object: rayHit.objects[0] };
            }else{
                this.collisionIndicator.active = false;
                delete this._hitData;
            }
        }
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
