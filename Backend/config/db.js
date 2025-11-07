import mongoose from "mongoose";
//export:permet de partager une fonction, une variable ou un objet d’un fichier pour l’utiliser dans un autre fichier.
/*async-await est une façon plus simple d’écrire du code avec des promesses.
Au lieu de faire plein de .then() et .catch(), on peut écrire le code comme s’il était synchrone, mais il reste asynchrone.*/
export const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);//essaie de se connecter à MongoDB.
        console.log(`MongoDB connected: ${conn.connection.host}`);

    }catch (error){
        console.error(`Error: ${error.message}`);
        process.exit(1);//arrête le programme

    }
};