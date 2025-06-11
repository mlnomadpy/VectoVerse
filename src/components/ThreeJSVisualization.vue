<template>
  <div class="threejs-container">
    <div class="threejs-header">
      <h3>3D Vector Visualization</h3>
      <div class="threejs-controls">
        <button
          class="btn-3d"
          :class="{ active: settings.showAxes }"
          @click="toggleAxes"
        >
          📐 Axes
        </button>
        <button
          class="btn-3d"
          :class="{ active: settings.showGrid }"
          @click="toggleGrid"
        >
          📊 Grid
        </button>
        <button
          class="btn-3d"
          :class="{ active: settings.autoRotate }"
          @click="toggleAutoRotate"
        >
          🔄 Auto Rotate
        </button>
        <button class="btn-3d" @click="resetCamera">
          🏠 Reset View
        </button>
        <button class="btn-3d" @click="exportScene">
          📸 Export
        </button>
      </div>
    </div>
    
    <div
      ref="threejsContainer"
      class="threejs-viewport"
      @mousemove="onMouseMove"
      @click="onClick"
    >
      <!-- Canvas will be inserted here by Three.js -->
    </div>
    
    <div class="threejs-sidebar">
      <div class="settings-panel">
        <h4>Visualization Settings</h4>
        
        <div class="setting-group">
          <label>Point Size:</label>
          <input
            v-model.number="settings.pointSize"
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            @input="updatePointSize"
          >
          <span>{{ settings.pointSize.toFixed(2) }}</span>
        </div>
        
        <div class="setting-group">
          <label>Background:</label>
          <select v-model="backgroundTheme" @change="updateBackground">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="space">Space</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label>Lighting:</label>
          <input
            v-model.number="lightingIntensity"
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            @input="updateLighting"
          >
          <span>{{ lightingIntensity.toFixed(1) }}</span>
        </div>
      </div>
      
      <div class="info-panel">
        <h4>Scene Info</h4>
        <div class="info-item">
          <span>Vectors:</span>
          <span>{{ vectorCount }}</span>
        </div>
        <div class="info-item">
          <span>Dimensions:</span>
          <span>{{ dimensions }}D</span>
        </div>
        <div class="info-item">
          <span>Selected:</span>
          <span>{{ selectedVector || 'None' }}</span>
        </div>
        <div class="info-item">
          <span>Camera:</span>
          <span>{{ cameraPosition }}</span>
        </div>
      </div>
      
      <div v-if="hoveredVector" class="hover-tooltip">
        <h4>Vector {{ hoveredVector.id }}</h4>
        <div class="tooltip-content">
          <div>Magnitude: {{ hoveredVector.magnitude?.toFixed(3) }}</div>
          <div>Position: [{{ hoveredVector.position?.map(p => p.toFixed(2)).join(', ') }}]</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useVectorStore } from '@/stores/vectorStore'
import { useUIStore } from '@/stores/uiStore'
import * as THREE from 'three'

const props = defineProps({
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  }
})

const emit = defineEmits(['vectorSelected', 'sceneUpdated'])

const vectorStore = useVectorStore()
const uiStore = useUIStore()

// Refs
const threejsContainer = ref(null)

// Three.js objects
let scene = null
let camera = null
let renderer = null
let raycaster = null
let mouse = null
let vectorPoints = []
let animationId = null

// State
const settings = ref({
  pointSize: 0.05,
  showAxes: true,
  showGrid: true,
  autoRotate: false,
  backgroundColor: 0x1a1a1a
})

const backgroundTheme = ref('dark')
const lightingIntensity = ref(1.0)
const hoveredVector = ref(null)
const selectedVector = ref(null)

// Computed
const vectorCount = computed(() => vectorStore.vectors.length)
const dimensions = computed(() => vectorStore.dimensions)
const cameraPosition = computed(() => {
  if (!camera) return 'N/A'
  return `(${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)})`
})

// Methods
const initThreeJS = () => {
  if (!threejsContainer.value) return

  // Scene
  scene = new THREE.Scene()
  updateBackground()

  // Camera
  const aspect = props.width / props.height
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(props.width, props.height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  threejsContainer.value.appendChild(renderer.domElement)

  // Raycaster for mouse interaction
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Lighting
  createLighting()

  // Axes and Grid
  if (settings.value.showAxes) createAxes()
  if (settings.value.showGrid) createGrid()

  // Controls
  setupControls()

  // Start animation loop
  animate()
}

const createLighting = () => {
  // Remove existing lights
  const existingLights = scene.children.filter(child => child.isLight)
  existingLights.forEach(light => scene.remove(light))

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6 * lightingIntensity.value)
  scene.add(ambientLight)

  // Directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8 * lightingIntensity.value)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // Point light
  const pointLight = new THREE.PointLight(0xffffff, 0.5 * lightingIntensity.value, 100)
  pointLight.position.set(0, 10, 0)
  scene.add(pointLight)
}

const createAxes = () => {
  const axesHelper = new THREE.AxesHelper(5)
  axesHelper.name = 'axes'
  scene.add(axesHelper)
}

const createGrid = () => {
  const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
  gridHelper.name = 'grid'
  scene.add(gridHelper)
}

const setupControls = () => {
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }

  const canvas = renderer.domElement

  canvas.addEventListener('mousedown', (event) => {
    isDragging = true
    previousMousePosition = { x: event.clientX, y: event.clientY }
  })

  canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      }

      const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          toRadians(deltaMove.y * 1),
          toRadians(deltaMove.x * 1),
          0,
          'XYZ'
        ))

      camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, camera.quaternion)
      previousMousePosition = { x: event.clientX, y: event.clientY }
    }
  })

  canvas.addEventListener('mouseup', () => {
    isDragging = false
  })

  canvas.addEventListener('wheel', (event) => {
    const scale = event.deltaY > 0 ? 1.1 : 0.9
    camera.position.multiplyScalar(scale)
  })

  function toRadians(angle) {
    return angle * (Math.PI / 180)
  }
}

