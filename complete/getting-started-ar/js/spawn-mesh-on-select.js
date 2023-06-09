import {Component, Property} from '@wonderlandengine/api';
import { vec3, quat } from "gl-matrix";

export class Name extends Component {
    static TypeName = "'spawn-mesh-on-select'";
    static Properties = { 
        mesh: Property.object(),
        material: Property.material()
    };

    start() {
        /* Once a session starts, we want to bind event listeners
         * to the session */
        this.engine.onXRSessionStart.add(this.onXRSessionStart.bind(this));
    }

    onXRSessionStart(s) {
        /* We set this function up to get called when a session starts.
         * The 'select' event happens either on touch or when the trigger
         * button of a controller is pressed.
         * Once that event is triggered, we want spawnMesh() to be called. */
        s.addEventListener('select', this.spawnMesh.bind(this));
    }

    spawnMesh() {
        /* Create a new object in the scene */
        const o = this.engine.scene.addObject();
        /* Place new object at current cursor location */
        o.setTransformLocal( this.object.getTransformWorld() );
        o.scaleLocal([0.25, 0.25, 0.25]);
        /* Move out of the floor, at 0.25 scale, the origin of
         * our cube is 0.25 above the floor */
        o.translateLocal([0.0, 0.25, 0.0]);

        /* Add a mesh to render the object */
        const mesh = o.addComponent('mesh');
        mesh.material = this.material;
        mesh.mesh = this.mesh;
        mesh.active = true;
    }

}
