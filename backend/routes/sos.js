const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { user_id } = req.query;
  const sql = user_id ? "SELECT * FROM sos WHERE user_id = ? ORDER BY created_at DESC" : "SELECT * FROM sos ORDER BY created_at DESC";
  const params = user_id ? [user_id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { user_id, message } = req.body;
  db.run(
    "INSERT INTO sos(user_id,message) VALUES(?,?)",
    [user_id, message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, message, created_at: new Date().toISOString() });
    }
  );
});

module.exports = router;