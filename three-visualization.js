import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let surfaceMesh, particleSystem;
let autoRotate = false;
let animationId;

// Initialize 3D visualization
function init3DVisualization() {
    try {
        const container = document.getElementById('threejsContainer');
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Scene setup
        scene = new THREE.Scene();
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xf5f5f5);
        
        // Camera setup
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(10, 10, 10);
        
        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        
        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 2.0;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0xD61EFF, 0.5, 50);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x00BFFF, 0.5, 50);
        pointLight2.position.set(-5, 5, -5);
        scene.add(pointLight2);
        
        // Create initial surface
        createBinomialSurface();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Start animation loop
        animate();
        
    } catch (error) {
        console.error('Error initializing 3D visualization:', error);
    }
}

// Create binomial coefficient surface
function createBinomialSurface() {
    try {
        // Remove existing surface
        if (surfaceMesh) {
            scene.remove(surfaceMesh);
        }
        
        const maxN = 12;
        const geometry = new THREE.PlaneGeometry(20, 20, maxN, maxN);
        const positions = geometry.attributes.position;
        const colors = [];
        
        // Calculate binomial coefficients and create height map
        for (let i = 0; i <= maxN; i++) {
            for (let j = 0; j <= maxN; j++) {
                const index = i * (maxN + 1) + j;
                
                if (j <= i) {
                    // Calculate binomial coefficient
                    const coeff = binomialCoefficient(i, j);
                    const height = Math.log(coeff + 1) * 2; // Logarithmic scale for better visualization
                    
                    positions.setZ(index, height);
                    
                    // Color based on coefficient value
                    const normalizedCoeff = Math.min(coeff / 100, 1);
                    const color = new THREE.Color();
                    color.setHSL(0.8 - normalizedCoeff * 0.3, 0.8, 0.5 + normalizedCoeff * 0.3);
                    colors.push(color.r, color.g, color.b);
                } else {
                    // Set to zero for invalid combinations
                    positions.setZ(index, 0);
                    colors.push(0.2, 0.2, 0.2);
                }
            }
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();
        
        // Create material with vertex colors
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            shininess: 100,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        surfaceMesh = new THREE.Mesh(geometry, material);
        surfaceMesh.rotation.x = -Math.PI / 2;
        surfaceMesh.position.y = -2;
        surfaceMesh.castShadow = true;
        surfaceMesh.receiveShadow = true;
        
        scene.add(surfaceMesh);
        
        // Add wireframe overlay
        const wireframeGeometry = geometry.clone();
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x4A2181,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        
        const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        wireframeMesh.rotation.x = -Math.PI / 2;
        wireframeMesh.position.y = -1.9;
        
        scene.add(wireframeMesh);
        
        // Add coefficient labels
        addCoefficientLabels();
        
    } catch (error) {
        console.error('Error creating binomial surface:', error);
    }
}

// Add 3D text labels for coefficients
function addCoefficientLabels() {
    try {
        // This would require loading a font, simplified for now
        const maxN = 8; // Limit labels for performance
        
        for (let i = 0; i <= maxN; i++) {
            for (let j = 0; j <= i; j++) {
                const coeff = binomialCoefficient(i, j);
                
                // Create simple text sprite
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 64;
                canvas.height = 32;
                
                context.fillStyle = '#FFFFFF';
                context.font = '12px Arial';
                context.textAlign = 'center';
                context.fillText(coeff.toString(), 32, 20);
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                
                const x = (j - i / 2) * 2;
                const z = (i - maxN / 2) * 2;
                const y = Math.log(coeff + 1) * 2 + 1;
                
                sprite.position.set(x, y, z);
                sprite.scale.set(2, 1, 1);
                
                scene.add(sprite);
            }
        }
    } catch (error) {
        console.error('Error adding coefficient labels:', error);
    }
}

// Binomial coefficient calculation (same as main script)
function binomialCoefficient(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result = result * (n - i + 1) / i;
    }
    return Math.round(result);
}

// Update 3D visualization with current terms
function update3DVisualization(terms) {
    try {
        if (!scene || !surfaceMesh) return;
        
        // Highlight current power level
        const n = terms.length - 1;
        
        // Add particle effects for current terms
        if (particleSystem) {
            scene.remove(particleSystem);
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        const particleColors = [];
        
        terms.forEach((term, index) => {
            const x = (index - n / 2) * 2;
            const z = (n - 6) * 2;
            const y = Math.log(term.coefficient + 1) * 2 + 2;
            
            particlePositions.push(x, y, z);
            
            // Color based on term value
            const color = new THREE.Color();
            color.setHSL(0.8, 0.8, 0.7);
            particleColors.push(color.r, color.g, color.b);
        });
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);
        
    } catch (error) {
        console.error('Error updating 3D visualization:', error);
    }
}

// Animation loop
function animate() {
    try {
        animationId = requestAnimationFrame(animate);
        
        if (controls) {
            controls.update();
        }
        
        // Animate particles
        if (particleSystem) {
            particleSystem.rotation.y += 0.01;
        }
        
        // Animate surface
        if (surfaceMesh) {
            const time = Date.now() * 0.001;
            surfaceMesh.material.opacity = 0.8 + Math.sin(time) * 0.1;
        }
        
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        
    } catch (error) {
        console.error('Error in animation loop:', error);
    }
}

// Handle window resize
function onWindowResize() {
    try {
        const container = document.getElementById('threejsContainer');
        if (!container || !camera || !renderer) return;
        
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(container.clientWidth, container.clientHeight);
    } catch (error) {
        console.error('Error handling window resize:', error);
    }
}

// Reset camera position
function resetCamera() {
    try {
        if (camera && controls) {
            camera.position.set(10, 10, 10);
            controls.reset();
        }
    } catch (error) {
        console.error('Error resetting camera:', error);
    }
}

// Toggle auto rotation
function toggleAutoRotate() {
    try {
        if (controls) {
            autoRotate = !autoRotate;
            controls.autoRotate = autoRotate;
            
            const button = document.getElementById('autoRotate');
            if (button) {
                button.textContent = autoRotate ? 'Stop Rotation' : 'Auto Rotate';
            }
        }
    } catch (error) {
        console.error('Error toggling auto rotate:', error);
    }
}

// Cleanup function
function cleanup3D() {
    try {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        if (renderer) {
            renderer.dispose();
        }
        
        window.removeEventListener('resize', onWindowResize);
    } catch (error) {
        console.error('Error cleaning up 3D visualization:', error);
    }
}

// Export functions
window.init3DVisualization = init3DVisualization;
window.update3DVisualization = update3DVisualization;
window.resetCamera = resetCamera;
window.toggleAutoRotate = toggleAutoRotate;
window.cleanup3D = cleanup3D;