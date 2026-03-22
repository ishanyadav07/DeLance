import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock API for metadata, profiles, and search (Phase 4)
  // In a real app, these would query Firestore via firebase-admin
  app.get("/api/profiles/:uid", (req, res) => {
    const { uid } = req.params;
    res.json({
      uid,
      displayName: "Demo User",
      role: "freelancer",
      reputation: 95,
      bio: "Expert Solidity developer with 5 years of experience."
    });
  });

  app.get("/api/search/jobs", (req, res) => {
    const { q } = req.query;
    res.json([
      { id: "1", title: "Smart Contract Audit", budget: 5000, status: "open" },
      { id: "2", title: "DeFi Protocol Development", budget: 15000, status: "open" }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
