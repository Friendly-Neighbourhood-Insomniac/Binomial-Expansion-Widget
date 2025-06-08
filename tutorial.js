// Tutorial system for guided learning
class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 8; // Increased from 5 to 8 for new features
        this.isActive = false;
        this.overlay = null;
        this.highlights = [];
        
        this.init();
    }
    
    init() {
        this.overlay = document.getElementById('tutorialOverlay');
        
        // Bind event listeners
        const startButton = document.getElementById('startTutorial');
        const closeButton = document.getElementById('tutorialClose');
        const prevButton = document.getElementById('tutorialPrev');
        const nextButton = document.getElementById('tutorialNext');
        
        if (startButton) {
            startButton.addEventListener('click', () => this.start());
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousStep());
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextStep());
        }
        
        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.previousStep();
                    break;
                case 'ArrowRight':
                    this.nextStep();
                    break;
            }
        });
    }
    
    start() {
        this.isActive = true;
        this.currentStep = 0;
        
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            this.overlay.classList.add('active');
        }
        
        this.updateStep();
        this.addHighlights();
    }
    
    close() {
        this.isActive = false;
        
        if (this.overlay) {
            this.overlay.style.display = 'none';
            this.overlay.classList.remove('active');
        }
        
        this.removeHighlights();
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateStep();
            this.updateHighlights();
            this.performStepActions();
        } else {
            this.close();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
            this.updateHighlights();
            this.performStepActions();
        }
    }
    
    updateStep() {
        // Update step content dynamically
        this.updateStepContent();
        
        // Update progress
        const progress = document.getElementById('tutorialProgress');
        if (progress) {
            progress.textContent = `${this.currentStep + 1} / ${this.totalSteps}`;
        }
        
        // Update button states
        const prevButton = document.getElementById('tutorialPrev');
        const nextButton = document.getElementById('tutorialNext');
        
        if (prevButton) {
            prevButton.disabled = this.currentStep === 0;
        }
        
        if (nextButton) {
            nextButton.textContent = this.currentStep === this.totalSteps - 1 ? 'Finish' : 'Next';
        }
    }
    
    updateStepContent() {
        const tutorialBody = document.getElementById('tutorialBody');
        if (!tutorialBody) return;
        
        const stepContent = this.getStepContent(this.currentStep);
        
        tutorialBody.innerHTML = `
            <div class="tutorial-step active" data-step="${this.currentStep}">
                <h3>${stepContent.title}</h3>
                ${stepContent.content}
            </div>
        `;
    }
    
    getStepContent(step) {
        const steps = [
            {
                title: '🎯 Welcome to Binomial Expansion Visualizer',
                content: `
                    <p>This interactive tool helps you explore the binomial theorem: <strong>(a + b)ⁿ</strong></p>
                    <p>You'll learn through multiple visualization modes and interactive features.</p>
                    <div class="tutorial-features">
                        <ul>
                            <li>📊 2D Charts and Pascal's Triangle</li>
                            <li>🌐 3D Surface Visualizations</li>
                            <li>🧮 Step-by-Step Algebraic Breakdown</li>
                            <li>✨ Interactive Animations and Effects</li>
                        </ul>
                    </div>
                `
            },
            {
                title: '🎛️ Control Panel - Your Command Center',
                content: `
                    <p>The control panel on the left is where you'll adjust all parameters:</p>
                    <div class="tutorial-controls">
                        <p><strong>Power (n):</strong> Changes the exponent of your binomial expression</p>
                        <p><strong>Coefficients (a, b):</strong> Modify the terms in your binomial</p>
                        <p><strong>Evaluate at x:</strong> See numerical results for specific values</p>
                        <p><strong>Animation Controls:</strong> Customize visual effects and speed</p>
                    </div>
                    <p>💡 <em>Try dragging the power slider to see real-time changes!</em></p>
                `
            },
            {
                title: '📊 2D Visualization Tab - Charts & Pascal\'s Triangle',
                content: `
                    <p>The 2D tab shows traditional mathematical visualizations:</p>
                    <div class="tutorial-2d">
                        <p><strong>📈 Interactive Chart:</strong> Displays binomial coefficients and term values</p>
                        <p><strong>🔺 Pascal's Triangle:</strong> Shows the famous number pattern</p>
                        <p><strong>📝 Terms Breakdown:</strong> Lists each term in the expansion</p>
                    </div>
                    <p>🎯 <em>Click on Pascal's triangle numbers to highlight corresponding terms!</em></p>
                `
            },
            {
                title: '🌐 3D Surface Plot Tab - Spatial Mathematics',
                content: `
                    <p>Experience binomial coefficients in three dimensions:</p>
                    <div class="tutorial-3d">
                        <p><strong>🎮 Interactive 3D Scene:</strong> Rotate, zoom, and explore</p>
                        <p><strong>🏔️ Surface Visualization:</strong> See coefficient patterns as landscapes</p>
                        <p><strong>🎨 Color Coding:</strong> Heights and colors represent coefficient values</p>
                        <p><strong>🔄 Auto-Rotate:</strong> Automatic camera movement for better viewing</p>
                    </div>
                    <p>🖱️ <em>Use mouse to rotate, scroll to zoom, and try the control buttons!</em></p>
                `
            },
            {
                title: '🧮 Step-by-Step Tab - Learn the Process',
                content: `
                    <p>Perfect for understanding the mathematical derivation:</p>
                    <div class="tutorial-steps">
                        <p><strong>📚 Formula Explanation:</strong> See the binomial theorem formula</p>
                        <p><strong>🔢 Term Calculation:</strong> Watch how each term is computed</p>
                        <p><strong>➡️ Navigation:</strong> Move through each step at your own pace</p>
                        <p><strong>🎯 Detailed Breakdown:</strong> Understand coefficient × power calculations</p>
                    </div>
                    <p>📖 <em>Use the Previous/Next buttons to navigate through the derivation!</em></p>
                `
            },
            {
                title: '✨ Animation Features - Bring Math to Life',
                content: `
                    <p>Enhance your learning with visual effects:</p>
                    <div class="tutorial-animations">
                        <p><strong>🎭 Smooth Transitions:</strong> Watch expansions morph between powers</p>
                        <p><strong>⭐ Particle Effects:</strong> Visual feedback for interactions</p>
                        <p><strong>🌊 Staggered Animations:</strong> Pascal's triangle builds row by row</p>
                        <p><strong>⚡ Speed Control:</strong> Adjust animation timing to your preference</p>
                    </div>
                    <p>🎨 <em>Enable "Particle Effects" and "Animate Terms" for the full experience!</em></p>
                `
            },
            {
                title: '🌓 Theme & Accessibility - Customize Your Experience',
                content: `
                    <p>Personalize the interface for optimal learning:</p>
                    <div class="tutorial-accessibility">
                        <p><strong>🌙 Dark/Light Mode:</strong> Toggle with the button in the top-right</p>
                        <p><strong>📱 Responsive Design:</strong> Works on desktop, tablet, and mobile</p>
                        <p><strong>⌨️ Keyboard Shortcuts:</strong> Use arrow keys in step-by-step mode</p>
                        <p><strong>🎯 Hover Effects:</strong> Discover interactive elements by hovering</p>
                    </div>
                    <p>♿ <em>The interface adapts to your accessibility preferences automatically!</em></p>
                `
            },
            {
                title: '🚀 Advanced Tips - Master the Tool',
                content: `
                    <p>Pro tips to get the most out of your exploration:</p>
                    <div class="tutorial-advanced">
                        <p><strong>🎯 Click Interactions:</strong> Click Pascal numbers, chart bars, and terms</p>
                        <p><strong>🖱️ Drag to Scrub:</strong> Drag the power slider for smooth transitions</p>
                        <p><strong>📊 Performance Monitor:</strong> Check FPS and calculation times at the bottom</p>
                        <p><strong>🔄 Tab Switching:</strong> Each tab remembers your settings</p>
                        <p><strong>📐 Mathematical Accuracy:</strong> All calculations use precise algorithms</p>
                    </div>
                    <p>🎓 <em>You're now ready to explore the beautiful world of binomial expansions!</em></p>
                `
            }
        ];
        
        return steps[step] || steps[0];
    }
    
    performStepActions() {
        // Perform specific actions for each step
        switch (this.currentStep) {
            case 2: // 2D Visualization
                this.switchToTab('2d');
                break;
            case 3: // 3D Visualization
                this.switchToTab('3d');
                break;
            case 4: // Step-by-Step
                this.switchToTab('steps');
                break;
            case 5: // Animation Features
                this.enableAnimationFeatures();
                break;
            case 6: // Theme demonstration
                this.demonstrateTheme();
                break;
        }
    }
    
    switchToTab(tabName) {
        // Switch to the specified tab
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabButton && !tabButton.classList.contains('active')) {
            tabButton.click();
        }
    }
    
    enableAnimationFeatures() {
        // Enable animation features for demonstration
        const animateCheckbox = document.getElementById('animateExpansion');
        const particleCheckbox = document.getElementById('enableParticles');
        
        if (animateCheckbox && !animateCheckbox.checked) {
            animateCheckbox.checked = true;
            animateCheckbox.dispatchEvent(new Event('change'));
        }
        
        if (particleCheckbox && !particleCheckbox.checked) {
            particleCheckbox.checked = true;
            particleCheckbox.dispatchEvent(new Event('change'));
        }
    }
    
    demonstrateTheme() {
        // Briefly demonstrate theme switching
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Add a subtle glow effect to draw attention
            themeToggle.style.boxShadow = '0 0 20px rgba(214, 30, 255, 0.8)';
            themeToggle.style.animation = 'pulse 2s infinite';
            
            setTimeout(() => {
                themeToggle.style.boxShadow = '';
                themeToggle.style.animation = '';
            }, 3000);
        }
    }
    
    addHighlights() {
        this.removeHighlights();
        
        const highlightElements = this.getHighlightElements();
        
        highlightElements.forEach(element => {
            if (element) {
                const highlight = document.createElement('div');
                highlight.className = 'tutorial-highlight';
                
                const rect = element.getBoundingClientRect();
                highlight.style.position = 'fixed';
                highlight.style.top = `${rect.top - 10}px`;
                highlight.style.left = `${rect.left - 10}px`;
                highlight.style.width = `${rect.width + 20}px`;
                highlight.style.height = `${rect.height + 20}px`;
                highlight.style.border = '3px solid #D61EFF';
                highlight.style.borderRadius = '8px';
                highlight.style.pointerEvents = 'none';
                highlight.style.zIndex = '9999';
                highlight.style.animation = 'tutorialPulse 2s infinite';
                highlight.style.background = 'rgba(214, 30, 255, 0.1)';
                
                document.body.appendChild(highlight);
                this.highlights.push(highlight);
            }
        });
    }
    
    updateHighlights() {
        this.addHighlights();
    }
    
    removeHighlights() {
        this.highlights.forEach(highlight => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        });
        this.highlights = [];
    }
    
    getHighlightElements() {
        switch (this.currentStep) {
            case 0: // Welcome
                return [document.querySelector('.hero-section')];
            case 1: // Control Panel
                return [document.querySelector('.control-panel')];
            case 2: // 2D Visualization
                return [
                    document.querySelector('[data-tab="2d"]'),
                    document.getElementById('coefficientsChart'),
                    document.getElementById('pascalTriangle')
                ];
            case 3: // 3D Visualization
                return [
                    document.querySelector('[data-tab="3d"]'),
                    document.getElementById('threejsContainer')
                ];
            case 4: // Step-by-Step
                return [
                    document.querySelector('[data-tab="steps"]'),
                    document.getElementById('stepIndicator')
                ];
            case 5: // Animation Features
                return [
                    document.getElementById('animateExpansion'),
                    document.getElementById('enableParticles'),
                    document.getElementById('animationSpeed')
                ];
            case 6: // Theme & Accessibility
                return [
                    document.getElementById('themeToggle'),
                    document.querySelector('.tab-navigation')
                ];
            case 7: // Advanced Tips
                return [
                    document.getElementById('performanceInfo'),
                    document.querySelector('.checkbox-group')
                ];
            default:
                return [];
        }
    }
}

