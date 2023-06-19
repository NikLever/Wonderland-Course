import {Component, Property} from '@wonderlandengine/api';
import { vec3, quat } from "gl-matrix";

export class BlockHandler extends Component {
    static TypeName = "blockHandler";
    static Properties = { 
        vrCamera: Property.object(),
        speed: Property.float( 5.0 )
    };

    init() {
        if (this.vrCamera == null){
            console.warn('blockHandler needs a vrCamera assigning to support motion through space ');
        }
        this.rotation = quat.create();
        quat.fromEuler(this.rotation, 1, 1, 0);
        this.tmpQuat = quat.create();  
        this.direction = vec3.create();
        this.tmpVec = vec3.create();
        this.tmpVec1 = vec3.create();
    }

    start() {
        this.cube = this.object.children[0]; 
        this.spawn();
    }

    spawn() { 
        if ( this.vrCamera == null ) return;
        this.vrCamera.getForwardWorld( this.direction );
        vec3.copy( this.tmpVec, this.direction );
        vec3.scale( this.tmpVec, this.tmpVec, 30 );
        this.vrCamera.getPositionWorld( this.tmpVec1 );
        vec3.add( this.tmpVec, this.tmpVec, this.tmpVec1 );
        this.object.setPositionWorld( this.tmpVec );
        vec3.scale( this.direction, this.direction, -this.speed );
    }

    update(dt) {
        quat.scale( this.tmpQuat, this.rotation, dt );
        this.cube.rotateObject( this.tmpQuat );
        if ( this.vrCamera != null ){
            vec3.copy( this.tmpVec, this.direction );
            vec3.scale( this.tmpVec, this.tmpVec, dt );
            this.object.translateWorld( this.tmpVec );
            this.object.getPositionWorld( this.tmpVec );
            this.vrCamera.getPositionWorld( this.tmpVec1 );
            vec3.subtract( this.tmpVec, this.tmpVec, this.tmpVec1 );
            vec3.normalize( this.tmpVec, this.tmpVec );
            this.vrCamera.getForwardWorld( this.tmpVec1 );
            const theta = vec3.angle( this.tmpVec, this.tmpVec1 );
            if (theta > Math.PI/2 ) this.spawn();
        }
    }
}
