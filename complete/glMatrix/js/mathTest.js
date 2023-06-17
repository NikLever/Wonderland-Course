import {Component, Property} from '@wonderlandengine/api';
import { vec3, quat, quat2 } from "gl-matrix";

export class MathTest extends Component {
    static TypeName = "mathTest";
    static Properties = { 
        option: Property.enum(['position', 'orbit', 'spin', 'scale', 'challenge'], 'position')
    };
    
    init() {
        this.startTransform = new Float32Array(8);
        this.startPosition = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.tmpVec1 = new Float32Array(3);
        this.tmpQuat = new Float32Array(4);
        this.tmpTransform = new Float32Array(8);
        this.origin = new Float32Array(3);
        this.time = 0;
    }

    start() {
        this.startTransform.set( this.object.transformWorld );
        this.object.getPositionWorld( this.startPosition );
        document.addEventListener('mousedown', this.compare.bind(this) );
    }

    compare(){
        this.object.getPositionWorld( this.tmpVec );
        quat2.getTranslation( this.tmpVec1, this.object.transformWorld );
        console.group('mathTest.compare');
        console.log(`getTranslationWorld:${this.f32ToString(this.tmpVec)} from transform:${this.f32ToString(this.tmpVec1)}`);
        quat2.getReal( this.tmpQuat, this.object.transformWorld );
        console.log(`rotationWorld:${this.f32ToString(this.object.rotationWorld)} from transform:${this.f32ToString(this.tmpQuat)}`);
        console.groupEnd();
    }

    position(){
        this.tmpVec.set( [0, Math.cos(this.time), 0] );
        vec3.add( this.tmpVec, this.startPosition, this.tmpVec);
        this.object.setPositionWorld( this.tmpVec );
    }

    orbit(){
        const radius = 2;
        this.tmpVec.set( [Math.sin(this.time) * radius, 0, Math.cos(this.time) * radius] );
        vec3.add( this.tmpVec, this.startPosition, this.tmpVec);
        this.object.setPositionWorld( this.tmpVec );
    }

    spin(dt){
        const theta = dt * 3;
        const local = true;
        if (local){
            this.object.getPositionLocal(this.tmpVec);
            this.object.setPositionLocal(this.origin);
            quat.rotateY( this.tmpQuat, this.object.getRotationLocal(), theta);
            this.object.setRotationLocal( this.tmpQuat );
            this.object.setPositionLocal( this.tmpVec );
        }else{
            this.object.setPositionWorld(this.origin);
            quat.rotateY( this.tmpQuat, this.object.getRotationWorld(), theta);
            this.object.setRotationWorld( this.tmpQuat );
            this.object.setPositionWorld( this.startPosition );
        }
    }

    challenge(dt){
        //Combine orbit and spin
    }

    scale(){
        const s = (Math.cos( this.time ) + 1.2)*0.6;
        this.object.setScalingWorld( [s,s,s] );
    }

    f32ToString( v, decimalCount = 2 ){
        let str = '';
        v.forEach( (e) => {
            str += `${e.toFixed(decimalCount)}, `;
        });
        return str;
    }

    update(dt) {
        this.time += dt;

        switch(this.option){
            case 0:
                this.position();
                break;
            case 1:
                this.orbit();
                break;
            case 2:
                this.spin(dt);
                break;
            case 3:
                this.scale();
                break;
            case 4:
                this.challenge(dt);
                break;
        }
    }
}