// Interactive hints system (enhanced)
class HintSystem {
    constructor() {
        this.hints = new Map();
        this.activeHints = new Set();
        this.init();
    }
    
    init() {
        // Define hints for different elements including new features
        this.hints.set('powerN', {
            text: 'Try dragging this slider to see how the expansion changes across all tabs!',
            trigger: 'hover',
            delay: 2000
        });
        
        this.hints.set('pascalTriangle', {
            text: 'Click on any number to highlight the corresponding term across all visualizations!',
            trigger: 'hover',
            delay: 3000
        });
        
        this.hints.set('coefficientsChart', {
            text: 'Hover over the chart to see individual values and click to highlight terms!',
            trigger: 'hover',
            delay: 2500
        });
        
        this.hints.set('threejsContainer', {
            text: 'Use mouse to rotate, scroll to zoom, and explore the 3D surface!',
            trigger: 'hover',
            delay: 2000
        });
        
        this.hints.set('stepIndicator', {
            text: 'Navigate through each step to understand the mathematical derivation!',
            trigger: 'hover',
            delay: 2500
        });
        
        this.hints.set('enableParticles', {
            text: 'Enable this for beautiful particle effects when interacting with elements!',
            trigger: 'hover',
            delay: 3000
        });
        
        this.hints.set('themeToggle', {
            text: 'Switch between light and dark themes for comfortable viewing!',
            trigger: 'hover',
            delay: 2000
        });
        
        // Add hint triggers
        this.addHintTriggers();
        this.addTabHints();
    }
    
