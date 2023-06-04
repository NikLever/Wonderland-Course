WL.registerComponent('MovePlayer', {
    camera: { type: WL.Type.Object },
    speed: { type: WL.Type.Float, default: 2.0 }
}, {
    init: function() {
        this.tmpPos = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
        this.down = new Float32Array(3);
        this.down.set([0,-1,0]);
        this.selectPressed = { left: false, right: false };
    },
    start: function() {
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },
    update: function(dt) {
 
    },
    setupVREvents: function(s){
    	s.addEventListener('selectstart', this.selectStart.bind(this));
        s.addEventListener('selectend', this.selectEnd.bind(this));
    },
    selectStart: function(e){
    	this.selectPressed[e.inputSource.handedness] = true;	
    },
    selectEnd: function(e){
    	this.selectPressed[e.inputSource.handedness] = false;
    },
    getSelectPressed: function(){
    	return this.selectPressed.left || this.selectPressed.right;
    }
});
