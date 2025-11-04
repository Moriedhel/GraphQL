// graphs.js - SVG graph generation

// SVG namespace for creating SVG elements
const SVG_NS = 'http://www.w3.org/2000/svg';

// Utility function to create SVG elements
function createSVGElement(tagName, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    return element;
}

// Create a line chart for XP progress over time
function createXPLineChart(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found`);
        return;
    }
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No XP data available</p>';
        return;
    }

    // Validate data format
    const validData = data.filter(d => d && d.date && typeof d.amount === 'number');
    if (validData.length === 0) {
        container.innerHTML = '<p>Invalid XP data format</p>';
        return;
    }

    // Chart dimensions
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = createSVGElement('svg', {
        width: width,
        height: height,
        class: 'svg-graph'
    });

    // Calculate cumulative XP and scales
    let cumulativeXP = 0;
    const chartData = validData.map(d => {
        cumulativeXP += d.amount;
        return {
            date: d.date,
            cumulativeXP: cumulativeXP
        };
    });

    const maxXP = Math.max(...chartData.map(d => d.cumulativeXP));
    const minDate = Math.min(...chartData.map(d => d.date.getTime()));
    const maxDate = Math.max(...chartData.map(d => d.date.getTime()));

    // Create scales
    const xScale = (date) => (date.getTime() - minDate) / (maxDate - minDate) * chartWidth;
    const yScale = (xp) => chartHeight - (xp / maxXP) * chartHeight;

    // Create chart group
    const chartGroup = createSVGElement('g', {
        transform: `translate(${margin.left}, ${margin.top})`
    });

    // Create axes
    // X-axis
    const xAxis = createSVGElement('line', {
        x1: 0,
        y1: chartHeight,
        x2: chartWidth,
        y2: chartHeight,
        class: 'axis-line'
    });
    chartGroup.appendChild(xAxis);

    // Y-axis
    const yAxis = createSVGElement('line', {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: chartHeight,
        class: 'axis-line'
    });
    chartGroup.appendChild(yAxis);

    // Create line path
    let pathData = '';
    chartData.forEach((d, i) => {
        const x = xScale(d.date);
        const y = yScale(d.cumulativeXP);
        pathData += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    const linePath = createSVGElement('path', {
        d: pathData,
        class: 'chart-line'
    });
    chartGroup.appendChild(linePath);

    // Add data points
    chartData.forEach(d => {
        const circle = createSVGElement('circle', {
            cx: xScale(d.date),
            cy: yScale(d.cumulativeXP),
            r: 4,
            fill: '#667eea',
            stroke: 'white',
            'stroke-width': 2
        });
        
        // Add tooltip on hover
        circle.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(0,0,0,0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            tooltip.innerHTML = `Date: ${d.date.toDateString()}<br>XP: ${formatNumber(d.cumulativeXP)}`;
            
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = (rect.left + window.scrollX - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 10) + 'px';
            
            e.target._tooltip = tooltip;
        });
        
        circle.addEventListener('mouseleave', (e) => {
            if (e.target._tooltip) {
                document.body.removeChild(e.target._tooltip);
                e.target._tooltip = null;
            }
        });
        
        chartGroup.appendChild(circle);
    });

    // Add Y-axis labels
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
        const value = (maxXP / yTicks) * i;
        const y = yScale(value);
        
        const tickLine = createSVGElement('line', {
            x1: -5,
            y1: y,
            x2: 0,
            y2: y,
            class: 'axis-line'
        });
        chartGroup.appendChild(tickLine);
        
        const label = createSVGElement('text', {
            x: -10,
            y: y + 4,
            'text-anchor': 'end',
            class: 'axis-text'
        });
        label.textContent = formatNumber(Math.round(value));
        chartGroup.appendChild(label);
    }

    // Add title
    const title = createSVGElement('text', {
        x: width / 2,
        y: 15,
        'text-anchor': 'middle',
        class: 'axis-text',
        'font-weight': 'bold'
    });
    title.textContent = 'Cumulative XP Over Time';
    svg.appendChild(title);

    svg.appendChild(chartGroup);
    container.innerHTML = '';
    container.appendChild(svg);
}

// Create a pie chart for project success rate
function createSuccessPieChart(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found`);
        return;
    }
    
    if (!data || typeof data !== 'object') {
        container.innerHTML = '<p>No success data available</p>';
        return;
    }

    const { passed = 0, failed = 0, total = 0, passRate = 0 } = data;
    
    if (total === 0) {
        container.innerHTML = '<p>No project data available</p>';
        return;
    }

    // Chart dimensions
    const size = 300;
    const radius = size / 2 - 40;
    const centerX = size / 2;
    const centerY = size / 2;

    // Create SVG
    const svg = createSVGElement('svg', {
        width: size,
        height: size + 80,
        class: 'svg-graph'
    });

    // Calculate angles
    const passedAngle = (passed / total) * 2 * Math.PI;
    const failedAngle = (failed / total) * 2 * Math.PI;

    // Create pie slices
    if (passed > 0) {
        const passedPath = createPieSlice(centerX, centerY, radius, 0, passedAngle);
        const passedSlice = createSVGElement('path', {
            d: passedPath,
            fill: '#2ecc71',
            class: 'chart-slice'
        });
        svg.appendChild(passedSlice);
    }

    if (failed > 0) {
        const failedPath = createPieSlice(centerX, centerY, radius, passedAngle, passedAngle + failedAngle);
        const failedSlice = createSVGElement('path', {
            d: failedPath,
            fill: '#e74c3c',
            class: 'chart-slice'
        });
        svg.appendChild(failedSlice);
    }

    // Add center text
    const centerText = createSVGElement('text', {
        x: centerX,
        y: centerY - 5,
        'text-anchor': 'middle',
        class: 'axis-text',
        'font-size': '18',
        'font-weight': 'bold'
    });
    centerText.textContent = `${passRate}%`;
    svg.appendChild(centerText);

    const centerSubtext = createSVGElement('text', {
        x: centerX,
        y: centerY + 15,
        'text-anchor': 'middle',
        class: 'axis-text',
        'font-size': '12'
    });
    centerSubtext.textContent = 'Success Rate';
    svg.appendChild(centerSubtext);

    // Add legend
    const legendY = size + 20;
    
    // Passed legend
    const passedRect = createSVGElement('rect', {
        x: 50,
        y: legendY,
        width: 15,
        height: 15,
        fill: '#2ecc71'
    });
    svg.appendChild(passedRect);
    
    const passedLabel = createSVGElement('text', {
        x: 75,
        y: legendY + 12,
        class: 'legend'
    });
    passedLabel.textContent = `Passed: ${passed}`;
    svg.appendChild(passedLabel);

    // Failed legend
    const failedRect = createSVGElement('rect', {
        x: 160,
        y: legendY,
        width: 15,
        height: 15,
        fill: '#e74c3c'
    });
    svg.appendChild(failedRect);
    
    const failedLabel = createSVGElement('text', {
        x: 185,
        y: legendY + 12,
        class: 'legend'
    });
    failedLabel.textContent = `Failed: ${failed}`;
    svg.appendChild(failedLabel);

    container.innerHTML = '';
    container.appendChild(svg);
}

