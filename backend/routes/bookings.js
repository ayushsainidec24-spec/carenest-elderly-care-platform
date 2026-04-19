const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { user_id } = req.query;
  const sql = user_id
    ? "SELECT * FROM bookings WHERE user_id = ? ORDER BY date, time"
    : "SELECT * FROM bookings ORDER BY date, time";
  const params = user_id ? [user_id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { user_id, caregiver_id, date, time } = req.body;
  db.run(
    "INSERT INTO bookings(user_id, caregiver_id, date, time) VALUES(?,?,?,?)",
    [user_id, caregiver_id, date, time],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, caregiver_id, date, time, status: "scheduled" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
