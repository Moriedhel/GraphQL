// profile.js - Profile page logic

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuthOnLoad();
    loadProfileData();
});

// Main function to load all profile data
async function loadProfileData() {
    try {
        // Show loading states
        showLoadingStates();
        
        // Load all data in parallel for better performance
        const [userInfo, projectsXP, checkpointsXP, piscineJsXP, userResults, userProgress] = await Promise.all([
            getUserBasicInfo().catch(err => { console.warn('User info failed:', err); return []; }),
            fetchUserProjectsXPData().catch(err => { console.warn('Projects XP failed:', err); return []; }),
            fetchUserCheckpointsXPData().catch(err => { console.warn('Checkpoints XP failed:', err); return []; }),
            fetchJSPiscineXPData().catch(err => { console.warn('JS Piscine XP failed:', err); return []; }),
            getUserResults().catch(err => { console.warn('User results failed:', err); return []; }),
            getUserProgress().catch(err => { console.warn('User progress failed:', err); return []; })
        ]);

        // Calculate total XP from filtered categories
        const xpTotals = calculateTotalXP();

        // Update UI with loaded data - functions handle empty/null data gracefully
        updateUserHeader(userInfo);
        updateBasicInfo(userInfo);
        updateXPInfo(xpTotals, projectsXP, checkpointsXP, piscineJsXP);
        updateAuditInfo(userResults, userProgress);
        
        // Create visualizations using all filtered XP data combined
        const allXPTransactions = UTILS.getAllFilteredXPTransactions();
        createDataVisualizations(allXPTransactions, userResults);
        
    } catch (error) {
        console.error('Failed to load profile data:', error);
        showErrorStates(error.message);
        
        // If authentication error, redirect to login
        if (error.message.includes('authentication') || error.message.includes('token')) {
            removeToken();
            window.location.href = 'index.html';
        }
    }
}

// Show loading states for all sections
function showLoadingStates() {
    const loadingElements = [
        'user-name',
        'basic-info-content',
        'xp-info-content',
        'audit-info-content'
    ];
    
    loadingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    });
}

