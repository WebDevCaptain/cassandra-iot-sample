// handles connection to Cassandra Db and initializes the schema

import cassandra from "cassandra-driver";

const client = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_CONTACT_POINTS || "127.0.0.1"],
  localDataCenter: process.env.CASSANDRA_LOCAL_DC || "datacenter1",
  //   keyspace: "smartcity",
});

// initialize keyspace & tables if they don't exist
const initDb = async () => {
  try {
    // Create keyspace 'smartcity' (it's similar to a database in RDBMS)
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS smartcity 
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
    `);

    // Set the keyspace for the client (needed for queries)
    client.keyspace = "smartcity";

    //  `sensors` table to store sensor info
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sensors (
        sensor_id text PRIMARY KEY,
        type text,
        lat double,
        lng double,
        description text,
        created_at timestamp
      )
    `);

    // Creating 'sensor_readings' table (for time-series data)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        sensor_id text,
        timestamp timestamp,
        value double,
        unit text,
        status text,
        PRIMARY KEY (sensor_id, timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC)
    `);

    console.log("Cassandra db initialized successfully.");
  } catch (err) {
    console.error("Error initializing db: ", err);
    throw err;
  }
};

export { client, initDb };
