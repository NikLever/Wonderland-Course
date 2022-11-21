WL.registerComponent('GunHandler', {
    bulletMesh: {type: WL.Type.Mesh},
    bulletMaterial: {type: WL.Type.Material},
    collisionGroup: {type: WL.Type.Float, default: 6 }
}, {
    init: function(){
        this.tmpVec = new Float32Array(3);
    },
    start: function() {
        const input = this.object.getComponent('input');
        if(!input) {
            console.error(this.object.name, "GunHandler.js: input component is required on the object");
            return;
        }else{
            this.handedness = input.handedness;
        }
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
        this.sfxShot = this.object.addComponent('howler-audio-source', {src: 'sfx/shot.mp3', spatial: false});
    },

    setupVREvents: function(s){
        this.session = s;
        s.addEventListener('end', function() {
            this.session = null;
        }.bind(this));

        s.addEventListener('select', (e) => {
            if (e.inputSource.handedness == this.handedness ) this.fire();    
        });
    },

    fire: function() {
        //Create a new bullet in the scene
        const bullet = WL.scene.addObject();
        //Place new bullet at current object location
        this.object.getTranslationWorld( this.tmpVec );
        bullet.setTranslationWorld( this.tmpVec );
        //bullet.scale([0.1, 0.1, 0.1]);

        //Add a mesh to render the object 
        const mesh = bullet.addComponent('mesh');
        mesh.material = this.bulletMaterial;
        mesh.mesh = this.bulletMesh;
        mesh.active = true;

        const bulletHandler = bullet.addComponent('BulletHandler');
        this.object.getForward( bulletHandler.direction );
        bulletHandler.collisionGroup = this.collisionGroup;

        this.sfxShot.play();
    },

});
