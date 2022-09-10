const express = require("express");
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: "http://www.lighthouselabs.ca",
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" };
  // res.render("urls_show", templateVars);
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const urlToDelete = req.params.id;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

const generateRandomString = () => {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = lowerCase.toUpperCase();
  const numeric = "1234567890";
  const alphaNumeric = lowerCase + upperCase + numeric;
  //alphaNumeric is 62
  let index = Math.round(Math.random() * 100);
  if (index > 61) {
    while (index > 61) {
      index = Math.round(Math.random() * 100);
    }
  }
  return alphaNumeric[index];
};

const randomString = () => {
  let randomString = "";
  while (randomString.length < 6) {
    randomString += generateRandomString();
  }
  return randomString;
};
