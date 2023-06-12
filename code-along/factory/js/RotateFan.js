import {Component, Property} from '@wonderlandengine/api';

export class RotateFan extends Component {
    static TypeName = 'rotateFan';
    static Properties = {
        rotationSpeed: Property.float( 10.0 )
    };
    
    init() {
        console.log('init() with rotationSpeed', this.rotationSpeed);
    }

    start() {
        console.log('start() with rotationSpeed', this.rotationSpeed);
    }

    update(dt) {
        //console.log('update() with delta time', dt);
        this.object.rotateAxisAngleDegObject([0, 1, 0], this.rotationSpeed*dt)
    }
}
