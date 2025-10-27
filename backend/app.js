import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/Users.js";
import authRoutes from "./routes/auth.js";
import clocksRoutes from "./routes/Clocks.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;


const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-custom-header"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  console.log("Nouvelle requête :", req.method, req.url);
  next();
});


app.use(cors(corsOptions));
app.use(express.json());
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/clocks", clocksRoutes);

app.listen(PORT || 3000, '0.0.0.0', () => {
  console.log(`API running on port ${PORT || 3000}`);
});

export { app };
