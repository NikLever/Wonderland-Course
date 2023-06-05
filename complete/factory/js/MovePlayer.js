import {Component, Property} from '@wonderlandengine/api';
import { vec3 } from "gl-matrix";

export class Name extends Component {
    static TypeName = "MovePlayer";
    static Properties = { 
        camera: Property.object(),
        speed: Property.float( 2.0 )
    };
    
    init() {
        this.tmpPos = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.down = new Float32Array(3);
        this.down.set([0,-1,0]);
        this.selectPressed = { left: false, right: false };
    }

    setTranslationWorld() {
        //this.physx = (this.navmesh) ? this.navmesh.getComponent('physx') : null;
        this.engine.onXRSessionStart.push(this.setupVREvents.bind(this));
    }

    update(dt) {
        if ( this.camera == null ) return;
        if (this.getSelectPressed()){
            this.object.getTranslationWorld( this.tmpPos );
            this.camera.getForward( this.tmpVec );

            vec3.scale(this.tmpVec, this.tmpVec, dt * this.speed);
            vec3.add( this.tmpPos, this.tmpPos, this.tmpVec);
            
            this.tmpPos[1] += 1;
            
            let rayhit = WL.physics.rayCast(this.tmpPos, this.down, 255, 5.0);
            
            if (rayhit.hitCount>0){
                this.object.setTranslationWorld(rayhit.locations[0]);
            }
        }
    }

    setupVREvents(s){
    	s.addEventListener('selectstart', this.selectStart.bind(this));
        s.addEventListener('selectend', this.selectEnd.bind(this));
    }

    selectStart(e){
    	this.selectPressed[e.inputSource.handedness] = true;	
    }

    selectEnd(e){
    	this.selectPressed[e.inputSource.handedness] = false;
    }

    getSelectPressed(){
    	return this.selectPressed.left || this.selectPressed.right;
    }
}
