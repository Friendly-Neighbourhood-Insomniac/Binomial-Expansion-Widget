import katex from 'katex';
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    LineElement,
    LineController,
    PointElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    LineElement,
    LineController,
    PointElement,
    Title,
    Tooltip,
    Legend
);

// Global state
let currentTheme = 'light';
let animationSpeed = 1;
let isAnimating = false;
let currentStep = 0;
let maxSteps = 0;
let highlightedTerm = -1;
let performanceMonitor = null;

// Error boundary
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    const errorBoundary = document.getElementById('errorBoundary');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorBoundary && errorMessage) {
        errorMessage.textContent = `Error in ${context}: ${error.message}`;
        errorBoundary.style.display = 'flex';
    }
}

// Binomial coefficient calculation with error handling
function binomialCoefficient(n, k) {
    try {
        if (k > n || k < 0 || n < 0) return 0;
        if (k === 0 || k === n) return 1;
        if (n > 170) throw new Error('Number too large for calculation');
        
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result = result * (n - i + 1) / i;
        }
        return Math.round(result);
    } catch (error) {
        handleError(error, 'binomialCoefficient');
        return 0;
    }
}

// Generate Pascal's Triangle with virtualization for large n
function generatePascalTriangle(n) {
    try {
        const triangle = [];
        const maxRows = Math.min(n + 2, 15); // Virtualize for performance
        
        for (let i = 0; i <= maxRows; i++) {
            const row = [];
            for (let j = 0; j <= i; j++) {
                row.push(binomialCoefficient(i, j));
            }
            triangle.push(row);
        }
        return triangle;
    } catch (error) {
        handleError(error, 'generatePascalTriangle');
        return [];
    }
}

// Calculate binomial expansion terms with enhanced error handling
function calculateBinomialTerms(a, b, n, x = null) {
    try {
        const terms = [];
        
        for (let k = 0; k <= n; k++) {
            const coefficient = binomialCoefficient(n, k);
            const aPower = n - k;
            const bPower = k;
            
            // Create LaTeX expression for the term
            let latexExpression = '';
            
            // Handle coefficient
            if (coefficient !== 1 || (aPower === 0 && bPower === 0)) {
                latexExpression += coefficient;
            }
            
            // Handle 'a' term
            if (aPower > 0) {
                if (latexExpression && coefficient !== 1) {
                    latexExpression += ' \\cdot ';
                }
                
                if (a === 1) {
                    latexExpression += 'a';
                } else if (a === -1) {
                    latexExpression += '(-a)';
                } else {
                    latexExpression += `${a}a`;
                }
                
                if (aPower > 1) {
                    latexExpression += `^{${aPower}}`;
                }
            }
            
            // Handle 'b' term
            if (bPower > 0) {
                if (latexExpression) {
                    latexExpression += ' \\cdot ';
                }
                
                if (b === 1) {
                    latexExpression += 'b';
                } else if (b === -1) {
                    latexExpression += '(-b)';
                } else {
                    latexExpression += `${b}b`;
                }
                
                if (bPower > 1) {
                    latexExpression += `^{${bPower}}`;
                }
            }
            
            if (latexExpression === '') {
                latexExpression = '1';
            }
            
            // For numerical evaluation
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
                latexExpression: latexExpression,
                value: numericalValue,
                step: k + 1
            });
        }
        return terms;
    } catch (error) {
        handleError(error, 'calculateBinomialTerms');
        return [];
    }
}

// Enhanced math rendering with error recovery
function renderMath(expression, element) {
    try {
        if (!element) return;
        
        katex.render(expression, element, {
            throwOnError: false,
            displayMode: true,
            strict: false
        });
    } catch (error) {
        console.warn('KaTeX rendering fallback:', error);
        if (element) {
            element.textContent = expression;
        }
    }
}

// Theme management
function toggleTheme() {
    try {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', currentTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        }
        
        // Update chart colors
        if (window.coeffChart) {
            updateChart(calculateBinomialTerms(
                parseFloat(document.getElementById('coeffA').value),
                parseFloat(document.getElementById('coeffB').value),
                parseInt(document.getElementById('powerN').value)
            ));
        }
    } catch (error) {
        handleError(error, 'toggleTheme');
    }
}