    addHintTriggers() {
        this.hints.forEach((hint, elementId) => {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            let hintTimeout;
            
            element.addEventListener('mouseenter', () => {
                if (this.activeHints.has(elementId)) return;
                
                hintTimeout = setTimeout(() => {
                    this.showHint(elementId, hint.text, element);
                }, hint.delay);
            });
            
            element.addEventListener('mouseleave', () => {
                clearTimeout(hintTimeout);
                this.hideHint(elementId);
            });
        });
    }
    
    addTabHints() {
        // Add hints for tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            const tabName = button.getAttribute('data-tab');
            let hintText = '';
            
            switch (tabName) {
                case '2d':
                    hintText = 'Traditional charts and Pascal\'s triangle visualization';
                    break;
                case '3d':
                    hintText = 'Interactive 3D surface plot of binomial coefficients';
                    break;
                case 'steps':
                    hintText = 'Step-by-step algebraic derivation and explanation';
                    break;
            }
            
            if (hintText) {
                let hintTimeout;
                
                button.addEventListener('mouseenter', () => {
                    if (this.activeHints.has(`tab-${tabName}`)) return;
                    
                    hintTimeout = setTimeout(() => {
                        this.showHint(`tab-${tabName}`, hintText, button);
                    }, 1500);
                });
                
                button.addEventListener('mouseleave', () => {
                    clearTimeout(hintTimeout);
                    this.hideHint(`tab-${tabName}`);
                });
            }
        });
    }
    
    showHint(id, text, element) {
        if (this.activeHints.has(id)) return;
        
        const hint = document.createElement('div');
        hint.className = 'tutorial-hint';
        hint.textContent = text;
        hint.id = `hint-${id}`;
        
        const rect = element.getBoundingClientRect();
        hint.style.position = 'fixed';
        hint.style.top = `${rect.bottom + 10}px`;
        hint.style.left = `${rect.left}px`;
        hint.style.background = '#4A2181';
        hint.style.color = '#FFFFFF';
        hint.style.padding = '8px 12px';
        hint.style.borderRadius = '6px';
        hint.style.fontSize = '14px';
        hint.style.zIndex = '10000';
        hint.style.maxWidth = '250px';
        hint.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        hint.style.animation = 'fadeInUp 0.3s ease-out';
        
        // Adjust position if hint would go off screen
        if (rect.left + 250 > window.innerWidth) {
            hint.style.left = `${window.innerWidth - 260}px`;
        }
        
        document.body.appendChild(hint);
        this.activeHints.add(id);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideHint(id);
        }, 5000);
    }
    
    hideHint(id) {
        const hint = document.getElementById(`hint-${id}`);
        if (hint) {
            hint.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 300);
        }
        this.activeHints.delete(id);
    }
}

