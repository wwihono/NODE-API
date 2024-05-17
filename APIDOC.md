# Sanrio Pets API Documentation
This API allows clients to get public data about all the main sanrio characters. The
API also contains password and login handling for websites that want to utilize the information into
a game. Data about sanrio characters are from sanrioWiki.com and all image urls are from giphy.

## /getSanrio
**Request Format:** /getSanrio

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns all the data in sanrio.json

**Example Request:** [GET /getSanrio/](http://localhost:8000/getSanrio)


**Example Response:**
*Fill in example response in the ticks*

```json
{
  "keroppi": {
    "name": "Keroppi",
    "japanese_name": "けろけろけろっぴ",
    "color": "green",
    "description": "Keroppi (けろけろけろっぴ, Kerokero Keroppi) is a Sanrio character who is a frog. 
    He is depicted as having large eyes and a V-shaped mouth.",
    "birthday": "July 10",
    "species": "Frog",
    "creator": "Sanrio",
    "first_appearance": "1988",
    "likes": ["swimming", "singing"],
    "dislikes": ["cold weather", "being indoors"],
    "img": "https://media0.giphy.com/media/4WDKiUenkve2ZvLoTp/200w.webp?cid=ecf05e47oynni9w862jx1418mc0z1oy98yxmnk2i4905mpic&ep=v1_gifs_related&rid=200w.webp&ct=g"
  }
  // additional characters data
}
```

**Error Handling:**
```
  "error": "Something went wrong while parsing file"
```

## /getSanrio/:name
**Request Format:** /getSanrio/:name

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Takes in a name parameter in the url and returns the data of the specified 
character

**Example Request:** GET /getSanrio/kerropi

**Example Response:**

```json
{
  "name": "Keroppi",
  "japanese_name": "けろけろけろっぴ",
  "color": "green",
  "description": "Keroppi (けろけろけろっぴ, Kerokero Keroppi) is a Sanrio character who is a frog. 
  He is depicted as having large eyes and a V-shaped mouth.",
  "birthday": "July 10",
  "species": "Frog",
  "creator": "Sanrio",
  "first_appearance": "1988",
  "likes": ["swimming", "singing"],
  "dislikes": ["cold weather", "being indoors"],
  "img": "https://media0.giphy.com/media/4WDKiUenkve2ZvLoTp/200w.webp?cid=ecf05e47oynni9w862jx1418mc0z1oy98yxmnk2i4905mpic&ep=v1_gifs_related&rid=200w.webp&ct=g"
}
```

**Error Handling:**
```
  "error": "Something went wrong while parsing file"
```


## /login
**Request Format:** /login

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** handles user login and account creation. If account does not exist, create new.

**Example Request:** 
POST /login
Content-Type: application/json

{
  "username": "user1",
  "password": "password123"
}

**Example Response:**
*Fill in example response in the {}*

```
  successfully logged in
```
```
  account created successfully
```

**Error Handling:**
```
  Missing password or username
```
```
  incorrect password or username
```
```
  some server side error
```

## /character
**Request Format:** /character

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** handles new user character selection. Returns data of the new character.

**Example Request:** 
POST /selectcharacter
Content-Type: application/json

{
  "username": "user1",
  "character": "Keroppi",
  "level": 1,
  "img": "https://media0.giphy.com/media/4WDKiUenkve2ZvLoTp/200w.webp?cid=ecf05e47oynni9w862jx1418mc0z1oy98yxmnk2i4905mpic&ep=v1_gifs_related&rid=200w.webp&ct=g"
}

**Example Response:**
*Fill in example response in the {}*

```json
{
  "name": "Keroppi",
  "level": 1,
  "img": "https://media0.giphy.com/media/4WDKiUenkve2ZvLoTp/200w.webp?cid=ecf05e47oynni9w862jx1418mc0z1oy98yxmnk2i4905mpic&ep=v1_gifs_related&rid=200w.webp&ct=g"
}
```

**Error Handling:**
```
  Missing body params
```
```
  User not found
```
```
  Server side error
```