// Tab management
function switchTab(tabName) {
    try {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
        
        // Trigger specific updates for each tab
        if (tabName === '3d') {
            // Initialize or update 3D visualization
            if (window.init3DVisualization) {
                window.init3DVisualization();
            }
        } else if (tabName === 'steps') {
            updateStepByStep();
        }
    } catch (error) {
        handleError(error, 'switchTab');
    }
}

// Enhanced Pascal's Triangle with hover effects and click interactions
function updatePascalTriangle(n, highlightRow = -1) {
    try {
        const pascalContainer = document.getElementById('pascalTriangle');
        if (!pascalContainer) return;
        
        pascalContainer.innerHTML = `<h4 style="text-align: center; margin-bottom: 20px;">Pascal's Triangle</h4>`;
        
        const triangle = generatePascalTriangle(Math.min(n + 2, 12));
        
        triangle.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'pascal-row';
            rowDiv.style.animationDelay = `${rowIndex * 0.1 * animationSpeed}s`;
            
            row.forEach((number, colIndex) => {
                const numberSpan = document.createElement('span');
                numberSpan.className = 'pascal-number';
                numberSpan.textContent = number;
                numberSpan.setAttribute('data-row', rowIndex);
                numberSpan.setAttribute('data-col', colIndex);
                
                // Highlight current row coefficients
                if (rowIndex === n && colIndex <= n) {
                    numberSpan.classList.add('highlighted');
                }
                
                // Add hover tooltip
                numberSpan.title = `C(${rowIndex},${colIndex}) = ${number}`;
                
                // Click interaction
                numberSpan.addEventListener('click', () => {
                    highlightTerm(colIndex);
                });
                
                // Hover effects
                numberSpan.addEventListener('mouseenter', () => {
                    numberSpan.style.transform = 'scale(1.2)';
                    showTermContribution(rowIndex, colIndex, number);
                });
                
                numberSpan.addEventListener('mouseleave', () => {
                    numberSpan.style.transform = '';
                    hideTermContribution();
                });
                
                rowDiv.appendChild(numberSpan);
            });
            
            pascalContainer.appendChild(rowDiv);
        });
    } catch (error) {
        handleError(error, 'updatePascalTriangle');
    }
}

// Show term contribution on hover
function showTermContribution(row, col, value) {
    // This could show additional information about the term
    console.log(`Term contribution: C(${row},${col}) = ${value}`);
}

function hideTermContribution() {
    // Hide the contribution display
}

// Highlight specific term across all visualizations
function highlightTerm(termIndex) {
    try {
        highlightedTerm = termIndex;
        
        // Update Pascal's triangle highlighting
        document.querySelectorAll('.pascal-number').forEach((span, index) => {
            span.classList.remove('term-highlighted');
        });
        
        const targetSpan = document.querySelector(`[data-col="${termIndex}"]`);
        if (targetSpan) {
            targetSpan.classList.add('term-highlighted');
        }
        
        // Update chart highlighting
        if (window.coeffChart) {
            window.coeffChart.update();
        }
        
        // Update terms breakdown highlighting
        document.querySelectorAll('.term-item').forEach((item, index) => {
            item.classList.remove('highlighted');
            if (index === termIndex) {
                item.classList.add('highlighted');
            }
        });
    } catch (error) {
        handleError(error, 'highlightTerm');
    }
}

