const form = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (event) => {
  // Empêche l'envoi classique du formulaire, qui ferait quitter la page
  event.preventDefault();

  // Évite le double envoi et prévient l'utilisateur
  submitBtn.disabled = true;
  contactStatus.className = '';
  contactStatus.textContent = 'Envoi en cours…';

  try {
    // On envoie les champs au service Formspree, en demandant une réponse en JSON
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(res.status);

    form.reset();
    contactStatus.className = 'is-success';
    contactStatus.textContent = 'Merci ! Votre message a bien été envoyé.';
  } catch (err) {
    contactStatus.className = 'is-error';
    contactStatus.textContent =
      "L'envoi a échoué. Tentez de rafraîchir la page et essayez à nouveau, ou écrivez-nous à contact@moncadeaumystere.fr.";
  } finally {
    submitBtn.disabled = false;
  }
});