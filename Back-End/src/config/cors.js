import cors from "cors";

const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite frontend
    "http://localhost:3000", // React clásico (si lo usas)
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);