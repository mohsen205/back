const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "bensabeurhamad@gmail.com", // Utilise l'email de l'administrateur
    pass: "eqmv ifvw fwjg apqc", // Utilise le mot de passe de l'admin
  },
});

/**
 * Envoie un email avec possibilité de choisir l'expéditeur
 * @param {string} to - L'adresse email du destinataire
 * @param {string} subject - Objet de l'email
 * @param {string} content - Contenu du mail
 * @param {boolean} isHtml - Indique si le contenu est en HTML
 * @param {string} from - L'adresse email de l'expéditeur (par défaut l'admin)
 */
const sendMail = (
  to,
  subject,
  content,
  isHtml = false,
  from = "bensabeurhamad@gmail.com"
) => {
  if (!to) {
    console.error("Aucun destinataire spécifié.");
    return;
  }

  const mailOptions = {
    from: from,
    to: to, // Le destinataire
    subject: subject,
    [isHtml ? "html" : "text"]: content,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Erreur lors de l'envoi de l'e-mail :", err);
    } else {
      console.log("E-mail envoyé : " + info.response);
    }
  });
};

module.exports = { sendMail };
