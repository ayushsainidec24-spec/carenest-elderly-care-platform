const express = require("express");
const router = express.Router();
const db = require("../db");

// List medication (optional ?user_id=)
router.get("/", (req, res) => {
  const { user_id } = req.query;
  const sql = user_id ? "SELECT * FROM medication WHERE user_id = ?" : "SELECT * FROM medication";
  const params = user_id ? [user_id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { user_id, name, time } = req.body;
  db.run(
    "INSERT INTO medication(user_id,name,time,taken) VALUES(?,?,?,0)",
    [user_id, name, time],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, name, time, taken: 0 });
    }
  );
});

router.put("/:id", (req, res) => {
  const { name, time, taken } = req.body;
  db.run(
    "UPDATE medication SET name = ?, time = ?, taken = ? WHERE id = ?",
    [name, time, taken, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM medication WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
