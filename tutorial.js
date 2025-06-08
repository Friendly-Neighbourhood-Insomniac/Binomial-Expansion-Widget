// Tutorial system for guided learning
class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 5;
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
        } else {
            this.close();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
            this.updateHighlights();
        }
    }
    
    updateStep() {
        // Update step content
        const steps = document.querySelectorAll('.tutorial-step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === this.currentStep);
        });
        
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
                highlight.style.animation = 'pulse 2s infinite';
                
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
            case 0:
                return [document.querySelector('.hero-section')];
            case 1:
                return [document.querySelector('.control-panel')];
            case 2:
                return [
                    document.getElementById('coefficientsChart'),
                    document.getElementById('pascalTriangle')
                ];
            case 3:
                return [document.getElementById('stepByStepMode')];
            case 4:
                return [document.querySelector('[data-tab="3d"]')];
            default:
                return [];
        }
    }
}

// Interactive hints system
class HintSystem {
    constructor() {
        this.hints = new Map();
        this.activeHints = new Set();
        this.init();
    }
    
    init() {
        // Define hints for different elements
        this.hints.set('powerN', {
            text: 'Try dragging this slider to see how the expansion changes!',
            trigger: 'hover',
            delay: 2000
        });
        
        this.hints.set('pascalTriangle', {
            text: 'Click on any number to highlight the corresponding term!',
            trigger: 'hover',
            delay: 3000
        });
        
        this.hints.set('coefficientsChart', {
            text: 'Hover over the chart to see individual values!',
            trigger: 'hover',
            delay: 2500
        });
        
        // Add hint triggers
        this.addHintTriggers();
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
        hint.style.maxWidth = '200px';
        hint.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        hint.style.animation = 'fadeInUp 0.3s ease-out';
        
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

// Progress tracking
class ProgressTracker {
    constructor() {
        this.achievements = new Set();
        this.interactions = 0;
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        // Track various interactions
        document.addEventListener('input', () => {
            this.interactions++;
            this.checkAchievements();
        });
        
        document.addEventListener('click', () => {
            this.interactions++;
            this.checkAchievements();
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
        
        // Power user
        if (this.interactions >= 50 && !this.achievements.has('power-user')) {
            this.unlockAchievement('power-user', 'Power User!', 'You\'ve made 50 interactions!');
        }
        
        // Time-based achievements
        const timeSpent = Date.now() - this.startTime;
        if (timeSpent > 60000 && !this.achievements.has('dedicated')) {
            this.unlockAchievement('dedicated', 'Dedicated Learner!', 'You\'ve spent over a minute exploring!');
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