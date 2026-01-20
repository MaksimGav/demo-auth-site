const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// віддаємо HTML
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// тестовий API
app.post("/api/check-code", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.json({ valid: false });
  }
  res.json({ valid: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
