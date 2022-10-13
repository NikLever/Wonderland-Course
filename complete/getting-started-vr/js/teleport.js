WL.registerComponent('teleport', {
    navmesh: {type: WL.Type.Object, default: null},
    player: { type: WL.Type.Object, default: null},
}, {
    init: function() {
        this.tmpPos = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
    },
    start: function() {
        if (WL.xrSession) {
            this.setupVREvents(WL.xrSession);
        } else {
            WL.onXRSessionStart.push(this.setupVREvents.bind(this));
        }
    },
    update: function(dt) {
    },
    setupVREvents: function(s){
    	s.addEventListener('select', this.select.bind(this));
    },
    select: function(e){
    	if (this.navmesh == null || this.camera == null) return;

        this.object.getTranslationWorld( this.tmpPos );
        this.object.getForward( this.tmpVec );
            
        let rayhit = WL.physics.rayCast(this.tmpPos, this.down, 255);

        if (rayhit.hitCount>0){
            this.player.setTranslationWorld( rayhit.locations[0] );
        }	
    }
});
