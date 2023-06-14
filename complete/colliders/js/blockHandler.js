import {Component, Property} from '@wonderlandengine/api';
import {HowlerAudioSource} from '@wonderlandengine/components';
import { vec3, quat } from "gl-matrix";

export class BlockHandler extends Component {
    static TypeName = "blockHandler";
    static Properties = { 
        vrCamera: Property.object(),
        speed: Property.float( 5.0 ),
        spawnDistance: Property.float( 20.0 ),
        hitTextObject: Property.object(),
        missedTextObject: Property.object()
    };
    
    static onRegister(engine){
        engine.registerComponent( HowlerAudioSource );
    }

    init() {
        if (this.vrCamera == null){
            console.warning('blockHandler needs a vrCamera assigning to support motion through space ');
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
        this.hit = 0;
        this.missed = 0;
        if (this.hitTextObject) this.hitText = this.hitTextObject.getComponent('text');
        if (this.missedTextObject) this.missedText = this.missedTextObject.getComponent('text');
        this.sfxExplosion = this.object.addComponent(HowlerAudioSource, {src: 'sfx/explosion.mp3', spatial: false});
        this.sfxSwish = this.object.addComponent(HowlerAudioSource, {src: 'sfx/swish.mp3', spatial: false});
        this.spawn();
    }

    updateCount( textComp, value ){
        if (textComp == null) return;
        textComp.text = value.toString();
    }

    spawn() { 
        if ( this.vrCamera == null ) return;
        this.vrCamera.getForwardWorld( this.direction );
        vec3.copy( this.tmpVec, this.direction );
        vec3.scale( this.tmpVec, this.tmpVec, this.spawnDistance );
        this.vrCamera.getPositionWorld( this.tmpVec1 );
        vec3.add( this.tmpVec, this.tmpVec, this.tmpVec1 );
        this.object.setPositionWorld( this.tmpVec );
        vec3.scale( this.direction, this.direction, -this.speed );
    }

    hitBlock(){
        console.log('blockHandler.hitBlock called')
        this.hit++;
        this.updateCount( this.hitText, this.hit );
        //play sfx
        this.sfxExplosion.play();
        this.spawn();
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
            if (theta > Math.PI/2 ){
                this.sfxSwish.play();
                this.missed++;
                this.updateCount( this.missedText, this.missed );
                this.spawn();
            }
        }
    }
}
