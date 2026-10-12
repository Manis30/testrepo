
import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

app.get("/health/live", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running perfectly"
  });
});
app.get("/check",(req,res)=>{
 return  res.status(200).json({success:true,message:"Ci Cd pipeline done and its working properly"})
})

app.get("/api/health", (req, res) => {

  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected"
  });
});
app.get("/api/saymyname",(req,res)=>{
    res.status(200).json({
        name:"Mani",
        message:"Welcome home, Master"
    })
})
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      default: "",
      maxlength: 5000
    }
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

app.get("/api/notes", async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

app.post("/api/notes", async (req, res, next) => {
  try {
    const { title, content = "" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "A non-empty title is required"
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        message: "Content must be a string"
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed"
    });
  }

  res.status(500).json({
    message: "Internal server error"
  });
});

export default app;
