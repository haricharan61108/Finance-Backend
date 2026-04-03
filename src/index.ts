import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/routes/auth.routes.ts";
import financeRoutes from "./modules/routes/finance.routes.ts";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts"
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Finance Backend Running 🚀");
});

app.use("/auth/login", authLimiter);
app.use("/auth", authRoutes);
app.use("/records", financeRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});