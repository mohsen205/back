const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["x-auth-token"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authentification échouée : Aucun token fourni" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    jwt.verify(token, "mySecretKey123!@#", (err, decodedToken) => {
      if (err) {
        console.error(" Erreur lors de la vérification du token:", err.message);
        return res
          .status(401)
          .json({
            message: "Authentification échouée : Token invalide ou expiré",
          });
      }

      console.log("✅ Token décodé:", decodedToken);

      req.user = {
        userId: decodedToken.userId,
        role: decodedToken.role,
      };

      next();
    });
  } catch (error) {
    console.error(
      " Erreur inattendue lors de la vérification du token:",
      error.message
    );
    return res
      .status(401)
      .json({ message: "Authentification échouée : Erreur interne" });
  }
};

module.exports = authenticateToken;
