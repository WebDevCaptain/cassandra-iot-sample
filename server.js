const express = require("express");
const morgan = require("morgan");

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
