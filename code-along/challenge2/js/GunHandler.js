import {Component, Property} from '@wonderlandengine/api';
import { HowlerAudioSource } from '@wonderlandengine/components';

export class GunHandler extends Component {
    static TypeName = "GunHandler";
    static Properties = { 
        bulletMesh: Property.mesh(),
        bulletMaterial: Property.material(),
        collisionGroup: Property.float( 6.0 )
    };
    static Dependencies = [
        HowlerAudioSource
    ];

    init(){
        this.tmpVec = new Float32Array(3);
    }

    start() {
        const input = this.object.getComponent('input');
        if(!input) {
            console.error(this.object.name, "GunHandler.js: input component is required on the object");
            return;
        }else{
            this.handedness = input.handedness;
        }
        this.engine.onXRSessionStart.add(this.setupVREvents.bind(this));
        this.sfxShot = this.object.addComponent(HowlerAudioSource, {src: 'sfx/shot.mp3', spatial: false});
    }

    setupVREvents(s){
        this.session = s;
        s.addEventListener('end', function() {
            this.session = null;
        }.bind(this));

        s.addEventListener('select', (e) => {
            if (e.inputSource.handedness == this.handedness ) this.fire();    
        });
    }

    fire() {
        //Create a new bullet in the scene
        const bullet = this.engine.scene.addObject();
        //Place new bullet at current object location
        this.object.getPositionWorld( this.tmpVec );
        bullet.setPositionWorld( this.tmpVec );
        //bullet.scale([0.1, 0.1, 0.1]);

        //Add a mesh to render the object 
        const mesh = bullet.addComponent('mesh');
        mesh.material = this.bulletMaterial;
        mesh.mesh = this.bulletMesh;
        mesh.active = true;

        const bulletHandler = bullet.addComponent('BulletHandler');
        this.object.getForwardWorld( bulletHandler.direction );
        bulletHandler.collisionGroup = this.collisionGroup;

        this.sfxShot.play();
    }

}