// Show error states
function showErrorStates(errorMessage) {
    const errorElements = [
        'basic-info-content',
        'xp-info-content',
        'audit-info-content'
    ];
    
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<div class="error">Error loading data: ${errorMessage}</div>`;
        }
    });
}

// Update user header information
function updateUserHeader(userInfo) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && userInfo && userInfo.length > 0) {
        const user = userInfo[0];
        const displayName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.login || 'User';
        userNameElement.textContent = displayName;
    }
}

// Update basic information section
function updateBasicInfo(userInfo) {
    const basicInfoElement = document.getElementById('basic-info-content');
    if (!basicInfoElement) return;
    
    if (!userInfo || userInfo.length === 0) {
        basicInfoElement.innerHTML = '<p>No user information available</p>';
        return;
    }
    
    const user = userInfo[0];
    const info = [
        { label: 'ID', value: user.id },
        { label: 'Login', value: user.login },
        { label: 'Email', value: user.email || 'Not provided' },
        { label: 'First Name', value: user.firstName || 'Not provided' },
        { label: 'Last Name', value: user.lastName || 'Not provided' },
        { label: 'Member Since', value: formatDate(user.createdAt) }
    ];
    
    basicInfoElement.innerHTML = info.map(item => `
        <div class="data-item">
            <span class="data-label">${item.label}:</span>
            <span class="data-value">${item.value}</span>
        </div>
    `).join('');
}

// Update XP information section
function updateXPInfo(xpTotals, projectsXP, checkpointsXP, piscineJsXP) {
    const xpInfoElement = document.getElementById('xp-info-content');
    if (!xpInfoElement) return;
    
    if (!xpTotals || xpTotals.total === 0) {
        xpInfoElement.innerHTML = '<p>No XP data available</p>';
        return;
    }
    
    // Combine all XP transactions for recent activity
    const allTransactions = [...projectsXP, ...checkpointsXP, ...piscineJsXP]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const recentTransactions = allTransactions.slice(0, 5);
    
    const xpInfo = [
        { label: 'Total XP', value: formatNumber(xpTotals.total), style: 'font-weight: bold; font-size: 1.1em;' },
        { label: 'Projects XP', value: formatNumber(xpTotals.projects) },
        { label: 'Checkpoints XP', value: formatNumber(xpTotals.checkpoints) },
        { label: 'JS Piscine XP & Bonus', value: formatNumber(xpTotals.piscineJs) },
        { label: 'Total Transactions', value: allTransactions.length }
    ];
    
    let html = xpInfo.map(item => `
        <div class="data-item" ${item.style ? `style="${item.style}"` : ''}>
            <span class="data-label">${item.label}:</span>
            <span class="data-value">${item.value}</span>
        </div>
    `).join('');
    
    if (recentTransactions.length > 0) {
        html += '<h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">Recent XP Gains:</h4>';
        html += recentTransactions.map(transaction => `
            <div class="data-item" style="font-size: 0.9em;">
                <span class="data-label">+${formatNumber(transaction.amount)} XP</span>
                <span class="data-value">${formatDate(transaction.createdAt)}</span>
                ${transaction.object ? `<br><small>${transaction.object.name}</small>` : ''}
            </div>
        `).join('');
    }
    
    xpInfoElement.innerHTML = html;
}

// Update audit information section
function updateAuditInfo(userResults, userProgress) {
    const auditInfoElement = document.getElementById('audit-info-content');
    if (!auditInfoElement) return;
    
    if (!userResults || userResults.length === 0) {
        auditInfoElement.innerHTML = '<p>No audit data available</p>';
        return;
    }
    
    // Filter valid results
    const validResults = userResults.filter(result => result && typeof result.grade === 'number');
    if (validResults.length === 0) {
        auditInfoElement.innerHTML = '<p>No valid audit data available</p>';
        return;
    }
    
    const passFailRatio = calculatePassFailRatio(validResults);
    const projectResults = validResults.filter(result => 
        result.object && result.object.type === 'project'
    );
    const exerciseResults = validResults.filter(result => 
        result.object && result.object.type === 'exercise'
    );
    
    const auditInfo = [
        { label: 'Total Results', value: validResults.length },
        { label: 'Projects Completed', value: projectResults.length },
        { label: 'Exercises Completed', value: exerciseResults.length },
        { label: 'Overall Success Rate', value: `${passFailRatio.passRate}%` },
        { label: 'Passed', value: passFailRatio.passed },
        { label: 'Failed', value: passFailRatio.failed }
    ];
    
    if (userProgress && userProgress.length > 0) {
        auditInfo.push({ label: 'Progress Records', value: userProgress.length });
    }
    
    auditInfoElement.innerHTML = auditInfo.map(item => `
        <div class="data-item">
            <span class="data-label">${item.label}:</span>
            <span class="data-value">${item.value}</span>
        </div>
    `).join('');
}

// Create data visualizations
function createDataVisualizations(xpTransactions, userResults) {
    // Create XP over time chart
    if (xpTransactions && xpTransactions.length > 0) {
        try {
            const xpOverTime = groupTransactionsByDate(xpTransactions);
            if (xpOverTime && xpOverTime.length > 0) {
                createXPLineChart(xpOverTime, 'xp-chart');
            } else {
                document.getElementById('xp-chart').innerHTML = '<p>No XP timeline data available</p>';
            }
        } catch (error) {
            console.error('Failed to create XP chart:', error);
            document.getElementById('xp-chart').innerHTML = '<p>Error creating XP chart</p>';
        }
    } else {
        const xpChartElement = document.getElementById('xp-chart');
        if (xpChartElement) {
            xpChartElement.innerHTML = '<p>No XP data available for visualization</p>';
        }
    }
    
    // Create success rate pie chart
    if (userResults && userResults.length > 0) {
        try {
            const validResults = userResults.filter(r => r && typeof r.grade === 'number');
            if (validResults.length > 0) {
                const successData = calculatePassFailRatio(validResults);
                createSuccessPieChart(successData, 'success-chart');
            } else {
                document.getElementById('success-chart').innerHTML = '<p>No valid results data available</p>';
            }
        } catch (error) {
            console.error('Failed to create success chart:', error);
            document.getElementById('success-chart').innerHTML = '<p>Error creating success chart</p>';
        }
    } else {
        const successChartElement = document.getElementById('success-chart');
        if (successChartElement) {
            successChartElement.innerHTML = '<p>No results data available for visualization</p>';
        }
    }
}