// Enhanced chart with smooth animations
function updateChart(terms) {
    try {
        const ctx = document.getElementById('coefficientsChart');
        if (!ctx) return;
        
        const context = ctx.getContext('2d');
        
        if (window.coeffChart) {
            window.coeffChart.destroy();
        }
        
        const labels = terms.map(term => `k=${term.k}`);
        const coefficients = terms.map(term => term.coefficient);
        const values = terms.map(term => Math.abs(term.value));
        
        const isDark = currentTheme === 'dark';
        const textColor = isDark ? '#FFFFFF' : '#333333';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 33, 129, 0.1)';
        
        window.coeffChart = new Chart(context, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Binomial Coefficients',
                    data: coefficients,
                    backgroundColor: 'rgba(214, 30, 255, 0.7)',
                    borderColor: 'rgba(214, 30, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }, {
                    label: 'Term Values',
                    data: values,
                    backgroundColor: 'rgba(0, 191, 255, 0.7)',
                    borderColor: 'rgba(0, 191, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    type: 'line',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000 / animationSpeed,
                    easing: 'easeInOutElastic'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: textColor }
                    },
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    },
                    title: {
                        display: true,
                        text: 'Binomial Coefficients and Term Values',
                        color: isDark ? '#D61EFF' : '#4A2181',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                onHover: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        highlightTerm(index);
                    }
                }
            }
        });
    } catch (error) {
        handleError(error, 'updateChart');
    }
}

// Enhanced terms breakdown with staggered animations
function updateTermsBreakdown(terms) {
    try {
        const container = document.getElementById('termsBreakdown');
        if (!container) return;
        
        container.innerHTML = '<h4 style="text-align: center; margin-bottom: 20px;">Term Breakdown</h4>';
        
        terms.forEach((term, index) => {
            const termDiv = document.createElement('div');
            termDiv.className = 'term-item';
            termDiv.style.animationDelay = `${index * 0.1 * animationSpeed}s`;
            termDiv.setAttribute('data-term-index', index);
            
            const expressionDiv = document.createElement('div');
            expressionDiv.className = 'term-expression';
            
            const latexContainer = document.createElement('span');
            latexContainer.className = 'term-latex';
            renderMath(term.latexExpression, latexContainer);
            
            expressionDiv.innerHTML = `Term ${index + 1}: `;
            expressionDiv.appendChild(latexContainer);
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'term-value';
            valueDiv.textContent = term.value.toFixed(3);
            
            // Add click interaction
            termDiv.addEventListener('click', () => {
                highlightTerm(index);
            });
            
            termDiv.appendChild(expressionDiv);
            termDiv.appendChild(valueDiv);
            container.appendChild(termDiv);
        });
    } catch (error) {
        handleError(error, 'updateTermsBreakdown');
    }
}

// Step-by-step expansion mode
function updateStepByStep() {
    try {
        const n = parseInt(document.getElementById('powerN').value);
        const a = parseFloat(document.getElementById('coeffA').value);
        const b = parseFloat(document.getElementById('coeffB').value);
        
        const terms = calculateBinomialTerms(a, b, n);
        maxSteps = terms.length;
        
        const container = document.getElementById('stepsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Show current step
        const currentTerm = terms[currentStep] || terms[0];
        
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-explanation';
        
        stepDiv.innerHTML = `
            <div class="step-header">
                <h3>Step ${currentStep + 1}: Calculating Term ${currentStep + 1}</h3>
            </div>
            <div class="step-content">
                <div class="step-formula">
                    <p>Using the binomial theorem formula:</p>
                    <div class="formula-step" id="formulaStep"></div>
                </div>
                <div class="step-calculation">
                    <p>For k = ${currentTerm.k}:</p>
                    <div class="calculation-step" id="calculationStep"></div>
                </div>
                <div class="step-result">
                    <p>Result:</p>
                    <div class="result-step" id="resultStep"></div>
                </div>
            </div>
        `;
        
        container.appendChild(stepDiv);
        
        // Render the mathematical expressions
        renderMath(`\\binom{${n}}{k} a^{${n}-k} b^k`, document.getElementById('formulaStep'));
        renderMath(`\\binom{${n}}{${currentTerm.k}} \\cdot ${a}^{${currentTerm.aPower}} \\cdot ${b}^{${currentTerm.bPower}}`, document.getElementById('calculationStep'));
        renderMath(`${currentTerm.coefficient} \\cdot ${Math.pow(a, currentTerm.aPower).toFixed(2)} \\cdot ${Math.pow(b, currentTerm.bPower).toFixed(2)} = ${currentTerm.value.toFixed(3)}`, document.getElementById('resultStep'));
        
        // Update step indicator
        const stepIndicator = document.getElementById('stepIndicator');
        if (stepIndicator) {
            stepIndicator.textContent = `Step ${currentStep + 1} of ${maxSteps}`;
        }
    } catch (error) {
        handleError(error, 'updateStepByStep');
    }
}

// Drag-to-scrub functionality
function initializeDragToScrub() {
    try {
        const powerSlider = document.getElementById('powerN');
        if (!powerSlider) return;
        
        let isDragging = false;
        let startX = 0;
        let startValue = 0;
        
        powerSlider.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startValue = parseInt(powerSlider.value);
            powerSlider.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const sensitivity = 0.1;
            const newValue = Math.max(0, Math.min(12, startValue + deltaX * sensitivity));
            
            powerSlider.value = Math.round(newValue);
            updateVisualization();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                powerSlider.style.cursor = '';
            }
        });
        
        // Touch support
        powerSlider.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startValue = parseInt(powerSlider.value);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const deltaX = e.touches[0].clientX - startX;
            const sensitivity = 0.05;
            const newValue = Math.max(0, Math.min(12, startValue + deltaX * sensitivity));
            
            powerSlider.value = Math.round(newValue);
            updateVisualization();
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    } catch (error) {
        handleError(error, 'initializeDragToScrub');
    }
}

