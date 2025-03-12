// endpoints for managing sensors

import express from "express";

import { client } from "../config/cassandra.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { sensor_id, type, location, description } = req.body;
  const { lat, lng } = location;
  try {
    // Insert sensor into Cassandra with current timestamp
    const query =
      "INSERT INTO sensors (sensor_id, type, lat, lng, description, created_at) VALUES (?, ?, ?, ?, ?, toTimestamp(now()))";
    await client.execute(query, [sensor_id, type, lat, lng, description], {
      prepare: true,
    });
    return res.status(201).json({ message: "Sensor created successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create sensor." });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM sensors";
    const result = await client.execute(query);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch sensors." });
  }
});

router.get("/:sensor_id", async (req, res) => {
  const sensor_id = req.params.sensor_id;
  try {
    const query = "SELECT * FROM sensors WHERE sensor_id = ?";
    const result = await client.execute(query, [sensor_id], { prepare: true });
    if (result.rowLength === 0) {
      return res.status(404).json({ error: "Sensor not found." });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch sensor." });
  }
});

export default router;
