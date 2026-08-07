export const sendContributionEmail = async (contribution) => {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_BREVO_API_KEY est manquante dans le fichier .env. L'envoi de l'e-mail a été simulé.");
    return { success: true, simulated: true };
  }

  const {
    reference_number,
    nom,
    prenom,
    email,
    telephone,
    city,
    country,
    nature,
    service,
    title,
    description
  } = contribution;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de votre contribution</title>
      <style>
        body {
          font-family: 'Inter', Helvetica, Arial, sans-serif;
          background-color: #F8FAFC;
          color: #0F172A;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
        }
        .header {
          background: linear-gradient(135deg, #001D4A 0%, #0066A1 100%);
          padding: 40px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #93C5FD;
          font-weight: 500;
        }
        .content {
          padding: 40px;
        }
        .welcome-text {
          font-size: 16px;
          line-height: 1.6;
          color: #334155;
          margin-bottom: 30px;
        }
        .ref-box {
          background: #F0F9FF;
          border: 1px dashed #0284C7;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin-bottom: 30px;
        }
        .ref-label {
          font-size: 12px;
          font-weight: 800;
          color: #0369A1;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }
        .ref-value {
          font-size: 28px;
          font-weight: 900;
          color: #0C4A6E;
          letter-spacing: 1px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 8px;
          margin-top: 30px;
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .detail-label {
          width: 150px;
          font-weight: 700;
          color: #475569;
          flex-shrink: 0;
        }
        .detail-value {
          color: #0F172A;
          font-weight: 500;
        }
        .message-box {
          background: #F8FAFC;
          border-radius: 16px;
          padding: 20px;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          border: 1px solid #E2E8F0;
        }
        .footer {
          background: #F8FAFC;
          padding: 30px;
          text-align: center;
          font-size: 12px;
          color: #64748B;
          border-top: 1px solid #E2E8F0;
        }
        .footer a {
          color: #0066A1;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>e-Participation ADD</h1>
          <p>Plateforme Citoyenne de l'Agence de Développement Digital</p>
        </div>
        <div class="content">
          <p class="welcome-text">
            Bonjour <strong>${prenom} ${nom}</strong>,<br><br>
            Nous vous remercions pour votre participation citoyenne sur notre plateforme. Votre contribution a bien été enregistrée et transmise aux services compétents pour étude.
          </p>
          
          <div class="ref-box">
            <div class="ref-label">Référence de votre dossier</div>
            <div class="ref-value">${reference_number}</div>
          </div>

          <div class="section-title">Détails de la demande</div>
          <div class="detail-row">
            <div class="detail-label">Nature :</div>
            <div class="detail-value">${nature}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Service concerné :</div>
            <div class="detail-value">${service}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Objet :</div>
            <div class="detail-value">${title}</div>
          </div>

          <div class="section-title">Contenu du message</div>
          <div class="message-box">
            ${description.replace(/\n/g, '<br>')}
          </div>

          <div class="section-title">Vos Coordonnées</div>
          <div class="detail-row">
            <div class="detail-label">E-mail :</div>
            <div class="detail-value">${email}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Téléphone :</div>
            <div class="detail-value">${telephone || 'Non renseigné'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Ville :</div>
            <div class="detail-value">${city || 'Non renseignée'}, ${country || 'Maroc'}</div>
          </div>
        </div>
        <div class="footer">
          Cet e-mail est généré automatiquement, merci de ne pas y répondre.<br>
          Pour suivre l'état de votre demande, connectez-vous à <a href="https://e-participation.ma/client">Votre Espace</a>.<br><br>
          &copy; 2026 Agence de Développement Digital (ADD). Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: "e-Participation ADD",
          email: "yassinealaoui095@gmail.com"
        },
        to: [
          {
            email: email,
            name: `${prenom} ${nom}`
          }
        ],
        subject: `[e-Participation] Confirmation de votre contribution - Référence ${reference_number}`,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Brevo API: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail via Brevo:", error);
    return { success: false, error: error.message };
  }
};

export const sendCustomEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_BREVO_API_KEY est manquante dans le fichier .env. L'envoi de l'e-mail a été simulé.");
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: "e-Participation ADD",
          email: "yassinealaoui095@gmail.com"
        },
        to: [
          {
            email: toEmail,
            name: toName || "Citoyen"
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Brevo API: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail via Brevo:", error);
    return { success: false, error: error.message };
  }
};
