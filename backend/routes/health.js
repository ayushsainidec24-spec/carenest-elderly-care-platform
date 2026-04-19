const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { user_id } = req.query;
  const sql = user_id ? "SELECT * FROM health WHERE user_id = ?" : "SELECT * FROM health";
  const params = user_id ? [user_id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { user_id, heart_rate, bp, glucose } = req.body;
  db.run(
    "INSERT INTO health(user_id,heart_rate,bp,glucose) VALUES(?,?,?,?)",
    [user_id, heart_rate, bp, glucose],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, heart_rate, bp, glucose });
    }
  );
});

module.exports = router;