// Main update function with performance monitoring
function updateVisualization() {
    try {
        const startTime = performance.now();
        
        const n = parseInt(document.getElementById('powerN').value);
        const a = parseFloat(document.getElementById('coeffA').value);
        const b = parseFloat(document.getElementById('coeffB').value);
        const x = parseFloat(document.getElementById('xValue').value);
        const showPascal = document.getElementById('showPascal').checked;
        const animateExpansion = document.getElementById('animateExpansion').checked;
        
        // Update value displays
        document.getElementById('powerValue').textContent = n;
        document.getElementById('coeffAValue').textContent = a;
        document.getElementById('coeffBValue').textContent = b;
        document.getElementById('xValueDisplay').textContent = x;
        
        // Generate terms
        const terms = calculateBinomialTerms(a, b, n, x);
        
        // Update current expression for all tabs
        const expressionElements = ['currentExpression', 'currentExpression3D', 'currentExpressionSteps'];
        expressionElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                let currentExpr = '(';
                if (a === 1) {
                    currentExpr += 'a';
                } else if (a === -1) {
                    currentExpr += '-a';
                } else {
                    currentExpr += `${a}a`;
                }
                
                if (b >= 0) {
                    if (b === 1) {
                        currentExpr += ' + b';
                    } else {
                        currentExpr += ` + ${b}b`;
                    }
                } else {
                    if (b === -1) {
                        currentExpr += ' - b';
                    } else {
                        currentExpr += ` - ${Math.abs(b)}b`;
                    }
                }
                
                currentExpr += `)^{${n}}`;
                renderMath(currentExpr, element);
            }
        });
        
        // Update expanded form
        const expandedLatex = terms.map((term, index) => {
            if (index === 0) {
                return term.latexExpression;
            } else {
                if (term.value < 0) {
                    return ` - ${term.latexExpression.replace(/^-/, '')}`;
                } else {
                    return ` + ${term.latexExpression}`;
                }
            }
        }).join('');
        
        const expandedElement = document.getElementById('expandedForm');
        if (expandedElement) {
            renderMath(expandedLatex, expandedElement);
        }
        
        // Update numerical result
        const totalValue = terms.reduce((sum, term) => sum + term.value, 0);
        const resultElement = document.getElementById('numericalResult');
        if (resultElement) {
            renderMath(`= ${totalValue.toFixed(3)}`, resultElement);
        }
        
        // Update general formula
        const formulaElement = document.getElementById('generalFormula');
        if (formulaElement) {
            renderMath('(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k', formulaElement);
        }
        
        // Update visualizations
        updateChart(terms);
        
        if (showPascal) {
            const pascalElement = document.getElementById('pascalTriangle');
            if (pascalElement) {
                pascalElement.style.display = 'block';
                updatePascalTriangle(n);
            }
        } else {
            const pascalElement = document.getElementById('pascalTriangle');
            if (pascalElement) {
                pascalElement.style.display = 'none';
            }
        }
        
        if (animateExpansion) {
            updateTermsBreakdown(terms);
        } else {
            const breakdownElement = document.getElementById('termsBreakdown');
            if (breakdownElement) {
                breakdownElement.innerHTML = '';
            }
        }
        
        // Update step-by-step if active
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'steps') {
            updateStepByStep();
        }
        
        // Update 3D visualization if active
        if (activeTab && activeTab.getAttribute('data-tab') === '3d' && window.update3DVisualization) {
            window.update3DVisualization(terms);
        }
        
        // Performance monitoring
        const endTime = performance.now();
        const calcTime = document.getElementById('calcTime');
        if (calcTime) {
            calcTime.textContent = `${(endTime - startTime).toFixed(1)}ms`;
        }
        
    } catch (error) {
        handleError(error, 'updateVisualization');
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    try {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                switchTab(tabName);
            });
        });
        
        // Control sliders
        const controls = ['powerN', 'coeffA', 'coeffB', 'xValue', 'showPascal', 'animateExpansion', 'enableParticles', 'stepByStepMode'];
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateVisualization);
                element.addEventListener('change', updateVisualization);
            }
        });
        
        // Animation speed control
        const animationSpeedSlider = document.getElementById('animationSpeed');
        if (animationSpeedSlider) {
            animationSpeedSlider.addEventListener('input', (e) => {
                animationSpeed = parseFloat(e.target.value);
                document.getElementById('speedValue').textContent = `${animationSpeed}x`;
            });
        }
        
        // Step navigation
        const prevStepBtn = document.getElementById('prevStep');
        const nextStepBtn = document.getElementById('nextStep');
        
        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    updateStepByStep();
                }
            });
        }
        
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                if (currentStep < maxSteps - 1) {
                    currentStep++;
                    updateStepByStep();
                }
            });
        }
        
        // 3D controls
        const resetCameraBtn = document.getElementById('resetCamera');
        const autoRotateBtn = document.getElementById('autoRotate');
        
        if (resetCameraBtn) {
            resetCameraBtn.addEventListener('click', () => {
                if (window.resetCamera) window.resetCamera();
            });
        }
        
        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', () => {
                if (window.toggleAutoRotate) window.toggleAutoRotate();
            });
        }
        
        // Initialize drag-to-scrub
        initializeDragToScrub();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    if (currentStep > 0) {
                        currentStep--;
                        updateStepByStep();
                    }
                    break;
                case 'ArrowRight':
                    if (currentStep < maxSteps - 1) {
                        currentStep++;
                        updateStepByStep();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    // Toggle animation
                    const animateCheckbox = document.getElementById('animateExpansion');
                    if (animateCheckbox) {
                        animateCheckbox.checked = !animateCheckbox.checked;
                        updateVisualization();
                    }
                    break;
                case 't':
                    toggleTheme();
                    break;
            }
        });
        
    } catch (error) {
        handleError(error, 'initializeEventListeners');
    }
}

// Initialize performance monitoring
function initializePerformanceMonitoring() {
    try {
        let frameCount = 0;
        let lastTime = performance.now();
        
        function updateFPS() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                const fpsCounter = document.getElementById('fpsCounter');
                if (fpsCounter) {
                    fpsCounter.textContent = `${fps} FPS`;
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        }
        
        updateFPS();
    } catch (error) {
        handleError(error, 'initializePerformanceMonitoring');
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeEventListeners();
        initializePerformanceMonitoring();
        updateVisualization();
        
        // Initialize particles if enabled
        if (window.initParticles) {
            window.initParticles();
        }
        
        // Initialize tutorial
        if (window.initTutorial) {
            window.initTutorial();
        }
        
    } catch (error) {
        handleError(error, 'DOMContentLoaded');
    }
});

// Export functions for use by other modules
window.updateVisualization = updateVisualization;
window.calculateBinomialTerms = calculateBinomialTerms;
window.renderMath = renderMath;
window.currentTheme = () => currentTheme;