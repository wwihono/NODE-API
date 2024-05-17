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
    sendResponse(res, weird, "server side error");
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
      sendResponse(res, bad, "not a valid Sanrio character");
    }
  } catch (err) {
    sendResponse(res, weird, "Error parsing file");
  }
});

/**
 * Handles account login and creation, saving individual account details in the account-manager
 * file.
 */
app.post("/login", async (req, res) => {
  const prettyPrint = 4;
  try {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
      sendResponse(res, bad, "Missing password or username");
    } else {
      let users = await fs.readFile('account-manager.json', 'utf-8');
      users = JSON.parse(users);

      if (users[username]) {
        const {salt, hash} = users[username];

        if (verifyPassword(password, salt, hash)) {
          sendResponse(res, good, "successfully logged in");
        } else {
          sendResponse(res, bad, "incorrect password or username");
        }
      } else {
        const {salt, hash} = hashPasswords(password);
        users[username] = {"username": username, "salt": salt, "hash": hash, "character": null};
        await fs.writeFile('account-manager.json', JSON.stringify(users, null, prettyPrint));
        sendResponse(res, good, "account created successfully");
      }
    }
  } catch (err) {
    sendResponse(res, weird, "some server side error");
  }
});

/**
 * Sends a response with the specified status code and message.
 * @param {Object} res - The Express response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - message sent.
 */
function sendResponse(res, statusCode, message) {
  res.status(statusCode)
    .type('text')
    .send(message);
}

/**
 * Handles setting characters for individual accounts and updating account save files.
 */
app.post("/setcharacter", async (req, res) => {
  const prettyPrint = 4;
  const {username, character, level, img} = req.body;

  if (!username || !character || !img || !level) {
    sendResponse(res, bad, "Missing body params");
  }

  try {
    let accounts = await fs.readFile('account-manager.json', "utf-8");
    accounts = JSON.parse(accounts);

    if (!accounts[username]) {
      sendResponse(res, bad, "User not found");
    }

    const user = accounts[username];
    user.character = {
      name: character,
      level: level,
      img: img
    };

    await fs.writeFile('account-manager.json', JSON.stringify(accounts, null, prettyPrint));

    sendResponse(res, good, "account created");
  } catch (error) {
    sendResponse(res, weird, "Some server side error");
  }
});

/**
 * Post request that handles getting specific account save file details containing information about
 * the character linked to the account such as level, img url, and character names.
 */
app.post("/getcharacter", async (req, res) => {
  const {username} = req.body;

  if (!username) {
    sendResponse(res, bad, "missing username");
  }

  try {
    let accounts = await fs.readFile('account-manager.json', "utf-8");
    accounts = JSON.parse(accounts);

    if (!accounts[username]) {
      sendResponse(res, bad, "User not found");
    }

    const user = accounts[username];

    res.status(good).json(user.character);
  } catch (error) {

    sendResponse(res, weird, "server side error");
  }
});

app.use(express.static('public'));
const PORT = process.env.PORT || userPort;
app.listen(PORT);