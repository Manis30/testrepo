import express from 'express';
import morgan from 'morgan';
import redisClient from './redisClient.js';
const app = express();
app.use(morgan(":date :method :url :status :response-time ms :user-agent"))
app.use(express.json());
app.get("/api/health", async(req, res) => {
  await redisClient.set("name", "Mani");

  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/users", async(req, res) => {
  try {
    const names=await redisClient.get("name")
    res.json({
    success: true,
    data: [
      {
        id: 1,
        namedata: names.toUpperCase(),
      }
    ],
  });
  } catch (error) {
    console.log(error.stack,'check error')
  }
     
});

app.post("/api/users", (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters",
    });
  }

  res.status(201).json({
    success: true,
    message: "User created",
    data: {
      id: Date.now(),
      name: name.trim(),
    },
  });
});
app.get("/api/check",(req,res)=>{
   return res.status(200).send("Welcome to our deployment process")
})
app.get('/check',(req,res)=>{
  try {
     throw new Error('Error coming')
  } catch (error) {
    res.status(400).send("behuhruhurhiu")
  }
    
})
export default app