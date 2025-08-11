import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'https://unpkg.com/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';

const CANVAS_BG = 0xe7dfd3; // soft beige

const appEl = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
appEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(CANVAS_BG);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(6.5, 6.5, 8.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 16;
controls.target.set(3, 0.6, 2.2);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 0.35);
scene.add(hemi);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.position.set(6, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.radius = 4;
dirLight.shadow.camera.near = 2;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

// Subtle fill light to add speculars
const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
fillLight.position.set(-8, 6, -6);
scene.add(fillLight);

// Materials
const matParams = {
  roughness: 0.55,
  metalness: 0.0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.9,
};

const COLORS = {
  esc: new THREE.Color('#f5a9b8'), // pastel pink
  alpha: new THREE.Color('#f3f3ef'), // off-white
  enter: new THREE.Color('#f2b558'), // orange
  space: new THREE.Color('#a7e0d5'), // mint green
  base: new THREE.Color('#e9e2d6'), // soft beige base
  plate: new THREE.Color('#1b1b1b'), // inner plate
  legends: '#333333',
};

function createStandardMaterial(color) {
  return new THREE.MeshPhysicalMaterial({ color, ...matParams });
}

// Keyboard dimensions in units
const U = 1.0; // 1u key width
const S = 0.16; // spacing between keys
const KEY_HEIGHT = 0.3; // total height of keycap
const KEY_TOP_SHRINK = 0.92; // top face scale to create sculpt feel
const TRAVEL = 0.16; // press travel distance

// Base frame
const keyboardGroup = new THREE.Group();
scene.add(keyboardGroup);

// Define grid columns (left edges)
const col = (i) => i * (U + S);
const row = (j) => j * (U + S);

// Define keys layout
// x and z are LEFT/FRONT edges in unit-space; width/height in U units
const layout = [
  { id: 'Esc', color: COLORS.esc, c: 0, r: 0, w: 1, h: 1 },
  { id: '1', color: COLORS.alpha, c: 1, r: 0, w: 1, h: 1 },
  { id: '2', color: COLORS.alpha, c: 2, r: 0, w: 1, h: 1 },
  { id: '3', color: COLORS.alpha, c: 3, r: 0, w: 1, h: 1 },
  // Enter upper nub (L-shape)
  { id: 'EnterTop', color: COLORS.enter, c: 4, r: 0, w: 1, h: 1, group: 'Enter' },

  { id: 'Shift', color: COLORS.alpha, c: 0, r: 1, w: 1.5, h: 1 },
  { id: 'Q', color: COLORS.alpha, c: 1.6, r: 1, w: 1, h: 1 },
  { id: 'W', color: COLORS.alpha, c: 2.6, r: 1, w: 1, h: 1 },
  { id: 'Up', color: COLORS.alpha, c: 3.6, r: 1, w: 1, h: 1, legend: '↑' },
  // Enter vertical
  { id: 'EnterVert', color: COLORS.enter, c: 4.6, r: 1, w: 1, h: 1, group: 'Enter' },

  // Bottom row
  { id: 'Space', color: COLORS.space, c: 0, r: 2, w: 2 + S, h: 1 },
  { id: 'Left', color: COLORS.alpha, c: 2.6, r: 2, w: 1, h: 1, legend: '←' },
  { id: 'Down', color: COLORS.alpha, c: 3.6, r: 2, w: 1, h: 1, legend: '↓' },
  { id: 'Right', color: COLORS.alpha, c: 4.6, r: 2, w: 1, h: 1, legend: '→' },
];

// Determine overall bounds
let maxX = 0, maxZ = 0;
layout.forEach(k => {
  maxX = Math.max(maxX, k.c + k.w);
  maxZ = Math.max(maxZ, k.r + k.h);
});

// Center offset so the keyboard is centered around xz origin
const centerOffsetX = (maxX - (U)) * 0.5; // approximate centering
const centerOffsetZ = (maxZ - (U)) * 0.5;

// Base frame with rounded corners
const FRAME_MARGIN = 0.5; // extra size around keys
const frameW = maxX + FRAME_MARGIN * 2;
const frameD = maxZ + FRAME_MARGIN * 2;
const frameH = 0.45;
const frameGeom = new RoundedBoxGeometry(frameW, frameH, frameD, 6, 0.25);
const frameMat = createStandardMaterial(COLORS.base);
const frameMesh = new THREE.Mesh(frameGeom, frameMat);
frameMesh.position.set(-centerOffsetX + frameW/2 - FRAME_MARGIN, 0, -centerOffsetZ + frameD/2 - FRAME_MARGIN);
frameMesh.castShadow = false;
frameMesh.receiveShadow = true;
keyboardGroup.add(frameMesh);

// Inner black plate
const plateW = maxX + 0.22;
const plateD = maxZ + 0.22;
const plateH = 0.1;
const plateGeom = new RoundedBoxGeometry(plateW, plateH, plateD, 4, 0.08);
const plateMat = new THREE.MeshStandardMaterial({ color: COLORS.plate, roughness: 0.9, metalness: 0.0 });
const plate = new THREE.Mesh(plateGeom, plateMat);
plate.position.set(
  frameMesh.position.x,
  frameH/2 + plateH/2 - 0.03,
  frameMesh.position.z
);
plate.castShadow = false;
plate.receiveShadow = true;
keyboardGroup.add(plate);

// Keycap base geometry (1u); scale per key
const keyGeom = new RoundedBoxGeometry(1, KEY_HEIGHT, 1, 5, 0.12);

// Interactives
const interactives = [];

function makeLegendSprite(text, widthU, heightU) {
  const scale = 256;
  const w = Math.max(128, Math.ceil(widthU * scale));
  const h = Math.max(128, Math.ceil(heightU * scale));
  const cvs = document.createElement('canvas');
  cvs.width = w; cvs.height = h;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = COLORS.legends;
  ctx.font = `${Math.floor(h * 0.45)}px Inter, system-ui, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  // size sprite relative to key top
  sprite.scale.set(widthU * 0.7, heightU * 0.5, 1);
  return sprite;
}

function createKeycap({ id, legend, color, c, r, w = 1, h = 1, group }) {
  const groupNode = new THREE.Group();
  groupNode.userData = { id, groupName: group || id, isKey: true, pressed: false, offset: 0, targetOffset: 0 };

  // Main cap
  const mat = createStandardMaterial(color);
  const mesh = new THREE.Mesh(keyGeom, mat);
  mesh.scale.set(w, 1, h);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  groupNode.add(mesh);

  // Sculpted top feel: add a slightly smaller top piece to catch highlights
  const topGeom = new RoundedBoxGeometry(1 * KEY_TOP_SHRINK, 0.02, 1 * KEY_TOP_SHRINK, 4, 0.06);
  const topMat = new THREE.MeshPhysicalMaterial({ color: color, roughness: 0.4, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.7 });
  const top = new THREE.Mesh(topGeom, topMat);
  top.position.y = KEY_HEIGHT/2 + 0.01;
  top.scale.set(w, 1, h);
  top.castShadow = false;
  top.receiveShadow = false;
  groupNode.add(top);

  // Legend
  const label = legend || id.replace('EnterTop', 'Enter').replace('EnterVert', '');
  if (label) {
    const sprite = makeLegendSprite(label, w, h);
    sprite.position.set(0, KEY_HEIGHT/2 + 0.015, 0);
    groupNode.add(sprite);
  }

  // Position key by its left/front edges plus centering offset
  const xLeft = col(c);
  const zFront = row(r);
  const xCenter = xLeft + w / 2;
  const zCenter = zFront + h / 2;

  groupNode.position.set(
    -centerOffsetX + xCenter,
    frameH/2 + plateH + KEY_HEIGHT/2,
    -centerOffsetZ + zCenter
  );

  // Press/release helpers
  groupNode.userData.press = () => { groupNode.userData.targetOffset = -TRAVEL; };
  groupNode.userData.release = () => { groupNode.userData.targetOffset = 0; };

  keyboardGroup.add(groupNode);
  interactives.push(groupNode);
  return groupNode;
}

// Build keys
const idToGroupName = new Map();
const groupNameToKey = new Map();
for (const k of layout) {
  const node = createKeycap(k);
  idToGroupName.set(k.id, node.userData.groupName);
  groupNameToKey.set(node.userData.groupName, node);
}

// Merge Enter parts under a single group for interaction
(function mergeEnter() {
  const top = groupNameToKey.get('EnterTop');
  const vert = groupNameToKey.get('EnterVert');
  if (!top || !vert) return; // safety

  const enterGroup = new THREE.Group();
  enterGroup.userData = { id: 'Enter', groupName: 'Enter', isKey: true, pressed: false, offset: 0, targetOffset: 0 };
  // Place enter group at top's position so animation origin makes sense
  enterGroup.position.copy(top.position);
  keyboardGroup.add(enterGroup);

  // Reparent while preserving each piece's world transform
  enterGroup.attach(top);
  enterGroup.attach(vert);

  // Replace interactives: remove the two pieces, add the group
  const idxTop = interactives.indexOf(top); if (idxTop >= 0) interactives.splice(idxTop, 1);
  const idxVert = interactives.indexOf(vert); if (idxVert >= 0) interactives.splice(idxVert, 1);
  interactives.push(enterGroup);
  groupNameToKey.set('Enter', enterGroup);
})();

// Ground to catch shadows (invisible)
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: 0.15 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let pointerDown = false;
let lastIntersected = null;

function getKeyFromIntersection(intersections) {
  for (const hit of intersections) {
    let obj = hit.object;
    while (obj && obj !== scene) {
      if (obj.userData && obj.userData.isKey) return obj;
      obj = obj.parent;
    }
  }
  return null;
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(e) {
  pointerDown = true;
  raycaster.setFromCamera(ndc, camera);
  const intersections = raycaster.intersectObjects(keyboardGroup.children, true);
  const key = getKeyFromIntersection(intersections);
  if (key) {
    key.userData.press();
    lastIntersected = key;
  }
}

function onPointerUp() {
  pointerDown = false;
  // release all keys smoothly
  for (const k of interactives) k.userData.release();
  lastIntersected = null;
}

renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointerup', onPointerUp);

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);

  // per-key easing between current offset and target offset (critically damped spring-ish)
  const spring = 22.0; // higher = snappier
  const damping = 32.0; // controls overshoot

  for (const key of interactives) {
    const u = key.userData;
    const diff = u.targetOffset - u.offset;
    const accel = diff * spring;
    // integrate simple critically damped motion
    u.velocity = (u.velocity || 0) + accel * dt;
    u.velocity *= Math.exp(-damping * dt);
    u.offset += u.velocity * dt;

    key.position.y = frameH/2 + plateH + KEY_HEIGHT/2 + u.offset;
    // tiny tilt for realism when pressed
    const tilt = THREE.MathUtils.mapLinear(u.offset, 0, -TRAVEL, 0, -0.03);
    key.rotation.x = tilt;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsiveness
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});