// Convertit le chiffre du budget (dans gifts.json) en texte affiché
const BUDGET_LABELS = { 1: '€', 2: '€€', 3: '€€€' };

// Convertit la clé de catégorie (sans accent, en minuscules) en texte affiché
const CATEGORY_LABELS = {
  'high-tech': 'High-tech', 'gourmandise': 'Gourmandise', 'maison': 'Maison',
  'cuisine': 'Cuisine', 'bureau': 'Bureau', 'auto': 'Auto', 'deco': 'Déco',
};

// ---------- 2. LES ÉLÉMENTS ET LES DONNÉES ----------

const listEl = document.getElementById('gift-list');

// Tableau vide au départ, rempli après la lecture de gifts.json
let gifts = [];

const searchEl = document.getElementById('gift-search');
const budgetBox = document.getElementById('budget-filters');
const categoryBox = document.getElementById('category-filters');
const countEl = document.getElementById('gift-count');
const emptyEl = document.getElementById('gift-empty');

// L'état actuel des filtres. null = pas de filtre actif.
const filters = { search: '', budget: null, category: null };

// Enlève les accents et passe en minuscules : « Déco » et « deco » deviennent identiques
function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// ---------- 3. UNE PETITE FONCTION OUTIL ----------

// Crée un élément HTML en une seule ligne.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// ---------- 4. CRÉER UNE LIGNE POUR UNE IDÉE ----------

function createGiftItem(gift) {
  // <details> : le bloc dépliable natif du navigateur
  const item = el('details', 'gift-item');

  // <summary> : la partie toujours visible (la ligne repliée)
  const summary = document.createElement('summary');

  // À gauche : le titre et l'accroche
  const main = el('span', 'gift-main');
  main.append(
    el('span', 'gift-title', gift.title),
    el('span', 'gift-hook', gift.hook)
  );

  // À droite : l'étiquette de catégorie et le budget
  const meta = el('span', 'gift-meta');
  meta.append(
    // Si la catégorie n'est pas dans la table, on affiche sa valeur brute
    el('span', 'gift-tag', CATEGORY_LABELS[gift.category] || gift.category),
    el('span', 'gift-budget', BUDGET_LABELS[gift.budget])
  );

  // On range les deux blocs dans le summary
  summary.append(main, meta);

  // La partie qui apparaît au dépliage
  const body = el('div', 'gift-body');

  // Le bouton qui mène vers Amazon
  const link = el('a', 'btn btn-primary', 'Voir sur Amazon');
  link.href = gift.url;                           // l'adresse du lien affilié
  link.target = '_blank';                         // ouvre dans un nouvel onglet
  link.rel = 'sponsored noopener noreferrer';     // lien affilié + sécurité du nouvel onglet

  // On range dans le corps : ta description, le bouton, la mention
  body.append(el('p', '', gift.description), link, el('small', 'gift-note', 'Lien affilié'));

  // On assemble : le <details> contient le summary puis le corps
  item.append(summary, body);
  return item;                                    // renvoie la ligne terminée
}

// ---------- 5. AFFICHER UNE LISTE D'IDÉES ----------

function renderGifts(items) {
  listEl.replaceChildren(...items.map(createGiftItem));
}

function applyFilters() {
  const query = normalize(filters.search);

  const result = gifts.filter((g) =>
    (!filters.budget || String(g.budget) === filters.budget) &&
    (!filters.category || g.category === filters.category) &&
    (!query || normalize(`${g.title} ${g.hook} ${g.description}`).includes(query))
  );

  renderGifts(result);
  countEl.textContent = result.length === 1 ? '1 idée' : `${result.length} idées`;
  emptyEl.hidden = result.length !== 0;
}

// ---------- 6. CHARGER gifts.json ----------

function buildChips(container, entries, key) {
  entries.forEach(([value, label]) => {
    const chip = el('button', 'chip', label);
    chip.type = 'button';
    chip.dataset.value = String(value);
    chip.setAttribute('aria-pressed', 'false');

    chip.addEventListener('click', () => {
      // Un clic sur la pastille déjà active la désactive
      filters[key] = filters[key] === String(value) ? null : String(value);
      // Met à jour l'état visuel de toutes les pastilles de ce groupe
      container.querySelectorAll('.chip').forEach((c) => {
        c.setAttribute('aria-pressed', String(c.dataset.value === filters[key]));
      });
      applyFilters();
    });

    container.append(chip);
  });
}

async function loadGifts() {
  try {
    const res = await fetch('gifts.json');
    if (!res.ok) throw new Error(res.status);
    gifts = await res.json();

    buildChips(budgetBox, Object.entries(BUDGET_LABELS), 'budget');

    const usedCategories = [...new Set(gifts.map((g) => g.category))];
    buildChips(categoryBox, usedCategories.map((c) => [c, CATEGORY_LABELS[c] || c]), 'category');

    searchEl.addEventListener('input', () => {
      filters.search = searchEl.value;
      applyFilters();
    });

    applyFilters();
  } catch (err) {
    listEl.textContent = "Impossible de charger les idées pour le moment.";
  }
}

// ---------- 7. DÉMARRAGE ----------

loadGifts();