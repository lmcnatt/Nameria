// app.js - Main application logic for Nameria D&D Species Portal

// State management
let speciesData = [];
let speciesModal;

// DOM elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const speciesGridEl = document.getElementById('species-grid');
const modalBodyEl = document.getElementById('modal-body');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Nameria D&D Species Portal initialized');
  
  // Initialize Bootstrap modal
  speciesModal = new bootstrap.Modal(document.getElementById('speciesModal'));
  
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
  col.className = 'col-12 col-md-6 col-lg-4';

  const imageHtml = species.imageUrl 
    ? `<img src="${species.imageUrl}" alt="${species.name}" class="card-img-top" style="height: 250px; object-fit: cover;">`
    : `<div class="d-flex align-items-center justify-content-center bg-secondary" style="height: 250px; font-size: 4rem;">${getSpeciesEmoji(species.name)}</div>`;

  const traits = species.traits ? species.traits.slice(0, 3) : [];
  const traitsHtml = traits.map(trait => 
    `<span class="badge bg-warning text-dark me-1 mb-1">${trait}</span>`
  ).join('');

  col.innerHTML = `
    <div class="card bg-dark text-light border-secondary h-100" style="cursor: pointer; transition: transform 0.3s;" onclick="showSpeciesDetail('${species.id}')" onmouseover="this.style.transform='translateY(-5px)'; this.classList.add('border-warning');" onmouseout="this.style.transform=''; this.classList.remove('border-warning');">
      ${imageHtml}
      <div class="card-body">
        <h3 class="card-title text-warning h4">${species.name}</h3>
        <p class="card-text text-muted">${species.description || 'A legendary species from the realm of Nameria.'}</p>
        ${traitsHtml ? `<div class="mt-3">${traitsHtml}</div>` : ''}
      </div>
    </div>
  `;

  return col;
}

// Show species detail modal
function showSpeciesDetail(speciesId) {
  const species = speciesData.find(s => s.id === speciesId);
  
  if (!species) {
    console.error('Species not found:', speciesId);
    return;
  }

  // Update modal title
  document.getElementById('speciesModalLabel').textContent = species.name;

  const imageHtml = species.imageUrl 
    ? `<img src="${species.imageUrl}" alt="${species.name}" class="img-fluid rounded mb-4" style="max-height: 300px; width: 100%; object-fit: cover;">`
    : `<div class="d-flex align-items-center justify-content-center bg-secondary rounded mb-4" style="height: 300px; font-size: 6rem;">${getSpeciesEmoji(species.name)}</div>`;

  const abilityScoresHtml = species.abilityScores ? `
    <div class="row g-3 mb-4">
      ${Object.entries(species.abilityScores).map(([ability, score]) => `
        <div class="col-6 col-md-4">
          <div class="card bg-secondary text-light text-center p-3">
            <div class="text-warning fw-bold">${ability}</div>
            <div class="fs-4">${score >= 0 ? '+' : ''}${score}</div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const traitsHtml = species.traits && species.traits.length > 0 ? `
    <ul class="list-unstyled">
      ${species.traits.map(trait => `<li class="mb-2"><i class="bi bi-check-circle text-warning me-2"></i>${trait}</li>`).join('')}
    </ul>
  ` : '<p class="text-muted">No special traits listed.</p>';

  modalBodyEl.innerHTML = `
    ${imageHtml}
    
    <div class="mb-4">
      <h5 class="text-warning border-bottom border-warning pb-2 mb-3">Description</h5>
      <p class="text-muted">${species.description || 'A legendary species from the realm of Nameria.'}</p>
    </div>

    ${species.abilityScores ? `
      <div class="mb-4">
        <h5 class="text-warning border-bottom border-warning pb-2 mb-3">Ability Score Increases</h5>
        ${abilityScoresHtml}
      </div>
    ` : ''}

    ${species.traits ? `
      <div class="mb-4">
        <h5 class="text-warning border-bottom border-warning pb-2 mb-3">Racial Traits</h5>
        ${traitsHtml}
      </div>
    ` : ''}

    ${species.size ? `
      <div class="mb-4">
        <h5 class="text-warning border-bottom border-warning pb-2 mb-3">Size</h5>
        <p class="text-muted">${species.size}</p>
      </div>
    ` : ''}

    ${species.speed ? `
      <div class="mb-4">
        <h5 class="text-warning border-bottom border-warning pb-2 mb-3">Speed</h5>
        <p class="text-muted">${species.speed} feet</p>
      </div>
    ` : ''}

    ${species.languages ? `
      <div class="mb-4">
        <h5 class="text-warning border-bottom border-warning pb-2 mb-3">Languages</h5>
        <p class="text-muted">${Array.isArray(species.languages) ? species.languages.join(', ') : species.languages}</p>
      </div>
    ` : ''}
  `;

  speciesModal.show();
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
