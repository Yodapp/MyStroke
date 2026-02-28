
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

let camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

let labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

let ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);

let dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5,5,5);
scene.add(dirLight);

// Create more realistic brain shape
let geometry = new THREE.SphereGeometry(3.2, 256, 256);
let material = new THREE.MeshStandardMaterial({
    color: 0x777777,
    roughness: 1.0,
    metalness: 0.0
});

let brain = new THREE.Mesh(geometry, material);

// Shape into brain-like form
brain.scale.set(1.2, 0.9, 1.0);

// Add midline fissure
let pos = brain.geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Central longitudinal fissure
    if (Math.abs(x) < 0.15) {
        x *= 0.5;
    }

    // Flatten inferior surface
    if (y < -1.2) {
        y *= 0.8;
    }

    // Add sulci-like noise
    let noise = Math.sin(x*4) * Math.sin(y*4) * 0.05;
    z += noise;

    pos.setXYZ(i, x, y, z);
}
pos.needsUpdate = true;
brain.geometry.computeVertexNormals();

scene.add(brain);

// Injury region (MCA-like distribution)
let injuryGeometry = new THREE.SphereGeometry(1.8, 64, 64);
let injuryMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2222,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.85
});

let injury = new THREE.Mesh(injuryGeometry, injuryMaterial);
injury.position.set(2.2, 0.3, 0.6);
injury.scale.set(1.3, 2.3, 1.6); // ~6.5 cm vertical proportion
scene.add(injury);

// Labels
function createLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    const label = new THREE.CSS2DObject(div);
    label.position.copy(position);
    scene.add(label);
}

createLabel("Frontal Lobe", new THREE.Vector3(0, 2.2, 2));
createLabel("Parietal Lobe", new THREE.Vector3(0.5, 2, -1.5));
createLabel("Temporal Lobe", new THREE.Vector3(3, -0.5, 1));

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();
