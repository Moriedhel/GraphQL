// config.js - Configuration file for API endpoints
// Update these URLs with your actual GraphQL API domain

const CONFIG = {
    AUTH_API_URL: 'https://platform.zone01.gr/api/auth/signin',
    GRAPHQL_API_URL: 'https://platform.zone01.gr/api/graphql-engine/v1/graphql',
    APP_NAME: 'GraphQL Profile Page',
    VERSION: '1.0.0',
    // CORS proxy for development/testing (not for production)
    // Set USE_CORS_PROXY to false when deploying to production with proper CORS setup
    USE_CORS_PROXY: true,
    CORS_PROXY: 'https://corsproxy.io/?'
};

// Utility functions used across multiple files
const UTILS = {
    formatDate: function(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatNumber: function(num) {
        return new Intl.NumberFormat().format(num);
    },

    // Combine all filtered XP data into a single array
    getAllFilteredXPTransactions: function() {
        const projectsXp = JSON.parse(localStorage.getItem('userXPData') || '[]');
        const checkpointsXp = JSON.parse(localStorage.getItem('userCheckpointsXPData') || '[]');
        const piscineJsXp = JSON.parse(localStorage.getItem('jspiscineXPData') || '[]');
        
        return [...projectsXp, ...checkpointsXp, ...piscineJsXp]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    calculatePassFailRatio: function(results) {
        const passed = results.filter(result => result.grade >= 1).length;
        const failed = results.filter(result => result.grade < 1).length;
        const total = results.length;
        
        return {
            passed,
            failed,
            total,
            passRate: total > 0 ? (passed / total * 100).toFixed(1) : 0
        };
    },

    groupTransactionsByDate: function(transactions) {
        const grouped = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.createdAt).toDateString();
            if (!grouped[date]) {
                grouped[date] = 0;
            }
            grouped[date] += transaction.amount || 0;
        });
        
        return Object.keys(grouped)
            .sort((a, b) => new Date(a) - new Date(b))
            .map(date => ({
                date: new Date(date),
                amount: grouped[date]
            }));
    }
};

// Make config and utils available globally
window.CONFIG = CONFIG;
window.UTILS = UTILS;

// For backward compatibility, also make individual functions available globally
window.formatDate = UTILS.formatDate;
window.formatNumber = UTILS.formatNumber;
window.calculatePassFailRatio = UTILS.calculatePassFailRatio;
window.groupTransactionsByDate = UTILS.groupTransactionsByDate;
