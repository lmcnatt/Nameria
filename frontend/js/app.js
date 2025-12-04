// app.js - Main application logic for Nameria D&D Species Portal

// State management
let speciesData = [];

// DOM elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const speciesGridEl = document.getElementById('species-grid');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Nameria D&D Species Portal initialized');
  loadSpecies();
});

// Fetch all species from API
async function loadSpecies() {
  try {
    showLoading();

    const response = await fetch(getApiUrl(API_CONFIG.endpoints.getSpecies));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      speciesData = data.data;
      renderSpeciesGrid(speciesData);
      hideLoading();
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error loading species:', error);
    showError();
    hideLoading();
  }
}

// Render species grid
function renderSpeciesGrid(species) {
  speciesGridEl.innerHTML = '';

  if (!species || species.length === 0) {
    speciesGridEl.innerHTML = '<div class="col-12"><p class="text-center text-muted">No species found.</p></div>';
    return;
  }

  species.forEach(item => {
    const card = createSpeciesCard(item);
    speciesGridEl.appendChild(card);
  });
}

// Create species card element
function createSpeciesCard(species) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4 mb-4';

  const imageHtml = species.imagePath 
    ? `<img src="${species.imagePath}" alt="${species.name}" class="card-img-top" style="height: 250px; object-fit: cover;">`
    : `<div class="d-flex align-items-center justify-content-center bg-secondary" style="height: 250px; font-size: 4rem;">${getSpeciesEmoji(species.name)}</div>`;

  col.innerHTML = `
    <div class="card bg-dark text-light border-secondary h-100">
      ${imageHtml}
      <div class="card-body">
        <h3 class="card-title text-warning h4 mb-3">${species.name}</h3>
        <p class="card-text text-muted small mb-2"><strong>Source:</strong> ${species.source || 'Unknown'}</p>
        <p class="card-text">${species.description || 'A legendary species from the realm of Nameria.'}</p>
      </div>
    </div>
  `;

  return col;
}


// Get emoji for species
function getSpeciesEmoji(speciesName) {
  const emojiMap = {
    'dragonborn': '🐉',
    'dwarf': '⚒️',
    'elf': '🧝',
    'gnome': '🎩',
    'half-elf': '✨',
    'halfling': '🥾',
    'half-orc': '⚔️',
    'human': '👤',
    'tiefling': '😈',
  };
  
  const key = speciesName.toLowerCase().replace(/\s+/g, '-');
  return emojiMap[key] || '⭐';
}

// UI helper functions
function showLoading() {
  loadingEl.style.display = 'block';
  errorEl.classList.add('d-none');
  speciesGridEl.innerHTML = '';
}

function hideLoading() {
  loadingEl.style.display = 'none';
}

function showError() {
  errorEl.classList.remove('d-none');
  speciesGridEl.innerHTML = '';
}
