import {Component, Property} from '@wonderlandengine/api';
import {HowlerAudioSource} from '@wonderlandengine/components';
import { vec3, quat } from 'gl-matrix'

export class Pickup extends Component {
    static TypeName = 'pickup';
    static Properties = {
        colliderGroup: Property.int( 6 ),
        collisionIndicator: Property.object(),
        returnOnRelease: Property.bool( true ),
        handedness: Property.enum(['input component', 'left', 'right', 'none'], 'input component')
    };
    
    static onRegister(engine){
        engine.registerComponent( HowlerAudioSource );
    }
    
    init() {    
        this._tmpVec = new Float32Array(3);
        this._tmpVec1 = new Float32Array(3);
        this._collisionGroup = 1 << this.colliderGroup;
    }

    start() {
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
        this.engine.onXRSessionStart.add(this.setupVREvents.bind(this));
    }

    setupVREvents(s){
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
    }

    update(dt) {
    }

    reparentReset(object, newParent) {
        object.resetTransform( );
        object.rotateAxisAngleDeg([0, 1, 0], this.rotateYOnMove ); 
        object.scalingLocal.set( this._grabScale );
        object.parent = newParent;
        object.setDirty();
    }

    reparentKeepTransform(object, newParent) {
        //From Pipo's code
        let newParentTransformWorld = [];
        quat2.identity(newParentTransformWorld);
        let newParentScalingWorld = [1, 1, 1];

        if (newParent) {
            newParent.getTransformWorld( newParentTransformWorld );
            newParent.getScalingWorld( newParentScalingWorld );
        }

        let tempTransform = new Float32Array(8);
        let tempTransform1 = new Float32Array(8);

        quat2.conjugate(tempTransform, newParentTransformWorld);
        object.getTransformWorld( tempTransform1 );
        quat2.mul( tempTransform, tempTransform, tempTransform1 );
        object.setTransformLocal(tempTransform);

        let newScale = new Float32Array(3);

        vec3.divide(newScale, object.scalingLocal, newParentScalingWorld);
        object.resetScaling();
        object.scale(newScale);

        object.parent = newParent;

        object.setDirty();
    }
}