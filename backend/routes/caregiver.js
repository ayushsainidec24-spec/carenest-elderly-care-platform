const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.all("SELECT * FROM caregivers", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { name, service, rating } = req.body;
  db.run(
    "INSERT INTO caregivers(name,service,rating) VALUES(?,?,?)",
    [name, service, rating],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, service, rating });
    }
  );
});

router.put("/:id", (req, res) => {
  const { name, service, rating } = req.body;
  db.run(
    "UPDATE caregivers SET name = ?, service = ?, rating = ? WHERE id = ?",
    [name, service, rating, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM caregivers WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
