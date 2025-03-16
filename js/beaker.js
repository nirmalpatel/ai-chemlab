import * as THREE from 'three';
import { CSG } from 'three-csg-ts';

export class Beaker extends THREE.Group {
    constructor(radius = 2, height = 4, liquidColor = 0x3498db, liquidLevel = 0.5) {
        super();
        
        this.radius = radius;
        this.height = height;
        this.liquidColor = new THREE.Color(liquidColor);
        this.liquidLevel = liquidLevel;
        
        this.createBeaker();
        this.createLiquid();
    }
    
    createBeaker() {
        // Create glass material with improved transparency
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.05,
            transmission: 0.95,
            thickness: 0.05,
            envMapIntensity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.1
        });
        
        // Create beaker using boolean operations to make it truly hollow
        const outerGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32);
        const innerGeometry = new THREE.CylinderGeometry(this.radius - 0.15, this.radius - 0.15, this.height - 0.2, 32);
        
        const outerMesh = new THREE.Mesh(outerGeometry, glassMaterial);
        const innerMesh = new THREE.Mesh(innerGeometry);
        innerMesh.position.y = 0.1; // Slightly raise the inner cylinder to leave a bottom
        
        // Alternative approach without CSG
        // Use separate meshes instead of boolean operations
        outerMesh.castShadow = true;
        outerMesh.receiveShadow = true;
        this.add(outerMesh);
        
        // Create bottom of beaker
        const bottomGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 0.2, 32);
        const bottomMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.05,
            transmission: 0.95
        });
        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottom.position.y = -this.height / 2 + 0.1;
        bottom.castShadow = true;
        this.add(bottom);
        
        // Add rim to top (small torus)
        const rimGeometry = new THREE.TorusGeometry(this.radius, 0.1, 16, 32);
        const rim = new THREE.Mesh(rimGeometry, glassMaterial);
        rim.position.y = this.height / 2;
        rim.rotation.x = Math.PI / 2;
        rim.castShadow = true;
        this.add(rim);
        
        // Store inner radius for liquid
        this.innerRadius = this.radius - 0.15;
    }
    
    createLiquid() {
        // Create liquid material with improved appearance
        this.liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: this.liquidColor,
            transparent: true,
            opacity: 0.8,
            roughness: 0.0,
            transmission: 0.3,
            ior: 1.4
        });
        
        // Calculate liquid height based on level
        const liquidHeight = this.height * this.liquidLevel;
        const liquidGeometry = new THREE.CylinderGeometry(
            this.innerRadius, 
            this.innerRadius, 
            liquidHeight, 
            32
        );
        
        // Create liquid mesh
        this.liquidMesh = new THREE.Mesh(liquidGeometry, this.liquidMaterial);
        this.liquidMesh.position.y = -this.height / 2 + liquidHeight / 2 + 0.1; // Raise slightly above bottom
        
        // Add to group
        this.add(this.liquidMesh);
    }
    
    update() {
        // Update liquid wobble or any animations (can be implemented later)
    }
    
    setLiquidLevel(level) {
        this.liquidLevel = Math.max(0, Math.min(1, level));
        
        // Remove old liquid
        this.remove(this.liquidMesh);
        
        // Create new liquid with updated level
        const liquidHeight = this.height * this.liquidLevel;
        if (liquidHeight > 0) {
            const liquidGeometry = new THREE.CylinderGeometry(
                this.innerRadius, 
                this.innerRadius, 
                liquidHeight, 
                32
            );
            
            this.liquidMesh = new THREE.Mesh(liquidGeometry, this.liquidMaterial);
            this.liquidMesh.position.y = -this.height / 2 + liquidHeight / 2 + 0.1; // Raise slightly above bottom
            this.add(this.liquidMesh);
        }
    }
    
    setLiquidColor(color) {
        this.liquidColor = color;
        this.liquidMaterial.color.set(color);
    }
}
