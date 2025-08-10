import { Mongoose } from "mongoose";
export async function connectDB() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/coder_ecommerce';
    await mongoose.connect(uri, {dbName: 'coder_ecommerce'});
    console.log('MongoDB Conectado');
}