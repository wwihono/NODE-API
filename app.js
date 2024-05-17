"use strict";

/**
 * Author: Winston Wihono
 * Section: AF
 * Date: 5/16/2024
 * This is the main server file for the Sanrio character management application.
 * It handles user authentication, character retrieval, and character updates.
 * Dependencies:
 * - Express: Web framework for Node.js
 * - Crypto: Node.js module for cryptographic functionality
 * - Multer: Middleware for handling multipart/form-data (used for file uploads)
 * - FS: File system module (promises-based) for reading and writing JSON files
 */

const express = require('express');
const app = express();
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs').promises;
const good = 200;
const bad = 400;
const weird = 500;
const userPort = 8000;

app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

/**
 * Encrypts a password and returns the salt and hash.
 * @param {string} password - The password to be hashed.
 * @returns {{salt: string, hash: string}} - An object containing the salt and hashed password.
 */
function hashPasswords(password) {

  const randomSalt = 16;

  // Generate a random salt
  const salt = crypto.randomBytes(randomSalt).toString('hex');

  // Hash the password with the salt
  const hash = crypto.createHmac('sha256', salt)
    .update(password)
    .digest('hex');

  return {salt, hash};
}

/**
 * Verifies the input password by hashing it with the provided salt and comparing it to the original
 * hash.
 * @param {string} inputPassword - The password provided by the user.
 * @param {string} salt - The salt used when hashing the original password.
 * @param {string} originalHash - The original hashed password.
 * @returns {boolean} - True if the hashed password matches the original hash, false otherwise.
 */
function verifyPassword(inputPassword, salt, originalHash) {
  const hash = crypto.createHmac('sha256', salt)
    .update(inputPassword)
    .digest('hex');
  return hash === originalHash;
}

/**
 * Handles GET requests to retrieve all Sanrio characters from the sanrio.json file.
 * Responds with a JSON object containing all Sanrio characters.
 */
app.get("/getSanrio/", async (req, res) => {
  try {
    let data = await fs.readFile('sanrio.json', 'utf-8');

    data = JSON.parse(data);

    res.status(good).json(data);
  } catch (err) {

    res.status(weird).type('text').send("Something went wrong while parsing file");
  }
});

/**
 * Handles GET requests to retrieve specific Sanrio characters from the sanrio.json file.
 * Responds with a JSON object containing specific Sanrio characters.
 */
app.get("/getSanrio/:name", async (req, res) => {
  try {
    let character = req.params['name'];
    let data = await fs.readFile('sanrio.json', 'utf-8');
    data = JSON.parse(data);
    let isValid = data[character];
    if (isValid) {

      res.status(good).json(data[character]);
    } else {
      res.status(bad)
        .type("text")
        .send("not a valid Sanrio character");
    }
  } catch (err) {
    res.status(weird)
      .type('text')
      .send("Something went wrong while parsing file");
  }
});

/**
 * Handles account login and creation, saving individual account details in the account-manager
 * file.
 */
app.post("/login", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
      res.status(bad)
        .type('text')
        .send("Missing password or username");
    } else {
      let users = await fs.readFile('account-manager.json', 'utf-8');
      users = JSON.parse(users);

      if (users[username]) {
        const {salt, hash} = users[username];
        let isValid = verifyPassword(password, salt, hash);
        
        if (isValid){
          res.status(200)
            .type('text')
            .send("successfully logged in");
        } else {
          res.status(bad)
            .type('text')
            .send('incorrect password or username');
        }
      } else {
        const {salt, hash} = hashPasswords(password);
        users[username] = {
          "username": username,
          "salt": salt,
          "hash": hash,
          "character": null
        }

        await fs.writeFile('account-manager.json', JSON.stringify(users));

        res.status(good)
          .type('text')
          .send("account created successfully");
      }
  } 
  } catch (err) {
    res.status(weird)
      .type('text')
      .send("some server side error");
  }
});

/**
 * Handles setting characters for individual accounts and updating account save files.
 */
app.post("/setcharacter", async (req, res) => {
  const prettyPrint = 4;
  const { username, character, level, img } = req.body;

  if (!username || !character || !img || !level) {
    res.status(bad)
      .type('text')
      .send("Missing body params");
  }

  try {
    let accounts = await fs.readFile('account-manager.json', "utf-8");
    accounts = JSON.parse(accounts);

    if (!accounts[username]) {
      res.status(bad)
        .type('text')
        .send("User not found");
    }

    const user = accounts[username];
    user.character = {
      name: character,
      level: level,
      img: img
    };

    await fs.writeFile('account-manager.json', JSON.stringify(accounts, null, prettyPrint));

    res.status(good)
      .type('text')
      .send("account created");
  } catch (error) {
    res.status(weird)
      .type('text')
      .send("Server-side error");
  }
});

/**
 * Post request that handles getting specific account save file details containing information about
 * the character linked to the account such as level, img url, and character names.
 */
app.post("/getcharacter", async (req, res) => {
  const {username} = req.body;

  if (!username) {
    res.status(bad)
      .type('text')
      .send("Missing username");
  }

  try {
    let accounts = await fs.readFile('account-manager.json', "utf-8");
    accounts = JSON.parse(accounts);

    if (!accounts[username]) {
      res.status(bad)
        .type('text')
        .send("User not found");
    }

    const user = accounts[username];

    res.status(good).json(user.character);
  } catch (error) {

    res.status(weird)
      .type('text')
      .send("Server-side error");
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || userPort;
app.listen(PORT);