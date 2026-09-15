const header = document.getElementById('site-header');
const burgerBtn = document.getElementById('burger-btn');
const groupNameInput = document.getElementById('group-name-input');
const budgetInput = document.getElementById('group-budget');

burgerBtn.addEventListener('click', () => {
  const isOpen = header.classList.toggle('open');
  burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

document.addEventListener('click', (e) => {
  if(header.classList.contains('open') && !header.contains(e.target)){
    header.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
});

document.getElementById('mobile-nav').addEventListener('click', (e) => {
  if(e.target.tagName === 'A'){
    header.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
});

const box = document.getElementById('snowfall');

for(let i=0;i<24;i++) {
  const f = document.createElement('div');
  f.className = 'flake';
  const size = 2 + Math.random()*3;
  f.style.width = size+'px';
  f.style.height = size+'px';
  f.style.left = Math.random()*100+'%';
  f.style.animationDuration = (4+Math.random()*4)+'s';
  f.style.animationDelay = (Math.random()*5)+'s';
  box.appendChild(f);
}

/* =========================================
   FORMULAIRE EN 3 ÉTAPES (NOM DU GROUPE, BUDGET, PARTICIPANTS)
========================================= */

const totalSteps = 3;
let currentStep = 1;

const cardEyebrow = document.getElementById('etape');
const stepBackBtn = document.getElementById('retour');
const progressSpans = document.querySelectorAll('#progress-track span');

function showStep(step) {
  document.querySelectorAll('.step-panel').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.step) === step);
  });

  progressSpans.forEach((span, index) => {
    span.classList.toggle('done', index < step);
  });

  cardEyebrow.textContent = `Étape ${step} sur ${totalSteps}`;
  stepBackBtn.style.visibility = step === 1 ? 'hidden' : 'visible';

  currentStep = step;
}

function nextStep() {
  switch (currentStep) {
    case 1:
      if (!groupNameInput.value.trim()) return;
      showStep(2);
      document.getElementById('group-name-title').textContent = groupNameInput.value.trim();
      break;
    case 2:
      if (!budgetInput.value.trim()) return;
      showStep(3);
      const budgetValue = budgetInput.value.trim().replace('€', '');
      document.getElementById('budget-title').textContent = `${budgetValue}€`;
      break;
    case 3:
      launchDraw();
      break;
  }
}

function prevStep() {
  switch (currentStep) {
    case 2:
      document.getElementById('group-name-title').textContent = '';
      showStep(1);
      groupNameInput.focus();
      break;
    case 3:
      document.getElementById('budget-title').textContent = '';
      showStep(2);
      budgetInput.focus();
      break;
  }
}

stepBackBtn.addEventListener('click', prevStep);

document.querySelectorAll('.step-next').forEach((btn) => {
  btn.addEventListener('click', nextStep);
});

groupNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); nextStep(); }
});

budgetInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); nextStep(); }
});

/* ---------- BUDGET ---------- */

const suggestionButtons = document.querySelectorAll('.suggestion-budget');

suggestionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    budgetInput.value = button.dataset.value;
  });
});


/* ---------- PARTICIPANTS ---------- */

const participantList = document.getElementById('participant-list');
const addParticipantBtn = document.getElementById('add-participant');

function updateExclusionOptions() {
  const nameInputs = participantList.querySelectorAll('.participant-name');
  const names = Array.from(nameInputs)
    .map((input) => input.value.trim())
    .filter((name) => name.length > 0);

  participantList.querySelectorAll('.participant-row').forEach((row) => {
    const ownName = row.querySelector('.participant-name').value.trim();
    const select = row.querySelector('.participant-exclusion');
    const previousValue = select.value;

    select.innerHTML = '<option>Aucune exclusion</option>';
    names.filter((name) => name !== ownName).forEach((name) => {
      const option = document.createElement('option');
      option.textContent = name;
      select.appendChild(option);
    });

    if ([...select.options].some((opt) => opt.textContent === previousValue)) {
      select.value = previousValue;
    }
  });
}

participantList.addEventListener('input', (e) => {
  if (e.target.classList.contains('participant-name')) {
    updateExclusionOptions();
  }
});

addParticipantBtn.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'participant-row';
  row.innerHTML = `
    <div class="field no-label">
      <input type="text" class="participant-name" placeholder="Prénom">
    </div>
    <div class="field no-label">
      <input type="text" class="participant-email" placeholder="email@exemple.com">
    </div>
    <div class="field no-label">
      <select class="participant-exclusion">
        <option>Aucune exclusion</option>
      </select>
      <button type="button" class="remove-participant" aria-label="Supprimer ce participant">
        <span class="remove-icon">🗑</span> Supprimer
      </button>
    </div>
  `;
  participantList.appendChild(row);
  updateExclusionOptions();
});

participantList.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-participant')) {
    e.target.closest('.participant-row').remove();
    updateExclusionOptions();
  }
});

/* ---------- TIRAGE AU SORT ---------- */

function getParticipants() {
  return Array.from(participantList.querySelectorAll('.participant-row')).map((row) => ({
    name: row.querySelector('.participant-name').value.trim(),
    email: row.querySelector('.participant-email').value.trim(),
    exclusion: row.querySelector('.participant-exclusion').value,
  })).filter((p) => p.name && p.email);
}

function computeDraw(participants) {
  const names = participants.map((p) => p.name);
  const maxAttempts = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const valid = participants.every((p, i) => {
      const recipient = shuffled[i];
      return recipient !== p.name && recipient !== p.exclusion;
    });
    if (valid) {
      const result = {};
      participants.forEach((p, i) => { result[p.name] = shuffled[i]; });
      return result;
    }
  }
  return null;
}

function launchDraw() {
  const participants = getParticipants();

  if (participants.length < 3) {
    alert('Il faut au moins 3 participants pour lancer le tirage.');
    return;
  }

  const draw = computeDraw(participants);

  if (!draw) {
    alert("Impossible de trouver un tirage valide avec ces exclusions. Essayez d'en retirer une.");
    return;
  }

  // TODO : brancher l'envoi des emails une fois le service choisi (Netlify Functions, EmailJS...)
  console.log('Tirage réalisé :', draw);
  alert('Tirage réalisé ! (voir la console pour le résultat — l\'envoi des emails arrive bientôt)');
}

showStep(1);