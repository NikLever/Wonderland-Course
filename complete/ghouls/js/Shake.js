import {Component, Property} from '@wonderlandengine/api';
import { vec3 } from "gl-matrix";

export class Shake extends Component {
    static TypeName = "shake";
    static Properties = { 
        strength: Property.float( 1.0 )
    };

    init() {
        this.offset = new Float32Array(3);
        this.startPosition = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
    }

    start() {
        this.object.getPositionLocal( this.startPosition );
    }

    update(dt) {
        for (let i=0; i<this.offset.length; i++){
            this.offset[i] = (Math.random() - 0.5) * this.strength;
        }

        vec3.add( this.tmpVec, this.startPosition, this.offset );

        this.object.setPositionLocal( this.tmpVec );
    }
}
