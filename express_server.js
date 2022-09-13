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

const { getUserByEmail } = require("./helperFunction");

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
  //res.send("Hello!");

  const username = req.session.userId;
  if (!username) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  // const username = req.cookies.userId;
  const username = req.session.userId;
  // console.log("trying to see " + username);

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

  if (email === "") {
    res.status(400).send("Email is required");
  } else if (password === "") {
    res.status(400).send("Password is required");
  } else if (!getUserByEmail(email, users)) {
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

    users[id] = user;
    console.log(users);
    req.session.userId = user.email;
  
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  // const username = req.cookies.userId;
  const username = req.session.userId;
  const templateVars = {
    username: username,
  };

  res.render("urls_login", templateVars);
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

    if (!result) {
      return res.status(401).send("wrong Username or password");
    }
    // res.cookie("userId", foundUser.id);

    req.session.userId = foundUser.email;

    res.redirect("/urls");
  }
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

app.get("/urls", (req, res) => {
  // const username = req.cookies.userId;
  const username = req.session.userId;

  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // const username = req.cookies.userId;
  const username = req.session.userId;

  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  res.render("urls_new", templateVars);
});

//post create new url
app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)

  const longUrl = req.body.longURL;

  if (longUrl === "") {
    res.status(400).send("Please enter new Url");
  } else {
    const newURL = {
      longUrl: longUrl,
    };

    const newId = Math.random().toString(36).substring(2, 8);

    console.log("newId" + newId);

    urlDatabase[newId] = req.body.longURL;

    console.log("urlDatabase" + urlDatabase);
    console.log("urlDatabase.newId" + urlDatabase[newId]);

    res.redirect("/urls");
  }
});

app.get("/urls/:shortUrl", (req, res) => {
  // const username = req.cookies.userId;
  const username = req.session.userId;

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

app.post("/logout", (req, res) => {
  // res.clearCookie("userId");
  req.session = null;
  // send the user to home
  res.redirect("/urls");
});
