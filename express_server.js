const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan("dev"));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["userId"],
  })
);

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

const {
  getUserByEmail,
  loggedUser,
  checkShortUrl,
  checkValidUser,
  usersUrlOnly,
} = require("./helperFunction");

const urlDatabase = {
  //   b2xVn2: "http://www.lighthouselabs.ca",
  //   "9sm5xK": "http://www.google.com",
};

const usersdb = {
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

app.get("/", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  if (!username) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.use(express.urlencoded({ extended: true }));
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  if (username) {
    res.redirect("/urls");
  } else {
    const email = req.body.email;
    const templateVars = {
      username: username,
    };
    for (const userId in usersdb) {
      const user = usersdb[userId];
      if (user.email === email) {
        return res.status(403).send("Email already exists");
      }
    }
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "") {
    res.status(400).send("Email is required");
  } else if (password === "") {
    res.status(400).send("Password is required");
  } else if (!getUserByEmail(email, usersdb)) {
    res.status(400).send("This email is already registered");
  } else {
    const id = Math.random().toString(36).substring(2, 8);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = {
      id: id,
      email: email,
      password: hash,
    };
    usersdb[id] = user;
    console.log(usersdb);
    req.session.userId = usersdb[id].email;

    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  if (username) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      username: username,
    };

    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "") {
    res.status(400).send("Email is required");
  } else if (password === "") {
    res.status(400).send("Password is required");
  } else {
    let foundUser = null;
    for (const userId in usersdb) {
      const user = usersdb[userId];
      if (user.email === email) {
        foundUser = user;
      }
    }
    if (!foundUser) {
      return res.status(403).send("no user with that email exists");
    }
    // check if passwords match

    const result = bcrypt.compareSync(password, foundUser.password);

    if (!result) {
      return res.status(401).send("wrong Username or password");
    }
    // res.cookie("userId", foundUser.id);

    req.session.userId = foundUser.email;

    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  if (!username) {
    res.render("urls_errors");
  } else {
    const usersUrlsOnly = usersUrlOnly(username, urlDatabase);
    const templateVars = {
      urls: usersUrlsOnly,
      username: username,
    };
    res.render("urls_index", templateVars);
  }
});

//post create new url
app.post("/urls", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  if (!username) {
    res.render("/login");
  } else {
    const shortURL = Math.random().toString(36).substring(2, 8);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: username };
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  const id = req.params.shortURL;
  if (!checkValidUser(username, id, urlDatabase)) {
    res.send("This id does not belong to you");
  } else {
    const urlToDelete = req.params.shortURL;
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  const shortURL = req.params.shortURL;

  if (!checkValidUser(username, shortURL, urlDatabase)) {
    res.send("This id does not belong to you");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  console.log("expuser " + usersdb);
  console.log("req.session.userId " + req.session.userId);

  if (!username) {
    console.log("!user " + username);

    res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlDatabase,
      username: username,
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const username = loggedUser(req.session.userId, usersdb);
  const shortURL = req.params.shortURL;
  if (checkShortUrl(shortURL, urlDatabase)) {
    if (username !== urlDatabase[shortURL].userID) {
      res.send("This id does not belong to you");
    } else {
      const longURL = urlDatabase[shortURL].longURL;
      let templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        username: username,
      };
      res.render("urls_show", templateVars);
    }
  } else {
    res.send("Url do not exist");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (checkShortUrl(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("Do not exist");
  }
});

// to check if github works
app.post("/logout", (req, res) => {
  // res.clearCookie("userId");
  req.session = null;
  // send the user to home
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
