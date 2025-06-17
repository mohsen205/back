const User = require("../models/User.model");
const bcrypt = require("bcrypt");

const userController = {};

userController.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("role", "nom description");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

userController.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nom, prenom, email, phone, adresse, currentPassword, newPassword } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Update basic info
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (phone) user.phone = phone;
    if (adresse) user.adresse = adresse;

    // Handle email update
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }
      user.email = email;
    }

    // Handle password update
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mot de passe actuel incorrect." });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Handle profile image if it exists in the request
    if (req.file) {
      user.imageprofile = "http://localhost:7501/uploads/" + req.file.filename;
    }

    await user.save();

    // Return user data without sensitive information
    const updatedUser = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("role", "nom description");

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

userController.getAllPorteurs = async (req, res) => {
  try {
    const porteurs = await User.find(
      { typeUtilisateur: "porteurprojet" },
      "nom prenom email _id"
    );

    if (!porteurs || porteurs.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun porteur de projet trouvé." });
    }

    res.status(200).json(porteurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des porteurs:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get all users
userController.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Accès non autorisé. Réservé aux administrateurs." });
    }

    const users = await User.find({}, "-password").populate("role");
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get user by ID
userController.getUserById = async (req, res) => {
  try {
    // Check if user is admin or if user is requesting their own info
    if (req.user.role !== "Admin" && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    const user = await User.findById(req.params.id, "-password").populate(
      "role"
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Update user by ID (admin)
userController.updateUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Accès non autorisé. Réservé aux administrateurs." });
    }

    const {
      nom,
      prenom,
      email,
      telephone,
      adresse,
      role,
      isActive,
      typeUtilisateur,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Update only provided fields
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;
    if (telephone) user.telephone = telephone;
    if (adresse) user.adresse = adresse;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (typeUtilisateur) user.typeUtilisateur = typeUtilisateur;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id, "-password").populate(
      "role"
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Create new user (admin only)
userController.createUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Accès non autorisé. Réservé aux administrateurs.",
      });
    }

    const {
      nom,
      prenom,
      email,
      password,
      telephone,
      adresse,
      role,
      typeUtilisateur,
      isActive,
    } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !password || !role || !typeUtilisateur) {
      return res.status(400).json({
        message:
          "Veuillez remplir tous les champs obligatoires (nom, prénom, email, mot de passe, rôle, type d'utilisateur).",
      });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Un utilisateur avec cet email existe déjà.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone,
      adresse,
      role,
      typeUtilisateur,
      isActive: typeof isActive === "boolean" ? isActive : true,
      imageprofile: req.file
        ? `${process.env.BASE_URL}/uploads/${req.file.filename}`
        : undefined,
    });

    await newUser.save();

    // Return user without password
    const createdUser = await User.findById(newUser._id, "-password").populate(
      "role"
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: createdUser,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la création de l'utilisateur.",
      error: error.message,
    });
  }
};

module.exports = userController;
