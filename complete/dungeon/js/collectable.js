WL.registerComponent('collectable', {
    collectable: {type: WL.Type.Object, default: null},
    controller: {type: WL.Type.Object, default: null}
}, {
    init: function() {
        if (!this.collectable || !this.controller){
            console.error(this.object.name, "collectable.js: collectable and controller are required");
            return;
        }
        this.input = this.object.getComponent('input');
        if(!this.input) {
            console.error(this.object.name, "collectable.js: input component is required on the object");
            return;
        }
        this._teleport = this.object.getComponent('teleport');
        this._holding = false;
        this._tempVec = new Float32Array(3);
        this._collectPosition = new Float32Array(3);
        this._collectRotation = new Float32Array(4);
    },
    start: function() {
        console.log('collectable start()');
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },
    setupVREvents: function(s){
        this.session = s;
        s.addEventListener('end', function() {
            /* Reset cache once the session ends to rebind select etc, in case
             * it starts again */
            this.session = null;
        }.bind(this));

        s.addEventListener('select', function() {
            if (!this.holding){
                //this.controller.
            }
        }.bind(this));

        s.addEventListener('squeeze', function() {
            
        }.bind(this));
    },
    update: function(dt) {
        //console.log('update() with delta time', dt);
    },
});
