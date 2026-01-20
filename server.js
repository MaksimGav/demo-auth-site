const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server works");
});

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
