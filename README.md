# IOT Data API

A Smart City IoT Data API that registers sensors and ingests time-stamped readings.

## Data Model

### Sensors Table

- Stores the core info needed for each sensor.
- **Fields:**
  - `sensor_id` (PK): Unique id for each sensor
  - `type`: Type of sensor (e.g. air_quality, temperature)
  - `lat` and `lng`: Geographic coordinates of the sensor
  - `description`: description of the sensor
  - `created_at`: Timestamp when the sensor was registered. We use `toTimestamp(now())` to get the current timestamp while storing.

### Sensor Readings Table

- **Fields:**

  - `sensor_id`: Id to link the reading to a sensor (kind of FK in RDBMS)
  - `timestamp` (Clustering Key): When the reading was taken. Helps order the data (we use it for querying)
  - `value`: The numeric reading (e.g. air quality value).
  - `unit`: The unit of measurement (e.g PPM)
  - `status`: The status of the reading (e.g. ok, warning).

- **Notes --**
  - **Time-Series Data:** Using `sensor_id` as partition key and `timestamp` as clustering key supports efficient time-range queries.
  - **High Write Throughput:** Designed to handle a large number of writes from sensors.
  - **TTL Support:** Can use Cassandra’s TTL to automatically remove old data. [TODO]

---

## API Endpoints

- [Sensor Management Endpoints](./endpoints-test/sensors.http)

- [Sensor Readings Endpoints](./endpoints-test/readings.http)

---

## Tech Used

1. Apache Cassandra (v5.x)
2. Node.js & Express with DataStax Cassandra Driver
