// Performance monitoring and optimization
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            calculationTime: 0,
            renderTime: 0
        };
        
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.isMonitoring = false;
        
        this.init();
    }
    
    init() {
        this.startMonitoring();
        this.setupPerformanceObserver();
    }
    
    startMonitoring() {
        this.isMonitoring = true;
        this.monitorLoop();
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
    }
    
    monitorLoop() {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        this.frameCount++;
        
        // Calculate FPS every second
        if (currentTime - this.lastTime >= 1000) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.metrics.frameTime = (currentTime - this.lastTime) / this.frameCount;
            
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.updateDisplay();
            this.checkPerformance();
        }
        
        // Monitor memory usage if available
        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        requestAnimationFrame(() => this.monitorLoop());
    }
    
    setupPerformanceObserver() {
        try {
            // Monitor long tasks
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.duration > 50) {
                            console.warn(`Long task detected: ${entry.duration}ms`);
                            this.optimizePerformance();
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            }
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }
    
    measureCalculationTime(fn, context = 'calculation') {
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();
        
        this.metrics.calculationTime = endTime - startTime;
        
        if (this.metrics.calculationTime > 16) {
            console.warn(`Slow ${context}: ${this.metrics.calculationTime.toFixed(2)}ms`);
        }
        
        return result;
    }
    
    measureRenderTime(fn, context = 'render') {
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();
        
        this.metrics.renderTime = endTime - startTime;
        
        if (this.metrics.renderTime > 16) {
            console.warn(`Slow ${context}: ${this.metrics.renderTime.toFixed(2)}ms`);
        }
        
        return result;
    }
    
    updateDisplay() {
        const fpsElement = document.getElementById('fpsCounter');
        const calcTimeElement = document.getElementById('calcTime');
        
        if (fpsElement) {
            fpsElement.textContent = `${this.metrics.fps} FPS`;
            
            // Color code based on performance
            if (this.metrics.fps >= 55) {
                fpsElement.style.color = '#00BFFF';
            } else if (this.metrics.fps >= 30) {
                fpsElement.style.color = '#FFA500';
            } else {
                fpsElement.style.color = '#FF6B6B';
            }
        }
        
        if (calcTimeElement) {
            calcTimeElement.textContent = `${this.metrics.calculationTime.toFixed(1)}ms`;
        }
    }
    
    checkPerformance() {
        // Auto-optimize if performance is poor
        if (this.metrics.fps < 30) {
            this.optimizePerformance();
        }
        
        // Memory leak detection
        if (this.metrics.memoryUsage > 100) {
            console.warn(`High memory usage: ${this.metrics.memoryUsage}MB`);
            this.suggestMemoryOptimization();
        }
    }
    
    optimizePerformance() {
        console.log('Optimizing performance...');
        
        // Reduce animation quality
        const animationSpeedSlider = document.getElementById('animationSpeed');
        if (animationSpeedSlider && parseFloat(animationSpeedSlider.value) > 1) {
            animationSpeedSlider.value = '1';
            animationSpeedSlider.dispatchEvent(new Event('input'));
        }
        
        // Disable particles if enabled
        const particleToggle = document.getElementById('enableParticles');
        if (particleToggle && particleToggle.checked) {
            particleToggle.checked = false;
            particleToggle.dispatchEvent(new Event('change'));
        }
        
        // Limit Pascal's triangle size
        this.limitPascalTriangleSize();
        
        this.showPerformanceNotification('Performance optimizations applied');
    }
    
    limitPascalTriangleSize() {
        const powerSlider = document.getElementById('powerN');
        if (powerSlider && parseInt(powerSlider.value) > 8) {
            powerSlider.value = '8';
            powerSlider.dispatchEvent(new Event('input'));
        }
    }
    
    suggestMemoryOptimization() {
        this.showPerformanceNotification('High memory usage detected. Consider refreshing the page.', 'warning');
    }
    
    showPerformanceNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `performance-notification ${type}`;
        notification.textContent = message;
        
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '20px';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '8px';
        notification.style.color = '#FFFFFF';
        notification.style.fontSize = '14px';
        notification.style.zIndex = '10000';
        notification.style.maxWidth = '300px';
        notification.style.animation = 'slideInLeft 0.3s ease-out';
        
        if (type === 'warning') {
            notification.style.background = '#FFA500';
        } else {
            notification.style.background = '#00BFFF';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Web Worker for heavy calculations
    createCalculationWorker() {
        const workerCode = `
            function binomialCoefficient(n, k) {
                if (k > n || k < 0) return 0;
                if (k === 0 || k === n) return 1;
                
                let result = 1;
                for (let i = 1; i <= k; i++) {
                    result = result * (n - i + 1) / i;
                }
                return Math.round(result);
            }
            
            function calculateBinomialTerms(a, b, n, x = null) {
                const terms = [];
                for (let k = 0; k <= n; k++) {
                    const coefficient = binomialCoefficient(n, k);
                    const aPower = n - k;
                    const bPower = k;
                    
                    let numericalValue = coefficient;
                    if (x !== null) {
                        numericalValue *= Math.pow(a * x, aPower) * Math.pow(b * x, bPower);
                    } else {
                        numericalValue *= Math.pow(a, aPower) * Math.pow(b, bPower);
                    }
                    
                    terms.push({
                        k,
                        coefficient,
                        aPower,
                        bPower,
                        value: numericalValue
                    });
                }
                return terms;
            }
            
            self.onmessage = function(e) {
                const { a, b, n, x } = e.data;
                const terms = calculateBinomialTerms(a, b, n, x);
                self.postMessage(terms);
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }
    
    // Debounced update function
    createDebouncedUpdate(fn, delay = 100) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }
    
    // Throttled update function
    createThrottledUpdate(fn, delay = 16) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                fn.apply(this, args);
            }
        };
    }
}

// Virtualization for large datasets
class VirtualizedRenderer {
    constructor(container, itemHeight = 50) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
        this.scrollTop = 0;
        
        this.init();
    }
    
    init() {
        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.render();
        });
    }
    
    render(items = []) {
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleItems, items.length);
        
        this.container.innerHTML = '';
        
        // Create spacer for items above viewport
        if (startIndex > 0) {
            const topSpacer = document.createElement('div');
            topSpacer.style.height = `${startIndex * this.itemHeight}px`;
            this.container.appendChild(topSpacer);
        }
        
        // Render visible items
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.createItem(items[i], i);
            this.container.appendChild(item);
        }
        
        // Create spacer for items below viewport
        if (endIndex < items.length) {
            const bottomSpacer = document.createElement('div');
            bottomSpacer.style.height = `${(items.length - endIndex) * this.itemHeight}px`;
            this.container.appendChild(bottomSpacer);
        }
    }
    
    createItem(data, index) {
        const item = document.createElement('div');
        item.style.height = `${this.itemHeight}px`;
        item.textContent = `Item ${index}: ${JSON.stringify(data)}`;
        return item;
    }
}

// Initialize performance monitoring
function initPerformanceMonitoring() {
    try {
        const monitor = new PerformanceMonitor();
        
        // Expose for debugging
        window.performanceMonitor = monitor;
        
        return monitor;
    } catch (error) {
        console.error('Error initializing performance monitoring:', error);
        return null;
    }
}

// Export
window.initPerformanceMonitoring = initPerformanceMonitoring;
window.PerformanceMonitor = PerformanceMonitor;
window.VirtualizedRenderer = VirtualizedRenderer;