const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const userName = (cookie, users) => {
  for (let ids in users) {
    if (cookie === ids) {
      return users[ids].email;
    }
  }
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
  const username = req.cookies.userId;
  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.userId;
  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortUrl", (req, res) => {
  const username = req.cookies.userId;

  const shortUrl = req.params.shortUrl;
  console.log("id" + shortUrl);

  const longURL = urlDatabase[shortUrl];
  console.log("longURL" + longURL);

  let templateVars = {
    shortUrl: shortUrl,
    longURL: longURL,
    username: username,
  };
  console.log("templateVars" + templateVars);

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const urlToDelete = req.params.id;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)

  const longUrl = req.body.longURL;

  const newURL = {
    longUrl: longUrl,
  };

  const newId = Math.random().toString(36).substring(2, 8);

  console.log("newId" + newId);

  urlDatabase[newId] = req.body.longURL;

  console.log("urlDatabase" + urlDatabase);
  console.log("urlDatabase.newId" + urlDatabase[newId]);

  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const username = req.cookies.userId;
  const email = req.body.email;
  const templateVars = {
    username: username,
  };
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return res.status(403).send("Email already exists");
    }
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // console.log(req.body);

  const email = req.body.email;
  const password = req.body.password;
  const id = Math.random().toString(36).substring(2, 8);

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);


  const user = {
    id: id,
    email: email,
    password: hash
  };

  users[id] = user;
  console.log(users);

  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  const username = req.cookies.userId;
  const templateVars = {
    username: username,
  };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if email or password are falsey
  if (!email || !password) {
    return res.status(400).send("please enter an email address AND a password");
  }

  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  // did we find a user???
  if (!foundUser) {
    return res.status(403).send("no user with that email exists");
  }
  // check if passwords match

  const result = bcrypt.compareSync(password, foundUser.password);
  /*
  if (foundUser.password !== password) {
    return res.status(401).send("wrong Username or password");
  }
  */
  if (!result) {
    return res.status(401).send("wrong Username or password");
  }
  res.cookie("userId", foundUser.id);

  res.redirect("/urls");
});



app.post("/logout", (req, res) => {
  res.clearCookie("userId");

  // send the user to home
  res.redirect("/urls");
});
