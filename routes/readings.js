// Endpoints for managing sensor readings

import express from "express";
const router = express.Router({ mergeParams: true });

import { client } from "../config/cassandra.js";

router.post("/", async (req, res) => {
  const sensor_id = req.params.sensor_id;
  const { timestamp, value, unit, status } = req.body;
  try {
    // Insert a new sensor reading into Cassandra
    const query =
      "INSERT INTO sensor_readings (sensor_id, timestamp, value, unit, status) VALUES (?, ?, ?, ?, ?)";
    await client.execute(
      query,
      [sensor_id, new Date(timestamp), value, unit, status],
      { prepare: true }
    );
    return res
      .status(201)
      .json({ message: "Sensor reading inserted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to insert sensor reading." });
  }
});

router.get("/", async (req, res) => {
  const sensor_id = req.params.sensor_id;
  const { start, end } = req.query; // Optional query parameters for time range filtering
  let query = "SELECT * FROM sensor_readings WHERE sensor_id = ?";
  let params = [sensor_id];

  // If start and end are provided, add them as filters
  if (start && end) {
    query += " AND timestamp >= ? AND timestamp <= ?";
    params.push(new Date(start), new Date(end));
  }
  try {
    const result = await client.execute(query, params, { prepare: true });
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch sensor readings." });
  }
});

router.get("/aggregates", async (req, res) => {
  const sensor_id = req.params.sensor_id;
  const { start, end } = req.query;
  let query = "SELECT value FROM sensor_readings WHERE sensor_id = ?";
  let params = [sensor_id];

  if (start && end) {
    query += " AND timestamp >= ? AND timestamp <= ?";
    params.push(new Date(start), new Date(end));
  }
  try {
    const result = await client.execute(query, params, { prepare: true });
    const values = result.rows.map((row) => row.value);
    if (values.length === 0) {
      return res
        .status(404)
        .json({ error: "No readings found for aggregation." });
    }
    // Calculate sum, avg, min, and max
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return res.json({ average: avg, min, max, count: values.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to compute aggregates." });
  }
});

export default router;
