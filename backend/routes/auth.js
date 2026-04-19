const express = require("express");
const router = express.Router();
const db = require("../db");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

router.post("/register", (req,res)=>{

const {name,email,password} = req.body;

db.run(
"INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)",
[name,email,password,"elderly"],
function(err){

if(err) return res.send(err);

res.send({message:"User registered"});
});
});

router.post("/login",(req,res)=>{

const {email,password} = req.body;

db.get(
"SELECT * FROM users WHERE email=? AND password=?",
[email,password],
(err,row)=>{

if(!row) return res.send({error:"Invalid login"});

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
      const verifyResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!verifyResponse.ok) {
        return res.send({ error: "Google token verification failed." });
      }

      googleUser = await verifyResponse.json();

      if (googleUser.aud !== GOOGLE_CLIENT_ID) {
        return res.send({ error: "Google client mismatch." });
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
