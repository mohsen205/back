const Role= require('../models/Role.model');
const User=require('../models/User.model');
const {sendMail}=require('../utils/sendEmail');

const roleController={};

roleController.createRole=async(req,res)=>{
    try{
        const{nom, description}=req.body;

        const existingRole=await Role.findOne({nom});
        if(existingRole){
            return res.status(400).json({message: "Role existe déja"})
        }
        const newRole= new Role({nom, description});
        await newRole.save();
        res.status(201).json({message:"Role crée avec succes !"})
    }catch(error){
        res.status(500).json({message:"Erreur lors de creation de role"});
    }
};

roleController.assignRole =async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        if (!userId || !roleId) {
            return res.status(400).json({ message: "userId et roleId sont requis." });
        }

        // Vérifier si l'utilisateur existe ou nn
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérifier si le rôle existe
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: "Rôle non trouvé." });
        }

        user.role = roleId;
        user.isActive = true;  // Activer le compte une fois le rôle assigné
        await user.save();

        const subject='Votre rôle a été mis à jour';
        const content=`
        <p>Bonjour ${user.prenom} ${user.nom},</p>
        <p>Votre rôle a été mis à jour avec succès. Vous êtes désormais ${role.nom}. et votre compte sera activé</p>
        <p>Cordialement,<br>Centre juridique Tunisair</p>
        `
        sendMail(user.email, subject, content, true);

        res.status(200).json({
            message: "Rôle assigné avec succès et compte activé.",
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: role.nom, 
                isActive: user.isActive 
            }
        });

    } catch (error) {
        console.error("Erreur lors de l'assignation du rôle:", error);  // Pour déboguer
        res.status(500).json({ message: "Erreur lors de l'assignation." });
    }
};


module.exports=roleController;