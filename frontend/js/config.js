// config.js - Configuration file for API endpoints

// API Configuration
// Replace this URL with your actual API Gateway endpoint after deployment
// You can get this from Terraform output: terraform output api_gateway_url

const API_CONFIG = {
  baseUrl: 'https://a03xn7cqoh.execute-api.us-west-2.amazonaws.com/prod',
  
  endpoints: {
    getSpecies: '/species',
    getSpeciesById: (id) => `/species/${id}`
  }
};

// Helper function to build full API URL
function getApiUrl(endpoint) {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

