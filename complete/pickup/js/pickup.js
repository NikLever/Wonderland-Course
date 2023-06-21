import {Component, Property} from '@wonderlandengine/api';
import { vec3, quat2 } from "gl-matrix";

export class Pickup extends Component {
    static TypeName = "pickup";
    static Properties = { 
        colliderGroup: Property.int(6),
        collisionIndicator: Property.object(),
        returnOnRelease: Property.bool( true ),
        handedness: Property.enum(['input component', 'left', 'right', 'none'], 'input component')
    };
    
    init() {    
        this._tmpVec = new Float32Array(3);
        this._tmpVec1 = new Float32Array(3);
        this._grabParent = null;
        this._grabTransform = new Float32Array(8);
        this._grabScale = new Float32Array(3);
        this._holding = false;
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

            if(this._hitData) {
                const grabObject = this._hitData.object;

                if (grabObject){
                    this._grabParent = grabObject.parent;
                    this._grabTransform.set( grabObject.getTransformLocal() );
                    this._grabScale.set( grabObject.getScalingLocal() );
                    
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
                    this._grabObject.setTransformLocal( this._grabTransform );
                    this._grabObject.setScalingLocal( this._grabScale );
                    this._grabObject.parent = this._grabParent;
                }else{
                    this.reparentKeepTransform( this._grabObject, this._grabParent );
                }
                this._grabObject.setDirty();
                this._holding = false; 
            }       
        });
    }

    update(dt) {
        if ( !this._holding ){
            const origin = this._tmpVec;
            quat2.getTranslation(origin, this.object.getTransformWorld() );
            const direction = this.object.getForwardWorld( this._tmpVec1 );
            let rayHit = this.engine.scene.rayCast(origin, direction, this._collisionGroup, 20 );
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
