const express = require("express");
const cors = require("cors");
const path = require("path"); // <-- Ajouté ici

const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const projetRoutes = require("./routes/projetRoutes");
const contratRoutes = require("./routes/contratRoutes");
const userRoutes = require("./routes/userRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());

// Permet à Express de comprendre les requêtes JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sert les fichiers uploadés
app.use("/api/uploads", express.static("uploads"));
app.use("/api/pdfs", express.static("pdfs"));
//
app.use("/api/auth", authRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/projet", projetRoutes);
app.use("/api/contrat", contratRoutes);
app.use("/api/user", userRoutes);
app.use("/api/investissement", investmentRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
