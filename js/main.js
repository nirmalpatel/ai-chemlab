import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Beaker } from './beaker.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

class ChemistryLab {
    constructor() {
        this.container = document.getElementById('scene-container');
        
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Setup renderer - moved before environment map setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // Add environment map for glass refraction
        this.setupEnvironmentMap();
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            45, // fov
            window.innerWidth / window.innerHeight, // aspect
            0.1, // near
            1000 // far
        );
        this.camera.position.set(0, 10, 20);
        
        // Setup orbit controls
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        
        // Setup lighting
        this.setupLights();
        
        // Setup lab table
        this.setupLabTable();
        
        // Create beakers
        this.beakers = [];
        this.createBeakers();
        
        // Setup drag controls
        this.setupDragControls();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    setupEnvironmentMap() {
        // Simplified environment map setup without PMREMGenerator
        const envTexture = new THREE.CubeTextureLoader().load([
            'https://threejs.org/examples/textures/cube/pisa/px.png',
            'https://threejs.org/examples/textures/cube/pisa/nx.png',
            'https://threejs.org/examples/textures/cube/pisa/py.png',
            'https://threejs.org/examples/textures/cube/pisa/ny.png',
            'https://threejs.org/examples/textures/cube/pisa/pz.png',
            'https://threejs.org/examples/textures/cube/pisa/nz.png'
        ]);
        
        this.scene.environment = envTexture;
    }
    
    setupLights() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light for shadows
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);
    }
    
    setupLabTable() {
        // Create a simple gray floor
        const floorGeometry = new THREE.PlaneGeometry(30, 15);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc, 
            roughness: 0.7 
        });
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.floor.position.y = 0;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
        
        // Add grid for reference
        const gridHelper = new THREE.GridHelper(30, 30);
        gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
        this.scene.add(gridHelper);
    }
    
    createBeakers() {
        // Create first beaker with blue liquid
        const beaker1 = new Beaker(2, 4, 0x3498db, 0.8);
        beaker1.position.set(-5, 0, 0);
        this.scene.add(beaker1);
        this.beakers.push(beaker1);
        
        // Create second empty beaker
        const beaker2 = new Beaker(2, 4, 0x3498db, 0);
        beaker2.position.set(5, 0, 0);
        this.scene.add(beaker2);
        this.beakers.push(beaker2);
        
        // Ensure beakers are positioned correctly on table
        for (const beaker of this.beakers) {
            beaker.position.y = 0; // Position at table level
        }
    }
    
    setupDragControls() {
        this.dragControls = new DragControls(this.beakers, this.camera, this.renderer.domElement);
        
        this.dragControls.addEventListener('dragstart', () => {
            this.orbitControls.enabled = false;
        });
        
        this.dragControls.addEventListener('dragend', (event) => {
            this.orbitControls.enabled = true;
            
            // Check if we're pouring into another beaker
            const draggedBeaker = event.object;
            
            if (draggedBeaker.rotation.z > 0.3) {  // If beaker is tilted enough
                for (const targetBeaker of this.beakers) {
                    if (targetBeaker !== draggedBeaker) {
                        const distance = draggedBeaker.position.distanceTo(targetBeaker.position);
                        
                        if (distance < 8) {  // If beakers are close enough
                            this.pourLiquid(draggedBeaker, targetBeaker);
                        }
                    }
                }
            }
            
            // Reset beaker rotation
            draggedBeaker.rotation.set(0, 0, 0);
            
            // Ensure beaker stays on floor
            if (draggedBeaker.position.y < 0) {
                draggedBeaker.position.y = 0;
            }
            
            // Keep beakers within floor bounds
            const FLOOR_HALF_WIDTH = 15;
            const FLOOR_HALF_DEPTH = 7.5;
            draggedBeaker.position.x = Math.max(-FLOOR_HALF_WIDTH, Math.min(FLOOR_HALF_WIDTH, draggedBeaker.position.x));
            draggedBeaker.position.z = Math.max(-FLOOR_HALF_DEPTH, Math.min(FLOOR_HALF_DEPTH, draggedBeaker.position.z));
        });
        
        this.dragControls.addEventListener('drag', (event) => {
            const draggedBeaker = event.object;
            
            // Limit movement to horizontal plane, but never below table
            draggedBeaker.position.y = Math.max(0, draggedBeaker.position.y);
            
            // Allow tilting the beaker when dragged upward
            if (event.object.userData.prevY !== undefined) {
                const deltaY = event.object.userData.prevY - event.object.position.y;
                draggedBeaker.rotation.z = Math.max(0, Math.min(Math.PI / 3, draggedBeaker.rotation.z + deltaY));
            }
            
            event.object.userData.prevY = event.object.position.y;
        });
    }
    
    pourLiquid(sourceBeaker, targetBeaker) {
        if (sourceBeaker.liquidLevel > 0.1) {
            // Transfer some liquid
            const amountToPour = Math.min(sourceBeaker.liquidLevel, 0.2);
            sourceBeaker.setLiquidLevel(sourceBeaker.liquidLevel - amountToPour);
            targetBeaker.setLiquidLevel(targetBeaker.liquidLevel + amountToPour);
            
            // Transfer color if target is empty
            if (targetBeaker.liquidLevel <= amountToPour) {
                targetBeaker.setLiquidColor(sourceBeaker.liquidColor);
            } else {
                // Mix colors (simplified)
                const mixedColor = new THREE.Color().addColors(
                    targetBeaker.liquidColor,
                    sourceBeaker.liquidColor
                ).multiplyScalar(0.5);
                targetBeaker.setLiquidColor(mixedColor);
            }
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.orbitControls.update();
        
        // Update any animations or simulations
        for (const beaker of this.beakers) {
            beaker.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the lab when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    const lab = new ChemistryLab();
});
