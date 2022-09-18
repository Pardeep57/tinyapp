const express = require("express");

const getUserByEmail = (newVal, database) => {
  for (let user in database) {
    if (database[user].email === newVal) {
      return false;
    }
  }
  return true;
};

// to get the currently logged in user
const loggedUser = (cookie, database) => {
  for (let ids in database) {
    if (cookie === database[ids].email) {
      console.log("helper.database[ids].email" + database[ids].email);
      return database[ids].email;
    }
  }
};

// This function return the urls list respective to the logged in user
const usersUrlOnly = (userid, database) => {
  let loggedUserid = userid;
  console.log("loggedUserid help  " + loggedUserid);
  let usersUrls = {};
  for (let keyId in database) {
    if (database[keyId].userID === loggedUserid) {
      console.log("database[keyId].email  " + database[keyId].email);
      usersUrls[keyId] = database[keyId];
      console.log("usersUrls[keyId]  " + usersUrls[keyId]);
    }
  }
  return usersUrls;
};

// to check if short url exists or not
const checkShortUrl = (URL, database) => {
  return database[URL];
};

// to check if its the right user
const checkValidUser = (userId, urlId, database) => {
  return userId === database[urlId].userID;
};

module.exports = {
  getUserByEmail,
  loggedUser,
  usersUrlOnly,
  checkShortUrl,
  checkValidUser,
};
