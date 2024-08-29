require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

function handleDisconnect() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      setTimeout(handleDisconnect, 2000); // Reconnect after 2 seconds if there's an error
    } else {
      console.log("Connected to MySQL!");
    }
  });

  connection.on("error", (err) => {
    console.error("MySQL error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect(); // Reconnect on connection loss
    } else {
      throw err;
    }
  });

  return connection;
}

const connection = handleDisconnect();

// MySQL Configuration
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL:", err);
//   } else {
//     console.log("Connected to MySQL!");
//   }
// });

const pool = mysql.createPool({
  connectionLimit: 10, // Adjust based on your application's needs
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Route to add item
app.post("/add", (req, res) => {
  const { item } = req.body;

  if (!item) {
    return res.status(400).json({ error: "Item is required" });
  }

  const sql = "INSERT INTO employee (item) VALUES (?)";

  connection.query(sql, [item], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "Item added successfully!" });
  });
});

// Route to get items
app.get("/items", (req, res) => {
  const sql = "SELECT * FROM employee";

  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(results);
  });
});

// Route to delete item
app.delete("/delete/:id", (req, res) => {
  const itemId = req.params.id;

  const sql = "DELETE FROM employee WHERE id = ?";

  connection.query(sql, [itemId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ message: "Item deleted successfully!" });
  });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
