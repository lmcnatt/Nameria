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
  col.className = 'col-12 col-md-6 col-xl-4 mb-3';

  // Extract traits if available
  const traits = extractTraits(species);
  const traitsHtml = traits.length > 0 
    ? `<div class="mt-3 mb-3">
         <h6 class="fw-bold mb-2">Racial Traits</h6>
         <div class="text-muted small">
           ${traits.map(trait => `<span class="trait-badge">${trait}</span>`).join('')}
         </div>
       </div>`
    : '';

  const imageHtml = species.imagePath 
    ? `<img src="${species.imagePath}" alt="${species.name}" class="img-fluid" style="max-height: 350px; width: 100%; object-fit: cover; object-position: center;">`
    : `<div class="d-flex align-items-center justify-content-center bg-secondary" style="height: 350px; font-size: 5rem;">${getSpeciesEmoji(species.name)}</div>`;

  col.innerHTML = `
    <div class="species-card h-100">
      <div class="row g-0 h-100">
        <div class="col-md-6">
          <div class="p-4 d-flex flex-column h-100">
            <div>
              <h3 class="h4 fw-bold mb-1">${species.name}</h3>
              <p class="species-subtitle mb-0">Nameria Campaign Setting</p>
              <div class="species-divider"></div>
              <p class="mb-2">${species.description || 'A legendary species from the realm of Nameria.'}</p>
              ${traitsHtml}
            </div>
            <div class="mt-auto pt-3">
              <button class="btn btn-species w-100" onclick="viewSpeciesDetails('${species.name}')">
                VIEW ${species.name.toUpperCase()} DETAILS
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="h-100">
            ${imageHtml}
          </div>
        </div>
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

// View species details (placeholder function)
function viewSpeciesDetails(speciesName) {
  // This could navigate to a detail page or open a modal
  console.log(`Viewing details for: ${speciesName}`);
  alert(`Details for ${speciesName} coming soon!`);
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
