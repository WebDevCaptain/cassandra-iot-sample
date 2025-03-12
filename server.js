import express from "express";
import morgan from "morgan";

import { initDb } from "./config/cassandra.js";

const app = express();

// parse JSON body
app.use(express.json());

// Logger middleware (logs requests to console)
app.use(morgan("dev"));

// A simple route for healthcheck
app.get("/", (req, res) => {
  res.send("Smart City IoT Data API is up and running !!");
});

const port = process.env.PORT || 3000;

// Initialize Cassandra db and then start node server
initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
