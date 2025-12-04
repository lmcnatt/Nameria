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

  // Sort species alphabetically by name
  const sortedSpecies = [...species].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  sortedSpecies.forEach(item => {
    const card = createSpeciesCard(item);
    speciesGridEl.appendChild(card);
  });
}

// Create species card element
function createSpeciesCard(species) {
  const col = document.createElement('div');
  col.className = 'col-12 col-xl-4 mb-4';

  // Extract traits if available
  const traits = extractTraits(species);
  const traitsHtml = traits.length > 0 
    ? `<div class="mt-auto pt-3">
         <h6 class="fw-bold mb-2">Racial Traits</h6>
         <div class="text-light small">
           ${traits.join(', ')}
         </div>
       </div>`
    : '';

  const backgroundImage = species.imagePath 
    ? `<img src="${species.imagePath}" alt="${species.name}" class="species-card-bg">`
    : '';

  col.innerHTML = `
    <div class="species-card">
      ${backgroundImage}
      <div class="species-card-content">
        <h3 class="h3 fw-bold mb-1">${species.name}</h3>
        <p class="species-subtitle mb-2">${species.source || 'Unknown Source'}</p>
        <div class="species-divider"></div>
        <p class="mb-2">${species.description || 'A legendary species from the realm of Nameria.'}</p>
        ${traitsHtml}
      </div>
    </div>
  `;

  return col;
}

// Extract racial traits from species data
function extractTraits(species) {
  const traits = [];
  
  // Check common trait fields
  if (species.traits) {
    if (Array.isArray(species.traits)) {
      return species.traits;
    } else if (typeof species.traits === 'string') {
      return species.traits.split(',').map(t => t.trim());
    }
  }
  
  // Check for common D&D traits in the data
  if (species.abilityScoreIncrease) traits.push(species.abilityScoreIncrease);
  if (species.speed) traits.push(`Speed ${species.speed}`);
  if (species.size) traits.push(species.size);
  
  return traits;
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
