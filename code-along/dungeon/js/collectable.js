
import {Component, Property} from '@wonderlandengine/api';
import {HowlerAudioSource} from '@wonderlandengine/components';
import { vec3, quat } from 'gl-matrix';

export class Collectable extends Component {
    static TypeName = 'collectable';
    static Properties = {
        controller: Property.object(),
        collectablesGroup: Property.int( 6 ),
        collisionIndicator: Property.object(),
        moveToController: Property.bool( false ),
        rotateYOnMove: Property.float( 0.0 ),
        handedness: Property.enum(['input component', 'left', 'right', 'none'], 'input component')
    };
    static Dependencies = [
        HowlerAudioSource
    ];

    init() {    
        this._tempVec = new Float32Array(3);
        this._tempVec0 = new Float32Array(3);
        this._grabParent = null;
        this._grabTransform = new Float32Array(8);
        this._grabScale = new Float32Array(3);

    }

    start() {
        console.log('collectable start()');
        this._input = this.object.getComponent('input');
        if(!this._input) {
            console.error(this.object.name, "collectable.js: input component is required on the object");
            return;
        }else if(this.handedness == 0){
            this.handedness = this._input.handedness;
        }else{
            this.handedness = ['left', 'right', 'none'][this.handedness-1];
        }
        this._cursor = this.object.getComponent('cursor'); 
        this._teleport = this.object.getComponent('teleport');
        this.collisionIndicator.active = false;
        this.engine.onXRSessionStart.add(this.setupVREvents.bind(this));
    }

    setupVREvents(s){
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
    }

    showController( mode ){
        if (this._cursor){
            this._cursor.cursorRayObject.children[0].active = this._cursor.cursorObject.active = mode;
        }
        if (this.controller){
            const model = this.controller.children[0];
            model.children.forEach( c => c.active = mode );
        }
    }

    update(dt) {
  
    }

    reparentReset (object, newParent) {
        object.resetTransform( );
        object.rotateAxisAngleDeg([0, 1, 0], this.rotateYOnMove ); 
        object.scalingLocal.set( this._grabScale );
        object.parent = newParent;
        object.setDirty();
    }

    reparentKeepTransform (object, newParent) {
        //From Pipo's code
        let newParentTransformWorld = [];
        quat2.identity(newParentTransformWorld);
        let newParentScalingWorld = [1, 1, 1];

        if (newParent) {
            newParentTransformWorld = newParent.transformWorld;
            newParentScalingWorld = newParent.scalingWorld;
        }

        let tempTransform = new Float32Array(8);

        quat2.conjugate(tempTransform, newParentTransformWorld);
        quat2.mul(tempTransform, tempTransform, object.transformWorld);
        object.transformLocal.set(tempTransform);

        let newScale = new Float32Array(3);
        vec3.divide(newScale, object.scalingLocal, newParentScalingWorld);
        object.resetScaling();
        object.scale(newScale);

        object.parent = newParent;

        object.setDirty();
    }
}
