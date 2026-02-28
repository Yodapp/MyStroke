
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

let camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 9);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Label renderer
let labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Controls
let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;

// Lighting (MRI-style soft contrast)
let ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

let dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5,5,5);
scene.add(dirLight);

// Brain geometry (ellipsoid)
let brainGeometry = new THREE.SphereGeometry(3, 128, 128);
let brainMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.95
});

let brain = new THREE.Mesh(brainGeometry, brainMaterial);
brain.scale.y = 0.85;
brain.scale.x = 1.1;
scene.add(brain);

// Create sulci-like noise displacement
let pos = brain.geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    let noise = Math.sin(x*3) * Math.cos(y*3) * 0.08;
    pos.setZ(i, z + noise);
}
pos.needsUpdate = true;
brain.geometry.computeVertexNormals();

// Injury region (temporal + parietal spread)
let injuryGeometry = new THREE.SphereGeometry(1.8, 64, 64);
let injuryMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff3333,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.85
});

let injury = new THREE.Mesh(injuryGeometry, injuryMaterial);

// Anatomical positioning (right temporal/parietal region)
injury.position.set(2.0, 0.3, 0.8);
injury.scale.set(1.2, 2.2, 1.4); // ~6.5 cm vertical scaling representation
scene.add(injury);

// Label helper
function createLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    const label = new THREE.CSS2DObject(div);
    label.position.copy(position);
    scene.add(label);
}

// Add lobe labels
createLabel("Frontal Lobe", new THREE.Vector3(0, 1.5, 2.5));
createLabel("Parietal Lobe", new THREE.Vector3(0.5, 1.5, -1));
createLabel("Temporal Lobe", new THREE.Vector3(2.5, -0.5, 1));

// Resize handling
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
