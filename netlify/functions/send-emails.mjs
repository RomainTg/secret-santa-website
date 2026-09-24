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
          htmlContent: `<p>Bonjour ! ${giverName},</p><p>Tu dois offrir un cadeau à <strong>${receiverName}</strong> !</p><p>Budget défini par le groupe : ${budget}</p>`,
        }),
      });
    });

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};