// Helper function to create pie slice path
function createPieSlice(centerX, centerY, radius, startAngle, endAngle) {
    const x1 = centerX + radius * Math.cos(startAngle - Math.PI / 2);
    const y1 = centerY + radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = centerX + radius * Math.cos(endAngle - Math.PI / 2);
    const y2 = centerY + radius * Math.sin(endAngle - Math.PI / 2);
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
    
    return [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
    ].join(' ');
}

// Create a simple bar chart for any data
function createBarChart(data, containerId, title = 'Bar Chart') {
    const container = document.getElementById(containerId);
    if (!container || !data || data.length === 0) {
        container.innerHTML = '<p>No data available for chart</p>';
        return;
    }

    const width = 500;
    const height = 300;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = createSVGElement('svg', {
        width: width,
        height: height,
        class: 'svg-graph'
    });

    const chartGroup = createSVGElement('g', {
        transform: `translate(${margin.left}, ${margin.top})`
    });

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    // Create bars
    data.forEach((d, i) => {
        const barHeight = (d.value / maxValue) * chartHeight;
        const x = i * (barWidth + barSpacing) + barSpacing / 2;
        const y = chartHeight - barHeight;

        const bar = createSVGElement('rect', {
            x: x,
            y: y,
            width: barWidth,
            height: barHeight,
            class: 'chart-bar'
        });
        chartGroup.appendChild(bar);

        // Add value label on top of bar
        const label = createSVGElement('text', {
            x: x + barWidth / 2,
            y: y - 5,
            'text-anchor': 'middle',
            class: 'axis-text',
            'font-size': '10'
        });
        label.textContent = d.value;
        chartGroup.appendChild(label);
    });

    // Add axes
    const xAxis = createSVGElement('line', {
        x1: 0,
        y1: chartHeight,
        x2: chartWidth,
        y2: chartHeight,
        class: 'axis-line'
    });
    chartGroup.appendChild(xAxis);

    const yAxis = createSVGElement('line', {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: chartHeight,
        class: 'axis-line'
    });
    chartGroup.appendChild(yAxis);

    // Add title
    const titleElement = createSVGElement('text', {
        x: width / 2,
        y: 20,
        'text-anchor': 'middle',
        class: 'axis-text',
        'font-weight': 'bold'
    });
    titleElement.textContent = title;
    svg.appendChild(titleElement);

    svg.appendChild(chartGroup);
    container.innerHTML = '';
    container.appendChild(svg);
}
