import { Component } from '@wonderlandengine/api';
import { vec3 } from "gl-matrix";

export class Name extends Component {
    static TypeName = "BulletHandler";
    
    init() {
        this.direction = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.elapsedTime = 0;
    }

    start(){
        this.collision = this.object.addComponent('collision');
        this.collision.extents[0] = 0.1;
        this.collision.group = (1 << this.collisionGroup);
        this.object.getPositionWorld( this.tmpVec );
        this.object.resetPositionRotation();
        this.object.rotateAxisAngleDegLocal([0,1,0], 90);
        this.object.setPositionWorld( this.tmpVec );
    }

    update(dt) {
        vec3.copy( this.tmpVec, this.direction );
        vec3.scale( this.tmpVec, this.tmpVec, dt * 10 );
        this.object.translate( this.tmpVec );
        this.elapsedTime += dt;
        if ( this.elapsedTime > 3) this.object.active = false;
        const overlaps = this.collision.queryOverlaps();
        if (overlaps.length > 0){
            console.log('BulletHandler.update: overlap');
            const ghoulHandler = overlaps[0].object.parent.getComponent( 'GhoulHandler' );
            if (ghoulHandler) ghoulHandler.shot();
            this.object.active = false;
        }
    }
}
