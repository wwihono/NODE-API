"use strict";
(function() {
  
  let currentUser = null;
  let currName, currLevel, currImg;
  window.addEventListener('load', init);

  function init() {
    qs(".content").addEventListener("mouseover", revealInfo);
    qs(".content").addEventListener("mouseout", hideInfo);
    qs("form").addEventListener("submit", async (event) => {
      event.preventDefault();

      const loginSuccess = await login();
      if (loginSuccess) {
        if(!(await checkExistingCharacter())) {
          await openSelectionWindow();
        } else {
          displayGameScreen();
        }
      }
    });
  }

  async function checkExistingCharacter() {
    let form = new FormData();
    form.append("username", currentUser);
    
    try {
      let saveFile = await fetch("/getcharacter", {method: 'POST', body: form});
      await statusCheck(saveFile);
      let data = await saveFile.json();
      console.log(data);
      if (data != null) {
        currName = data.name;
        currLevel = data.level;
        currImg = data.img;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  async function openSelectionWindow() {
    const container = id("sanrio-container");
    qs("form").classList.add("hidden");
    qs("#home-btn").textContent = "logout";
    
    fetch("/getSanrio")
      .then(statusCheck)
      .then(data => data.json())
      .then(populateWindow)
      .catch(err => handleError(err));
  }

  function displayGameScreen() {
    const sanrioContainer = qs("#sanrio-container");
    const characterContainer = qs("#character-container");

    // hide form
    qs("form").classList.add("hidden");

    // Change text to Logout
    qs("#home-btn").textContent = "Logout";
    qs("#home-btn").addEventListener('click', () => {
      qs("#home-btn").textContent = "Login";
    });
  
    // Add 'hidden' class to all elements within #sanrio-container
    sanrioContainer.querySelectorAll("*").forEach(element => {
      element.classList.add("hidden");
    });
  
    // Remove 'hidden' class from #character-container
    characterContainer.classList.remove("hidden");

    // Create character screen modules
    let img = gen("img");
    let desc = gen("p")
    img.src = currImg;
    img.alt = currName;
    img.classList.add("sanrio");
    desc.classList.add('description');
    desc.innerHTML = `Name: ${currName} <br>
    Level: ${currLevel}`;
    characterContainer.appendChild(img);
    characterContainer.appendChild(desc);
  }

  function populateWindow(res) {
    id("sanrio-container").innerHtml ='';
    Object.keys(res).forEach(character => {
      let container = gen("div");
      let img = gen("img");
      let parag = gen("p");
      img.src = res[character].img;
      img.alt = res[character].name;
      img.classList.add("sanrio");
      img.addEventListener("click", selectCharacter);
      parag.textContent = res[character].name;
      parag.classList.add("sanrio-text");
      container.classList.add("sanrio");
      container.appendChild(img);
      container.appendChild(parag);
      id("sanrio-container").appendChild(container);
    })
  }

  async function selectCharacter() {
    let form = new FormData();
    form.append("username", currentUser);
    form.append("character", this.alt);
    form.append("level", 1);
    form.append("img", this.src);
    currName = this.alt;
    currLevel = 1;
    currImg = this.src;

    try {
      let file = await fetch("/setcharacter", {method: "POST", body: form});
      await statusCheck(file);
      displayGameScreen();
    } catch (error) {
      handleError(error);
    }
  }

  async function login(event) {
    const data = {
      username: id("username").value,
      password: id("pwd").value
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      let res = await statusCheck(response);

      if (res.status == 200) {
        currentUser = data.username;
        return true;
      } else {
        qs("form").reset();
      }
    } catch (error) {
      handleError(error);
      qs("form").reset();
    }
    return false;
  }

  function handleError(error) {
    console.error('Error:', error);
  }

  function hideInfo() {
    const span = qs(".content span");
    span.classList.remove("info");
    span.classList.add("material-symbols-outlined");
    span.textContent = "help";
  }

  function revealInfo() {
    const span = qs(".content span");
    span.classList.remove("material-symbols-outlined");
    span.classList.add("info");
    span.innerHTML = "Raise your own pet Sanrio. Feed and Play with it to keep" +
    " your pet happy";
  }

  /**
   * Checks the response status of a fetch request. If the response is not 'ok', it throws an
   * error with the response text. Otherwise, it returns the unchanged response. This function is
   * typically used to validate responses in the context of asynchronous operations that involve
   * fetch requests.
   * @param {Response} res - The response object from a fetch request.
   * @returns {Promise<Response>} A promise that resolves with the original response if it is 'ok',
   * otherwise throws an error.
   * @async
   * @throws {Error} Throws an error if the response is not 'ok'.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Getter function for element with specific id
   * @param {string} id - HTML id selector
   * @returns {Element} - element associated with the selector
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Gets the first instance of the element selected
   * @param {string} selector - HTML query selector
   * @returns {Element} - element associated with the selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Gets the first instance of the element selected
   * @param {string} selector - HTML query selector
   * @returns {Element} - element associated with the selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Tag generator for new DOM nodes
   * @param {string} tagName - element tag type
   * @returns {Element} - a new DOM element with the specified tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
}());