// Progress tracking (enhanced)
class ProgressTracker {
    constructor() {
        this.achievements = new Set();
        this.interactions = 0;
        this.tabSwitches = 0;
        this.startTime = Date.now();
        this.featuresUsed = new Set();
        
        this.init();
    }
    
    init() {
        // Track various interactions
        document.addEventListener('input', () => {
            this.interactions++;
            this.checkAchievements();
        });
        
        document.addEventListener('click', (e) => {
            this.interactions++;
            
            // Track specific feature usage
            if (e.target.classList.contains('tab-button')) {
                this.tabSwitches++;
                this.featuresUsed.add('tab-switching');
            }
            
            if (e.target.classList.contains('pascal-number')) {
                this.featuresUsed.add('pascal-interaction');
            }
            
            if (e.target.closest('#threejsContainer')) {
                this.featuresUsed.add('3d-interaction');
            }
            
            this.checkAchievements();
        });
        
        // Track checkbox changes for feature usage
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.featuresUsed.add(e.target.id);
                }
                this.checkAchievements();
            });
        });
    }
    
    checkAchievements() {
        // First interaction
        if (this.interactions === 1 && !this.achievements.has('first-interaction')) {
            this.unlockAchievement('first-interaction', 'First Steps!', 'You made your first interaction!');
        }
        
        // Explorer
        if (this.interactions >= 10 && !this.achievements.has('explorer')) {
            this.unlockAchievement('explorer', 'Explorer!', 'You\'ve made 10 interactions!');
        }
        
        // Tab Master
        if (this.tabSwitches >= 3 && !this.achievements.has('tab-master')) {
            this.unlockAchievement('tab-master', 'Tab Master!', 'You\'ve explored all visualization modes!');
        }
        
        // Feature Enthusiast
        if (this.featuresUsed.size >= 5 && !this.achievements.has('feature-enthusiast')) {
            this.unlockAchievement('feature-enthusiast', 'Feature Enthusiast!', 'You\'ve used many different features!');
        }
        
        // 3D Explorer
        if (this.featuresUsed.has('3d-interaction') && !this.achievements.has('3d-explorer')) {
            this.unlockAchievement('3d-explorer', '3D Explorer!', 'You\'ve interacted with the 3D visualization!');
        }
        
        // Pascal Master
        if (this.featuresUsed.has('pascal-interaction') && !this.achievements.has('pascal-master')) {
            this.unlockAchievement('pascal-master', 'Pascal Master!', 'You\'ve clicked on Pascal\'s triangle!');
        }
        
        // Animation Lover
        if (this.featuresUsed.has('enableParticles') && this.featuresUsed.has('animateExpansion') && !this.achievements.has('animation-lover')) {
            this.unlockAchievement('animation-lover', 'Animation Lover!', 'You\'ve enabled all visual effects!');
        }
        
        // Power user
        if (this.interactions >= 50 && !this.achievements.has('power-user')) {
            this.unlockAchievement('power-user', 'Power User!', 'You\'ve made 50 interactions!');
        }
        
        // Time-based achievements
        const timeSpent = Date.now() - this.startTime;
        if (timeSpent > 60000 && !this.achievements.has('dedicated')) {
            this.unlockAchievement('dedicated', 'Dedicated Learner!', 'You\'ve spent over a minute exploring!');
        }
        
        if (timeSpent > 300000 && !this.achievements.has('mathematics-enthusiast')) {
            this.unlockAchievement('mathematics-enthusiast', 'Mathematics Enthusiast!', 'You\'ve spent 5 minutes exploring mathematics!');
        }
    }
    
    unlockAchievement(id, title, description) {
        this.achievements.add(id);
        this.showAchievementNotification(title, description);
    }
    
    showAchievementNotification(title, description) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${title}</div>
                <div class="achievement-description">${description}</div>
            </div>
        `;
        
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = 'linear-gradient(45deg, #D61EFF, #00BFFF)';
        notification.style.color = '#FFFFFF';
        notification.style.padding = '16px';
        notification.style.borderRadius = '12px';
        notification.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        notification.style.zIndex = '10001';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '12px';
        notification.style.maxWidth = '300px';
        notification.style.animation = 'slideInRight 0.5s ease-out';
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
}

// Initialize tutorial system
function initTutorial() {
    try {
        new TutorialManager();
        new HintSystem();
        new ProgressTracker();
    } catch (error) {
        console.error('Error initializing tutorial system:', error);
    }
}

// Export
window.initTutorial = initTutorial;