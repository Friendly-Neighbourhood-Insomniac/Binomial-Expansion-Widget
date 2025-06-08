// Particle system for visual effects
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isEnabled = false;
        this.animationId = null;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticle(x, y, type = 'default') {
        const particle = {
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.005,
            size: Math.random() * 4 + 2,
            color: this.getParticleColor(type),
            type: type
        };
        
        this.particles.push(particle);
    }
    
    getParticleColor(type) {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        
        switch (type) {
            case 'coefficient':
                return isDark ? '#D61EFF' : '#4A2181';
            case 'term':
                return isDark ? '#00BFFF' : '#0099CC';
            case 'pascal':
                return isDark ? '#A742B2' : '#6B46C1';
            default:
                return isDark ? '#FFFFFF' : '#333333';
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update life
            particle.life -= particle.decay;
            
            // Add some physics
            particle.vy += 0.1; // gravity
            particle.vx *= 0.99; // air resistance
            particle.vy *= 0.99;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    renderParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const particle of this.particles) {
            this.ctx.save();
            
            // Set opacity based on life
            this.ctx.globalAlpha = particle.life;
            
            // Draw particle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            
            if (particle.type === 'coefficient') {
                // Draw as star
                this.drawStar(particle.x, particle.y, particle.size);
            } else if (particle.type === 'term') {
                // Draw as circle
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            } else {
                // Draw as square
                this.ctx.rect(
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
            }
            
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawStar(x, y, size) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size * 0.5;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        
        this.ctx.closePath();
    }
    
    animate() {
        if (!this.isEnabled) return;
        
        this.updateParticles();
        this.renderParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        this.isEnabled = true;
        this.animate();
    }
    
    stop() {
        this.isEnabled = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    burst(x, y, count = 10, type = 'default') {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, type);
        }
    }
    
    // Create particles when terms change
    onTermChange(termElement, type = 'term') {
        if (!this.isEnabled) return;
        
        const rect = termElement.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.burst(x, y, 5, type);
    }
    
    // Create particles when Pascal's triangle updates
    onPascalUpdate(pascalElement) {
        if (!this.isEnabled) return;
        
        const numbers = pascalElement.querySelectorAll('.pascal-number');
        numbers.forEach((number, index) => {
            setTimeout(() => {
                const rect = number.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                this.burst(x, y, 3, 'pascal');
            }, index * 100);
        });
    }
}

// Initialize particle system
let particleSystem = null;

function initParticles() {
    try {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        
        particleSystem = new ParticleSystem(canvas);
        
        // Listen for particle toggle
        const particleToggle = document.getElementById('enableParticles');
        if (particleToggle) {
            particleToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    particleSystem.start();
                } else {
                    particleSystem.stop();
                }
            });
        }
        
        // Create particles on various interactions
        document.addEventListener('click', (e) => {
            if (!particleSystem.isEnabled) return;
            
            // Create particles on Pascal's triangle clicks
            if (e.target.classList.contains('pascal-number')) {
                particleSystem.onTermChange(e.target, 'coefficient');
            }
            
            // Create particles on term clicks
            if (e.target.closest('.term-item')) {
                particleSystem.onTermChange(e.target.closest('.term-item'), 'term');
            }
        });
        
        // Create particles when sliders change
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                if (!particleSystem.isEnabled) return;
                
                const rect = e.target.getBoundingClientRect();
                const x = rect.left + (rect.width * (e.target.value - e.target.min) / (e.target.max - e.target.min));
                const y = rect.top + rect.height / 2;
                
                particleSystem.burst(x, y, 2, 'default');
            });
        });
        
    } catch (error) {
        console.error('Error initializing particles:', error);
    }
}

// Export functions
window.initParticles = initParticles;
window.particleSystem = () => particleSystem;