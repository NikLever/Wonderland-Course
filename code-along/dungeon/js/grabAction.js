
import {Component, Property} from '@wonderlandengine/api';

export class GrabAction extends Component {
    static TypeName = "grabAction";
    static Properties = { 
        param: Property.float( 1.0 )
    };

    init() {
        console.log('init() with param', this.param);
    }

    start() {
        console.log('start() with param', this.param);
    }

    update(dt) {
        console.log('update() with delta time', dt);
    }
}
