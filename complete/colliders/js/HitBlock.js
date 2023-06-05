import {Component, Property} from '@wonderlandengine/api';
import {HowlerAudioSource} from '@wonderlandengine/components';
import { vec3, quat } from "gl-matrix";

export class Name extends Component {
    static TypeName = "HitBlock";
    static Properties = { 
        collisionIndicator: Property.object(),
        colliderGroup: Property.int( 6 ),
        handedness: Property.enum( ['input component', 'left', 'right', 'none'], 'input component' )
    };

    init() {    
        this.tmpVec = new Float32Array(3);
        this.tmpVec1 = new Float32Array(3);
    }

    start() {
        const input = this.object.getComponent('input');
        if(!input) {
            console.error(this.object.name, "HitBlock.js: input component is required on the object");
            return;
        }else if(this.handedness == 0){
            this.handedness = input.handedness;
        }else{
            this.handedness = ['left', 'right'][this.handedness-1];
        }
        this.cursor = this.object.getComponent('cursor');
        this.engine.onXRSessionStart.push(this.setupVREvents.bind(this));
    }

    setupVREvents(s){
        this.session = s;
        s.addEventListener('end', function() {
            this.session = null;
        }.bind(this));

        s.addEventListener('selectstart', (e) => {
            //console.log(`HitBlock select ${this.handedness}`);
            if(this.hitData && e.inputSource.handedness == this.handedness) {
                const blockHandler = this.hitData.object.getComponent('blockHandler');
                if (blockHandler) blockHandler.hitBlock();
            }
        });
    }

    update(dt) {
        this.object.getPositionWorld( this.tmpVec );//origin
        this.object.getForwardWorld( this.tmpVec1 );//direction
        const rayHit = WL.scene.rayCast( this.tmpVec, this.tmpVec1, 1 << this.colliderGroup, 10 );
        if(rayHit.hitCount > 0) {
            this.collisionIndicator.setPositionWorld( rayHit.locations[0] );
            //console.log( `HitBlock.js: update > rayHit.locations[0] = ${rayHit.locations[0]} `);
            this.collisionIndicator.active = true; 
            this.hitData = { location: rayHit.locations[0], object: rayHit.objects[0] };
        }else{
            this.collisionIndicator.active = false;
            delete this.hitData;
        }
    }
}

