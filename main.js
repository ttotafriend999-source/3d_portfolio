import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Scene, Camera, Renderer 초기화
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. 조명 설정 (기본 조명 + 방향광)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// 3. 컨트롤 (마우스/터치 드래그로 회전/확대)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 4. GLTF/GLB 로더 설정
const loader = new GLTFLoader();
let currentModel = null;

// 모델 불러오기 함수
function loadModel(filePath) {
  if (currentModel) {
    scene.remove(currentModel);
  }

  loader.load(
    filePath,
    (gltf) => {
      currentModel = gltf.scene;

      // 1. 모델의 바운딩 박스(크기 및 중심) 계산
      const box = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 2. 모델의 중심을 화면 원점(0,0,0)으로 이동
      currentModel.position.x += (currentModel.position.x - center.x);
      currentModel.position.y += (currentModel.position.y - center.y);
      currentModel.position.z += (currentModel.position.z - center.z);

      scene.add(currentModel);

      // 3. 모델 크기에 맞춰 카메라 위치 및 컨트롤 거리 자동 설정
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

      // 너무 가까우거나 멀지 않게 최소값 보정
      cameraZ = Math.max(cameraZ, 5);

      camera.position.set(0, maxDim / 2, cameraZ);
      camera.lookAt(0, 0, 0);
      
      controls.target.set(0, 0, 0);
      controls.update();
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% 완료');
    },
    (error) => {
      console.error('모델 로드 실패:', error);
    }
  );
}