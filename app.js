"use strict";
const express = require('express');
const app = express();
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

function hashPasswords(password) {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
    
  // Hash the password with the salt
  const hash = crypto.createHmac('sha256', salt)
    .update(password)
    .digest('hex');
  
  return { salt, hash };
}

// Function to verify the password
function verifyPassword(inputPassword, salt, originalHash) {
  const hash = crypto.createHmac('sha256', salt)
    .update(inputPassword)
    .digest('hex');
  return hash === originalHash;
}

app.get("/getSanrio/", async (req, res) => {
  try {
    let data = await fs.readFile('sanrio.json', 'utf-8');

    data = JSON.parse(data);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).type('text').send("Something went wrong while parsing file");
  }
});

app.get("/getSanrio/:name", async (req, res) => {
  try {
    let character = req.params['name'];
    let data = await fs.readFile('sanrio.json', 'utf-8');
    data = JSON.parse(data);
    let isValid = data[character];
    if (isValid) {
      res.status(200).json(data[character]);
    } else {
      res.status(400).type("text").send("not a valid Sanrio character");
    }
  } catch (err) {
    res.status(500).type('text').send("Something went wrong while parsing file");
  }
});

app.post("/login", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
      res.status(400).type('text').send("Missing password or username");
    }
    
    let users = await fs.readFile('account-manager.json', 'utf-8');
    users = JSON.parse(users);

    if (users[username]) {
      const { salt, hash } = users[username];
      let isValid = verifyPassword(password, salt, hash);
      
      if (isValid){
        res.status(200).type('text').send("successfully logged in");
      } else {
        res.status(400).type('text').send('incorrect password or username');
      } 
    } else {
      const { salt, hash } = hashPasswords(password);
      users[username] = {
        "username": username,
        "salt": salt,
        "hash": hash
      }

      await fs.writeFile('account-manager.json', JSON.stringify(users));
      res.status(200).type('text').send("account created successfully");
    }
  } catch (err) {
    console.log(err);
    res.status(500).type('text').send("some server side error");
  }
});

app.post("/character", async (req, res) => {
  const { username, character, level, img } = req.body;

  if (!username || !character || !img || !level) {
    return res.status(400).type('text').send("Missing body params");
  }

  try {
    let accounts = await fs.readFile('account-manager.json', "utf-8");
    accounts = JSON.parse(accounts);

    if (!accounts[username]) {
      return res.status(400).type('text').send("User not found");
    }

    const user = accounts[username];
    const characterExists = user.character;

    user.character = {
      name: character,
      level: level,
      img: img
    };

    await fs.writeFile('account-manager.json', JSON.stringify(accounts, null, 4));

    if (characterExists) {
      res.status(200).json(user.character);
    } else {
      res.status(201).json(user.character);
    }
  } catch (error) {
    res.status(500).type('text').send("Server-side error");
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);