const updateVectors = () => {
  // Clear existing vector points
  vectorPoints.forEach(point => scene.remove(point))
  vectorPoints = []

  // Create new vector points
  vectorStore.vectors.forEach(vector => {
    const geometry = new THREE.SphereGeometry(settings.value.pointSize, 16, 16)
    const material = new THREE.MeshLambertMaterial({
      color: vector.id === selectedVector.value ? 0xFF5722 : 0x4CAF50
    })
    
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.copy(vectorToPosition(vector))
    sphere.userData = { vectorId: vector.id, vector }
    sphere.castShadow = true
    
    scene.add(sphere)
    vectorPoints.push(sphere)
  })
}

const vectorToPosition = (vector) => {
  // Convert vector components to 3D position
  const position = new THREE.Vector3()
  
  if (vector.components.length >= 3) {
    position.set(
      vector.components[0],
      vector.components[1],
      vector.components[2]
    )
  } else if (vector.components.length === 2) {
    position.set(
      vector.components[0],
      vector.components[1],
      0
    )
  } else {
    position.set(vector.components[0] || 0, 0, 0)
  }
  
  return position
}

const onMouseMove = (event) => {
  if (!renderer) return

  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Raycasting for hover detection
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(vectorPoints)

  // Reset previous hover
  if (hoveredVector.value) {
    const prevHover = vectorPoints.find(p => p.userData.vectorId === hoveredVector.value.id)
    if (prevHover) {
      prevHover.material.color.setHex(0x4CAF50)
    }
    hoveredVector.value = null
  }

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object
    intersectedObject.material.color.setHex(0x2196F3)
    hoveredVector.value = intersectedObject.userData.vector
  }
}

const onClick = (event) => {
  if (!renderer) return

  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(vectorPoints)

  if (intersects.length > 0) {
    const vectorId = intersects[0].object.userData.vectorId
    vectorStore.selectVector(vectorId)
    selectedVector.value = vectorId
    emit('vectorSelected', vectorId)
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (settings.value.autoRotate) {
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.01)
    camera.lookAt(0, 0, 0)
  }

  renderer.render(scene, camera)
}

const updateBackground = () => {
  if (!scene) return

  const themes = {
    dark: 0x1a1a1a,
    light: 0xf0f0f0,
    space: 0x000011,
    gradient: 0x2a1810
  }

  scene.background = new THREE.Color(themes[backgroundTheme.value] || themes.dark)
  settings.value.backgroundColor = themes[backgroundTheme.value] || themes.dark
}

const updateLighting = () => {
  createLighting()
}

const updatePointSize = () => {
  vectorPoints.forEach(point => {
    point.geometry.dispose()
    point.geometry = new THREE.SphereGeometry(settings.value.pointSize, 16, 16)
  })
}

const toggleAxes = () => {
  settings.value.showAxes = !settings.value.showAxes
  
  const axes = scene.getObjectByName('axes')
  if (axes) {
    scene.remove(axes)
  } else {
    createAxes()
  }
}

const toggleGrid = () => {
  settings.value.showGrid = !settings.value.showGrid
  
  const grid = scene.getObjectByName('grid')
  if (grid) {
    scene.remove(grid)
  } else {
    createGrid()
  }
}

const toggleAutoRotate = () => {
  settings.value.autoRotate = !settings.value.autoRotate
}

const resetCamera = () => {
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)
}

const exportScene = () => {
  if (!renderer) return

  try {
    const canvas = renderer.domElement
    const link = document.createElement('a')
    link.download = `vectoverse-3d-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
    
    uiStore.showSuccess('3D scene exported as image')
  } catch (error) {
    console.error('Export error:', error)
    uiStore.showError('Failed to export 3D scene')
  }
}

const dispose = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  if (renderer) {
    renderer.dispose()
  }
  
  vectorPoints.forEach(point => {
    point.geometry.dispose()
    point.material.dispose()
  })
}

// Watchers
watch(() => vectorStore.vectors, updateVectors, { deep: true })
watch(() => vectorStore.selectedVectorId, (newId) => {
  selectedVector.value = newId
  updateVectors()
})

// Lifecycle
onMounted(() => {
  initThreeJS()
  updateVectors()
})

onUnmounted(() => {
  dispose()
})
</script>

<style scoped>
.threejs-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  gap: 16px;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.threejs-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.threejs-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
}

.threejs-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-3d {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-3d:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-3d.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.threejs-viewport {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.threejs-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-panel,
.info-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-panel h4,
.info-panel h4 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 14px;
}

.setting-group {
  margin-bottom: 16px;
}

.setting-group label {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.setting-group input[type="range"] {
  width: 100%;
  margin-bottom: 4px;
}

.setting-group select {
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
}

.setting-group span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.info-item span:first-child {
  color: rgba(255, 255, 255, 0.7);
}

.info-item span:last-child {
  color: white;
  font-weight: 500;
}

.hover-tooltip {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.hover-tooltip h4 {
  margin: 0 0 8px 0;
  color: #667eea;
  font-size: 13px;
}

.tooltip-content {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.tooltip-content div {
  margin-bottom: 4px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .threejs-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }
  
  .threejs-sidebar {
    grid-row: 2;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .settings-panel,
  .info-panel {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .threejs-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .threejs-controls {
    justify-content: center;
  }
  
  .threejs-sidebar {
    flex-direction: column;
  }
}
</style> 