// graphql.js - GraphQL queries and data handling

// Get GraphQL API Configuration with CORS proxy support
const getGraphQLApiUrl = () => {
    const baseUrl = window.CONFIG?.GRAPHQL_API_URL || 'https://((DOMAIN))/api/graphql-engine/v1/graphql';
    if (window.CONFIG?.USE_CORS_PROXY && window.CONFIG?.CORS_PROXY) {
        return window.CONFIG.CORS_PROXY + encodeURIComponent(baseUrl);
    }
    return baseUrl;
};

// Function to execute GraphQL queries with authentication
async function executeGraphQLQuery(query, variables = {}) {
    // Check if auth.js functions are available
    if (typeof getToken !== 'function') {
        throw new Error('Authentication module not loaded. Please ensure auth.js is loaded before graphql.js');
    }
    
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(getGraphQLApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(`GraphQL error: ${data.errors.map(e => e.message).join(', ')}`);
        }

        return data.data;
    } catch (error) {
        console.error('GraphQL query failed:', error);
        throw error;
    }
}

// Basic Query: Get user information
async function getUserBasicInfo() {
    const query = `
        query {
            user {
                id
                login
                firstName
                lastName
                email
                createdAt
                updatedAt
            }
        }
    `;
    
    try {
        const data = await executeGraphQLQuery(query);
        // Handle both single user and array response formats
        return Array.isArray(data.user) ? data.user : (data.user ? [data.user] : []);
    } catch (error) {
        console.error('Failed to fetch user basic info:', error);
        throw error;
    }
}

// Nested Query: Get results with user information
async function getUserResults() {
    const query = `
        query {
            result(order_by: { createdAt: desc }) {
                id
                grade
                type
                createdAt
                updatedAt
                path
                user {
                    id
                    login
                }
                object {
                    id
                    name
                    type
                }
            }
        }
    `;
    
    try {
        const data = await executeGraphQLQuery(query);
        return Array.isArray(data.result) ? data.result : [];
    } catch (error) {
        console.error('Failed to fetch user results:', error);
        // Return empty array instead of throwing to prevent cascade failures
        return [];
    }
}

// Helper function to fetch XP data with custom where clause
async function fetchXpData(whereClause, storageKey) {
    const query = `
        query {
            transaction(where: ${whereClause}, order_by: { createdAt: desc }) {
                path
                amount
                createdAt
                object {
                    name
                    type
                }
            }
        }
    `;

    try {
        const data = await executeGraphQLQuery(query);
        const transactions = Array.isArray(data.transaction) ? data.transaction : [];
        localStorage.setItem(storageKey, JSON.stringify(transactions));
        console.log(`${storageKey} saved:`, transactions);
        return transactions;
    } catch (error) {
        console.error(`Fetch ${storageKey} error:`, error);
        return [];
    }
}

// Fetch XP from projects only (excludes checkpoints and piscine-js)
async function fetchUserProjectsXPData() {
    const where = `{
        _and: [
            { type: { _eq: "xp" } },
            { path: { _like: "/athens/div-01/%" } },
            { path: { _nlike: "/athens/div-01/checkpoint%" } },
            { path: { _nlike: "/athens/div-01/piscine-js%" } }
        ]
    }`;
    return await fetchXpData(where, 'userXPData');
}

// Fetch XP from checkpoints only
async function fetchUserCheckpointsXPData() {
    const where = `{
        _and: [
            { type: { _eq: "xp" } },
            { path: { _like: "/athens/div-01/checkpoint%" } }
        ]
    }`;
    return await fetchXpData(where, 'userCheckpointsXPData');
}

// Fetch XP from JS Piscine only
async function fetchJSPiscineXPData() {
    const where = `{
        _and: [
            { type: { _eq: "xp" } },
            {
          _or: [
            { path: { _like: "/athens/div-01" } }
            { path: { _like: "/athens/div-01/piscine-js" } }
          ]
        }
        ]
    }`;
    return await fetchXpData(where, 'jspiscineXPData');
}

// Calculate total XP from all categories
function calculateTotalXP() {
    const projectsXp = JSON.parse(localStorage.getItem('userXPData') || '[]');
    const checkpointsXp = JSON.parse(localStorage.getItem('userCheckpointsXPData') || '[]');
    const piscineJsXp = JSON.parse(localStorage.getItem('jspiscineXPData') || '[]');

    const sumXp = (data) => data.reduce((sum, x) => sum + (x.amount || 0), 0);

    const totals = {
        projects: sumXp(projectsXp),
        checkpoints: sumXp(checkpointsXp),
        piscineJs: sumXp(piscineJsXp),
    };

    totals.total = totals.projects + totals.checkpoints + totals.piscineJs;

    console.table(totals);
    localStorage.setItem('totalXPStats', JSON.stringify(totals));

    return totals;
}

// Get user progress data
async function getUserProgress() {
    const query = `
        query {
            progress(order_by: { createdAt: desc }) {
                id
                grade
                createdAt
                updatedAt
                path
                user {
                    id
                    login
                }
                object {
                    id
                    name
                    type
                }
            }
        }
    `;
    
    try {
        const data = await executeGraphQLQuery(query);
        return Array.isArray(data.progress) ? data.progress : [];
    } catch (error) {
        console.error('Failed to fetch user progress:', error);
        // Return empty array instead of throwing to prevent cascade failures
        return [];
    }
}

// Data transformation functions moved to config.js for better organization
// These functions are now available globally via UTILS object
