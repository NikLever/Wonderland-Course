import {Component, Property} from '@wonderlandengine/api';

export class MovePlayer extends Component {
    static TypeName = 'MovePlayer';
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

    start() {
        this.engine.onXRSessionStart.push(this.setupVREvents.bind(this));
    }

    update(dt) {
 
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
