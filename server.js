import dotenv from 'dotenv'
import app from './app.js';
import mongoose from 'mongoose'
dotenv.config();
let name="Siva s"
const PORT = process.env.PORT || 5000;
let a=30;
let b=60; 
let cherry='something'
cherry="nothing to work"
mongoose.connect('mongodb://localhost:27017/myapp').then((data)=>console.log("DB is connected")).catch((err)=>console.log(err));
app.listen(PORT, () => {
  console.log(`Server running on port  ${PORT}`);
});
