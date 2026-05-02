const express = require("express");
const router = express.Router();
const db = require("../db");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

router.post("/register", (req,res)=>{

const name = String(req.body.name || "").trim();
const email = String(req.body.email || "").trim().toLowerCase();
const password = String(req.body.password || "").trim();

if (!name || !email || !password) {
  return res.status(400).send({ error: "Name, email, and password are required." });
}

db.get(
  "SELECT id FROM users WHERE LOWER(TRIM(email)) = ?",
  [email],
  (existingErr, existingUser) => {
    if (existingErr) {
      return res.status(500).send({ error: "Registration failed. Please try again." });
    }

    if (existingUser) {
      return res.status(409).send({ error: "This email is already registered. Please log in." });
    }

    db.run(
    "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
    [name,email,password,"elderly"],
    function(err){
      if (err) {
        return res.send({
          error:
            err.message || "Registration failed. Please check your details and try again.",
        });
      }

      db.get(
        "SELECT * FROM users WHERE id = ?",
        [this.lastID],
        (fetchErr, createdUser) => {
          if (fetchErr || !createdUser) {
            return res.send({ error: "Registration completed but user could not be loaded." });
          }

          res.send({ message: "User registered", user: createdUser });
        }
      );
    });
  }
);
});

router.post("/login",(req,res)=>{

const email = String(req.body.email || "").trim().toLowerCase();
const password = String(req.body.password || "").trim();

if (!email || !password) {
  return res.status(400).send({ error: "Email and password are required." });
}

db.get(
"SELECT * FROM users WHERE LOWER(TRIM(email)) = ?",
[email],
(err,row)=>{
  if (err) {
    return res.send({ error: "Login failed. Please try again." });
  }

  if (!row) {
    return res.status(404).send({
      error: "No account found with this email. Please sign up first, then log in.",
    });
  }

  if (String(row.password || "").trim() !== password) {
    return res.status(401).send({ error: "Incorrect password. Please try again." });
  }

  res.send(row);
});
});

router.post("/google", async (req, res) => {
  const { credential, googleProfile } = req.body;

  if (!GOOGLE_CLIENT_ID) {
    return res.send({ error: "Google login is not configured on the server yet." });
  }

  if (!credential && !googleProfile) {
    return res.send({ error: "Google account details missing." });
  }

  try {
    let googleUser = googleProfile;

    if (!googleUser && credential) {
      let verifyResponse;

      try {
        verifyResponse = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
      } catch (error) {
        return res.status(502).send({
          error:
            "The server could not reach Google to verify this login. Check your internet connection and try again.",
        });
      }

      if (!verifyResponse.ok) {
        return res.status(401).send({ error: "Google token verification failed." });
      }

      googleUser = await verifyResponse.json();

      if (googleUser.aud !== GOOGLE_CLIENT_ID) {
        return res.status(401).send({ error: "Google client mismatch." });
      }
    }

    if (!googleUser?.email) {
      return res.send({ error: "Google account email not available." });
    }

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [googleUser.email],
      (selectErr, existingUser) => {
        if (selectErr) return res.send({ error: "Database lookup failed." });

        if (existingUser) {
          return res.send(existingUser);
        }

        db.run(
          "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
          [googleUser.name || "Google User", googleUser.email, "", "elderly"],
          function (insertErr) {
            if (insertErr) return res.send({ error: "Failed to create Google user." });

            db.get(
              "SELECT * FROM users WHERE id = ?",
              [this.lastID],
              (fetchErr, createdUser) => {
                if (fetchErr || !createdUser) {
                  return res.send({ error: "Google user created but could not be loaded." });
                }

                res.send(createdUser);
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.send({ error: "Google sign-in failed on the server." });
  }
});

module.exports = router;
