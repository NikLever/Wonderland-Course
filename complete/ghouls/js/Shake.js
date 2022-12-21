WL.registerComponent('Shake', {
    strength: {type: WL.Type.Float, default: 1.0},
}, {
    init: function() {
        this.offset = new Float32Array(3);
        this.startPosition = new Float32Array(3);
        this.tmpVec = new Float32Array(3);
    },
    start: function() {
        this.object.getTranslationLocal( this.startPosition );
    },
    update: function(dt) {
        for (let i=0; i<this.offset.length; i++){
            this.offset[i] = (Math.random() - 0.5) * this.strength;
        }

        glMatrix.vec3.add( this.tmpVec, this.startPosition, this.offset );

        this.object.setTranslationLocal( this.tmpVec );
    },
});
