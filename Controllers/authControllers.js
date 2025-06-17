// authControllers.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Role = require("../models/Role.model");
const upload = require("../midelware/multer");

const authController = {};

authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ email: email }).populate("role");
    console.log(user, email, password);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Votre compte n'est pas encore activé." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role ? user.role.nom : null },
      "mySecretKey123!@#",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        phone: user.phone,
        role: user.role ? user.role.nom : "Aucun rôle assigné",
      },
    });
    console.log(token);
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
  }
};

authController.Inscription = async (req, res) => {
  try {
    const { nom, prenom, email, password, adresse, phone, typeUtilisateur } =
      req.body;

    // 1. Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // 2. Vérifie que le type utilisateur est correct
    if (!["investisseur", "porteurprojet"].includes(typeUtilisateur)) {
      return res.status(400).json({ message: "Type utilisateur invalide." });
    }

    // 3. Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageprofile = "";
    if (req.file) {
      imageprofile = "http://localhost:7501/uploads/" + req.file.filename;
    }

    // 5. Création de l'utilisateur
    const newUser = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      adresse,
      phone,
      typeUtilisateur,
      imageprofile,
      isActive: true,
    });

    // 6. Sauvegarde de l'utilisateur en base de données
    await newUser.save();

    // 7. Réponse après inscription
    res.status(201).json({ message: "Utilisateur enregistré avec succès." });
  } catch (err) {
    console.error("Erreur inscription :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

authController.logout = (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    req.user = null;

    res.status(200).json({ message: "Déconnexion réeussie" });
  } catch (error) {
    console.log("Eurreur lors de la déconnexion", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
authController.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // Assurez-vous que l'utilisateur est authentifié et que son ID est dans req.user.userId
    console.log("ID de l'utilisateur:", userId); // Log pour vérifier l'ID utilisateur

    // Récupérer l'utilisateur avec le rôle peuplé
    const user = await User.findById(userId)
      .populate("role", "nom description") // Peupler le champ 'role' avec les champs 'nom' et 'description'
      .select("nom prenom imageprofile role"); // Sélectionner les champs 'nom', 'prenom', 'imageprofile', et 'role'

    console.log("Utilisateur trouvé:", user); // Log pour afficher l'utilisateur trouvé

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.json({
      nom: user.nom,
      prenom: user.prenom,
      imageprofile: user.imageprofile || "assets/images/default-user.jpg",
      role: user.role ? user.role.nom : null, // Si un rôle est trouvé, afficher le nom du rôle
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = authController;
