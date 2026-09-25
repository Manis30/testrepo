const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/users", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Mani",
      },
      {
        id: 2,
        name: "Developer",
      },
    ],
  });
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
module.exports = app;