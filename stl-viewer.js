import './three.min.js';
import './STLLoader.js';
import './OrbitControls.js';

class STLViewer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.connected = true;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';

    shadowRoot.appendChild(container);

    if (!this.hasAttribute('model')) {
      throw new Error('model attribute is required');
    }

    const model = this.getAttribute('model');

    let camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 1000);
    let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', function () {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    }, false);
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    let scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 1.5));

    new THREE.STLLoader().load(model, (geometry) => {
      let material = new THREE.MeshPhongMaterial({
        color: 0x6A39FF,
        specular: 100,
        shininess: 100,
      });
      let mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let middle = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(middle);
      mesh.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-middle.x, -middle.y, -middle.z));
      let largestDimension = Math.max(geometry.boundingBox.max.x, geometry.boundingBox.max.y, geometry.boundingBox.max.z)
      camera.position.z = largestDimension * 1.5;

      controls.autoRotate = true;
      controls.autoRotateSpeed = 1;
      let animate = () => {
        controls.update();
        renderer.render(scene, camera);
        if (this.connected) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  disconnectedCallback() {
    this.connected = false;
  }
}

customElements.define('stl-viewer', STLViewer);