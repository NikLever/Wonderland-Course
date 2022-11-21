//import {CanvasUI} from './CanvasUI.js';

WL.registerComponent('UIHandler', {
    param: {type: WL.Type.Float, default: 1.0},
}, {
    init: function() {
        //console.log('init() with param', this.param);
    },
    start: function() {
        //console.log('start() with param', this.param);
        this.ui = new CanvasUI();
    },
    update: function(dt) {
        //console.log('update() with delta time', dt);
    },
});
