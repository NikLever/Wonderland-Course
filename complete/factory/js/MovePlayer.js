import {Component, Property} from '@wonderlandengine/api';
import { vec3 } from "gl-matrix";

export class MovePlayer extends Component {
    static TypeName = "movePlayer";
    static Properties = { 
        camera: Property.object(),
        speed: Property.float( 2.0 )
    };
    
    init() {
        console.log('MovePlayer.init()');
        this.tmpPos = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.down = new Float32Array(3);
        this.down.set([0,-1,0]);
        this.selectPressed = { left: false, right: false };
    }

    start() {
        //this.physx = (this.navmesh) ? this.navmesh.getComponent('physx') : null;
        console.log('MovePlayer.start()');
        this.engine.onXRSessionStart.add(this.setupVREvents.bind(this));
    }

    update(dt) {
        if ( this.camera == null ) return;
        if (this.getSelectPressed()){
            this.object.getPositionWorld( this.tmpPos );
            this.camera.getForwardWorld( this.tmpVec );

            vec3.scale(this.tmpVec, this.tmpVec, dt * this.speed);
            vec3.add( this.tmpPos, this.tmpPos, this.tmpVec);
            
            this.tmpPos[1] += 1;
            
            let rayhit = this.engine.physics.rayCast(this.tmpPos, this.down, 255, 5.0);
            
            if (rayhit.hitCount>0){
                this.object.setPositionWorld(rayhit.locations[0]);
            }
        }
    }

    setupVREvents(s){
    	s.addEventListener('selectstart', this.selectStart.bind(this));
        s.addEventListener('selectend', this.selectEnd.bind(this));
    }

    selectStart(e){
        console.log(`MovePlayer.selectStart ${e.inputSource.handedness}`);
    	this.selectPressed[e.inputSource.handedness] = true;	
    }

    selectEnd(e){
        console.log(`MovePlayer.selectEnd ${e.inputSource.handedness}`);
    	this.selectPressed[e.inputSource.handedness] = false;
    }

    getSelectPressed(){
    	return this.selectPressed.left || this.selectPressed.right;
    }
}
