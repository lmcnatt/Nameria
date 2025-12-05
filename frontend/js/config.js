const API_CONFIG = {
  baseUrl: 'https://m0nobvlrmh.execute-api.us-west-2.amazonaws.com/prod',
  
  endpoints: {
    getSpecies: '/species',
    getSpeciesById: (id) => `/species/${id}`
  }
};

// Helper function to build full API URL
function getApiUrl(endpoint) {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}
