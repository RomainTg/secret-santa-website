export default async (req) => {
  try {
    const { draw, participants, groupName, budget } = await req.json();

    const emailPromises = Object.entries(draw).map(([giverName, receiverName]) => {
      const giver = participants.find((p) => p.name === giverName);

      return fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: 'tangromain@yahoo.com', name: 'Mon cadeau mystère' },
          to: [{ email: giver.email, name: giverName }],
          subject: `🎁 Ton tirage pour : ${groupName}`,
          htmlContent: `
            <div style="background:#1B3A2F; padding:32px 24px; text-align:center; border-radius:12px 12px 0 0;">
              <p style="margin:0; font-family:Georgia, serif; font-size:22px; color:#FAF9F5;">🎁 Mon cadeau mystère</p>
            </div>
            <div style="background:#FAF9F5; padding:32px 24px; border-radius:0 0 12px 12px; font-family:Arial, sans-serif; color:#14231C;">
              <p style="font-size:16px; margin:0 0 16px;">Bonjour ${giverName},</p>
              <p style="font-size:15px; line-height:1.6; margin:0 0 20px; color:#4A5B52;">
                Le tirage au sort du groupe <strong>${groupName}</strong> a été réalisé. Tu dois offrir un cadeau à :
              </p>
              <div style="background:#C4432B; color:#FAF9F5; font-family:Georgia, serif; font-size:20px; text-align:center; padding:16px; border-radius:8px; margin:0 0 20px;">
                ${receiverName}
              </div>
              <p style="font-size:14px; color:#4A5B52; margin:0 0 8px;">Budget suggéré :</p>
              <p style="display:inline-block; background:#F1EAD9; color:#14231C; font-size:14px; padding:6px 14px; border-radius:100px; margin:0 0 24px;">
                ${budget}€
              </p>
              <p style="font-size:13px; color:#4A5B52; line-height:1.6; margin:24px 0 0;">
                Chuuut, c'est un secret... 🤫
              </p>
            </div>
          `,
          textContent: `Bonjour ${giverName},\n\nLe tirage au sort du groupe ${groupName} a été réalisé. Tu dois offrir un cadeau à : ${receiverName}\n\nBudget suggéré : ${budget}€\n\nChuuut, c'est un secret... 🤫`,
        }),
      });
    });

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};