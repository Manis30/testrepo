import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const port = Number(process.env.PORT) || 5000;

try {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Failed to start API server:", error);
  process.exit(1);
}
