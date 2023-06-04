WL.registerComponent('HitBlock', {
    collisionIndicator: { type: WL.Type.Object }, 
    colliderGroup: { type: WL.Type.Int, default: 6 },
    handedness: {type: WL.Type.Enum, values: ['input component', 'left', 'right', 'none'], default: 'input component'}
}, {
    init: function() {    
        this.tmpVec = new Float32Array(3);
        this.tmpVec1 = new Float32Array(3);
    },
    start: function() {
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
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },
    setupVREvents: function(s){
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
    },
    update: function(dt) {
        this.object.getTranslationWorld( this.tmpVec );//origin
        this.object.getForward( this.tmpVec1 );//direction
        const rayHit = WL.scene.rayCast( this.tmpVec, this.tmpVec1, 1 << this.colliderGroup, 10 );
        if(rayHit.hitCount > 0) {
            this.collisionIndicator.setTranslationWorld( rayHit.locations[0] );
            //console.log( `HitBlock.js: update > rayHit.locations[0] = ${rayHit.locations[0]} `);
            this.collisionIndicator.active = true; 
            this.hitData = { location: rayHit.locations[0], object: rayHit.objects[0] };
        }else{
            this.collisionIndicator.active = false;
            delete this.hitData;
        }
    }
});

