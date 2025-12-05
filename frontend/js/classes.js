// classes.js - Classes page logic for Nameria D&D Portal

// State management
let classesData = [];

// DOM elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const classesGridEl = document.getElementById('classes-grid');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Nameria D&D Classes Portal initialized');
  loadClasses();
});

// Fetch all classes from API
async function loadClasses() {
  try {
    showLoading();

    const response = await fetch(getApiUrl(API_CONFIG.endpoints.getSpecies));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      // Filter for classes only (IDs starting with 'c#')
      classesData = data.data.filter(item => item.id.startsWith('c#'));
      renderClassesGrid(classesData);
      hideLoading();
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error loading classes:', error);
    showError();
    hideLoading();
  }
}

// Render classes grid
function renderClassesGrid(classes) {
  classesGridEl.innerHTML = '';

  if (!classes || classes.length === 0) {
    classesGridEl.innerHTML = '<div class="col-12"><p class="text-center text-muted">No classes found.</p></div>';
    return;
  }

  // Sort classes alphabetically by name
  const sortedClasses = [...classes].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  sortedClasses.forEach(item => {
    const card = createClassCard(item);
    classesGridEl.appendChild(card);
  });
}

// Create class card element
function createClassCard(classItem) {
  const col = document.createElement('div');
  col.className = 'col-12 col-xl-4 mb-4';

  const backgroundImage = classItem.imagePath 
    ? `<img src="${classItem.imagePath}" alt="${classItem.name}" class="class-card-bg">`
    : '';

  col.innerHTML = `
    <div class="class-card">
      ${backgroundImage}
      <div class="class-card-content">
        <h3 class="h3 fw-bold mb-1">${classItem.name}</h3>
        <p class="class-subtitle mb-2">${classItem.subtitle || 'A legendary class'}</p>
        <div class="class-divider"></div>
        <p class="mb-2">${classItem.description || 'A powerful adventurer in the realm of Nameria.'}</p>
      </div>
    </div>
  `;

  return col;
}

// UI helper functions
function showLoading() {
  loadingEl.style.display = 'block';
  errorEl.classList.add('d-none');
  classesGridEl.innerHTML = '';
}

function hideLoading() {
  loadingEl.style.display = 'none';
}

function showError() {
  errorEl.classList.remove('d-none');
  classesGridEl.innerHTML = '';
}

