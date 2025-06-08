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

// Binomial coefficient calculation (n choose k)
function binomialCoefficient(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
        result = result * (n - i + 1) / i;
    }
    return Math.round(result);
}

// Generate Pascal's Triangle up to row n
function generatePascalTriangle(n) {
    const triangle = [];
    for (let i = 0; i <= n; i++) {
        const row = [];
        for (let j = 0; j <= i; j++) {
            row.push(binomialCoefficient(i, j));
        }
        triangle.push(row);
    }
    return triangle;
}

// Calculate binomial expansion terms
function calculateBinomialTerms(a, b, n, x = null) {
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
            value: numericalValue
        });
    }
    return terms;
}

// Render mathematical expressions using KaTeX
function renderMath(expression, element) {
    try {
        katex.render(expression, element, {
            throwOnError: false,
            displayMode: true
        });
    } catch (error) {
        console.error('KaTeX rendering error:', error);
        element.textContent = expression;
    }
}

// Update Pascal's Triangle display
function updatePascalTriangle(n, highlightRow = -1) {
    const pascalContainer = document.getElementById('pascalTriangle');
    pascalContainer.innerHTML = '<h4 style="text-align: center; margin-bottom: 20px; color: #ffffff;">Pascal\'s Triangle</h4>';
    
    const triangle = generatePascalTriangle(Math.min(n + 2, 10)); // Limit display for performance
    
    triangle.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'pascal-row';
        
        row.forEach((number, colIndex) => {
            const numberSpan = document.createElement('span');
            numberSpan.className = 'pascal-number';
            numberSpan.textContent = number;
            
            if (rowIndex === n && colIndex <= n) {
                numberSpan.classList.add('highlighted');
            }
            
            rowDiv.appendChild(numberSpan);
        });
        
        pascalContainer.appendChild(rowDiv);
    });
}

// Update coefficient chart
function updateChart(terms) {
    const ctx = document.getElementById('coefficientsChart').getContext('2d');
    
    if (window.coeffChart) {
        window.coeffChart.destroy();
    }
    
    const labels = terms.map(term => `k=${term.k}`);
    const coefficients = terms.map(term => term.coefficient);
    const values = terms.map(term => Math.abs(term.value));
    
    window.coeffChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Binomial Coefficients',
                data: coefficients,
                backgroundColor: 'rgba(255, 107, 107, 0.7)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 2,
                borderRadius: 8
            }, {
                label: 'Term Values',
                data: values,
                backgroundColor: 'rgba(78, 205, 196, 0.7)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                borderRadius: 8,
                type: 'line',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                title: {
                    display: true,
                    text: 'Binomial Coefficients and Term Values',
                    color: '#ffffff',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Update terms breakdown
function updateTermsBreakdown(terms) {
    const container = document.getElementById('termsBreakdown');
    container.innerHTML = '<h4 style="text-align: center; margin-bottom: 20px; color: #ffffff;">Term Breakdown</h4>';
    
    terms.forEach((term, index) => {
        const termDiv = document.createElement('div');
        termDiv.className = 'term-item';
        termDiv.style.animationDelay = `${index * 0.1}s`;
        
        const expressionDiv = document.createElement('div');
        expressionDiv.className = 'term-expression';
        
        // Create a container for the LaTeX expression
        const latexContainer = document.createElement('span');
        latexContainer.className = 'term-latex';
        renderMath(term.latexExpression, latexContainer);
        
        expressionDiv.innerHTML = `Term ${index + 1}: `;
        expressionDiv.appendChild(latexContainer);
        
        const valueDiv = document.createElement('div');
        valueDiv.className = 'term-value';
        valueDiv.textContent = term.value.toFixed(3);
        
        termDiv.appendChild(expressionDiv);
        termDiv.appendChild(valueDiv);
        container.appendChild(termDiv);
    });
}

// Main update function
function updateVisualization() {
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
    
    // Update current expression
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
    renderMath(currentExpr, document.getElementById('currentExpression'));
    
    // Update expanded form
    const expandedLatex = terms.map((term, index) => {
        if (index === 0) {
            return term.latexExpression;
        } else {
            // Check if the term value is negative
            if (term.value < 0) {
                return ` - ${term.latexExpression.replace(/^-/, '')}`;
            } else {
                return ` + ${term.latexExpression}`;
            }
        }
    }).join('');
    
    renderMath(expandedLatex, document.getElementById('expandedForm'));
    
    // Update numerical result
    const totalValue = terms.reduce((sum, term) => sum + term.value, 0);
    renderMath(`= ${totalValue.toFixed(3)}`, document.getElementById('numericalResult'));
    
    // Update general formula
    renderMath('(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k', document.getElementById('generalFormula'));
    
    // Update visualizations
    updateChart(terms);
    
    if (showPascal) {
        document.getElementById('pascalTriangle').style.display = 'block';
        updatePascalTriangle(n);
    } else {
        document.getElementById('pascalTriangle').style.display = 'none';
    }
    
    if (animateExpansion) {
        updateTermsBreakdown(terms);
    } else {
        document.getElementById('termsBreakdown').innerHTML = '';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all controls
    const controls = ['powerN', 'coeffA', 'coeffB', 'xValue', 'showPascal', 'animateExpansion'];
    controls.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateVisualization);
            element.addEventListener('change', updateVisualization);
        }
    });
    
    // Initial visualization
    updateVisualization();
});