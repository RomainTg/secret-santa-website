const header = document.getElementById('site-header');
const burgerBtn = document.getElementById('burger-btn');
const groupNameInput = document.getElementById('group-name-input');
const budgetInput = document.getElementById('group-budget');
const launchDrawBtn = document.getElementById('launch-draw');
const drawModal = document.getElementById('popupModal');
const modalCloseBtn = document.getElementById('modal-close-btn');

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

document.getElementById('launch-draw').addEventListener('click', launchDraw);

groupNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); nextStep(); }
});

budgetInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); nextStep(); }
});

modalCloseBtn.addEventListener('click', () => {
  drawModal.hidden = true;
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

function createParticipantRow(name = '', email = '', exclusion = '', removable = true) {
  const row = document.createElement('div');
  row.className = 'participant-row';
  row.innerHTML = `
    <div class="field no-label">
      <input type="text" class="participant-name" placeholder="Prénom" value="${name}">
    </div>
    <div class="field no-label">
      <input type="text" class="participant-email" placeholder="email@exemple.com" value="${email}">
    </div>
    <div class="field no-label">
      <select class="participant-exclusion">
        <option>Aucune exclusion</option>
      </select>
    </div>
    ${removable ? '<button type="button" class="remove-participant" aria-label="Supprimer ce participant"><span class="remove-icon">🗑</span> Supprimer</button>' : ''}
  `;
  return row;
}

addParticipantBtn.addEventListener('click', () => {
  participantList.appendChild(createParticipantRow());
  updateExclusionOptions();
});

participantList.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.remove-participant');
  if (removeBtn) {
    removeBtn.closest('.participant-row').remove();
    updateExclusionOptions();
  }
});

const excelImportInput = document.getElementById('excel-import');

excelImportInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  importParticipants(rows);
  excelImportInput.value = '';
});


function importParticipants(rows) {
  const excelData = Array.from(participantList.querySelectorAll('.participant-name'))
    .some((input) => input.value.trim() !== '');

  if (excelData) {
    const replace = confirm('Vous avez déjà des participants saisis. Remplacer par le fichier importé ?');
    if (replace) participantList.innerHTML = '';
  } else {
    participantList.innerHTML = '';
  }

  let currentCount = participantList.querySelectorAll('.participant-row').length;

  rows.forEach((row, index) => {
    const name = (row['Prénom'] || '').toString().trim();
    const email = (row['Email'] || '').toString().trim();
    if (!name || !email) return;

    participantList.appendChild(createParticipantRow(name, email, '', currentCount >= 3));
    currentCount++;
  });

  updateExclusionOptions();

  rows.forEach((row, index) => {
    const exclusion = (row['Exclusion'] || '').toString().trim();
    if (!exclusion) return;
    const select = participantList.querySelectorAll('.participant-exclusion')[index];
    if (select) select.value = exclusion;
  });
}


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

async function launchDraw() {
  const participants = getParticipants();
  const invalidEmails = Array.from(participantList.querySelectorAll('.participant-email'))
    .filter((input) => input.value.trim() && !input.checkValidity());

  if (invalidEmails.length > 0) {
    alert('Une ou plusieurs adresses email ne sont pas valides. Merci de les corriger.');
    invalidEmails[0].focus();
    return;
  }

  if (participants.length < 3) {
    alert('Il faut au moins 3 participants pour lancer le tirage.');
    return;
  }

  const draw = computeDraw(participants);

  if (!draw) {
    alert("Impossible de trouver un tirage valide avec les exclusions actuelles. Veuillez tenter d'en retirer une.");
    return;
  }

  launchDrawBtn.disabled = true;
  const originalText = launchDrawBtn.textContent;
  launchDrawBtn.textContent = 'Tirage en cours...';

try {
    const response = await fetch('/.netlify/functions/send-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draw,
        participants,
        groupName: groupNameInput.value.trim(),
        budget: budgetInput.value.trim(),
        antibot: document.getElementById('antibot').value,
      }),
    });

    const result = await response.json();

    if (result.sent === result.total) {
      document.getElementById('modal-title').textContent = '🎉 Tirage réalisé !';
      document.getElementById('modal-message').textContent = "Chaque participant va recevoir un email avec le budget et le nom de la personne qu'il doit gâter.";
      drawModal.hidden = false;
    } else if (result.sent > 0) {
      document.getElementById('modal-title').textContent = '⚠️ Tirage envoyé partiellement';
      document.getElementById('modal-message').textContent = `${result.sent} email(s) sur ${result.total} ont bien été envoyés. Vérifiez les adresses des participants manquants.`;
      modalCloseBtn.hidden = false;
      drawModal.hidden = false;
    } else {
      alert("Le tirage a été calculé, mais l'envoi des emails a échoué. Veuillez réessayer.");
    }
  } catch (error) {
    alert("Impossible de contacter le serveur d'envoi. Veuillez vérifier votre connexion et réessayez.");
  } finally {
    launchDrawBtn.disabled = false;
    launchDrawBtn.textContent = originalText;
  }
}

showStep(1);