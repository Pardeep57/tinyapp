const express = require("express");

const getUserByEmail = (newVal, database) => {
  console.log("helperdatabase1111111 " + database);
  for (let user in database) {
    if (database[user].email === newVal) {
      return false;
    }
  }
  return true;
};

const loggedUser = (cookie, database) => {
  console.log("helpercookie " + cookie);
  console.log("helperdatabase!!! " + database);
  console.log("helperloggedUserinfoS " + loggedUser);
  for (let ids in database) {
    if (cookie === database[ids].email) {
      console.log("helper.database[ids].email" + database[ids].email);

      return database[ids].email ;
    }
  }
};


const usersUrlOnly = (userid, database) => {
  let loggedUserid = userid;
  let usersUrls = {};
  for (let keyId in database) {
    if (database[keyId].userId === loggedUserid) {
      usersUrls[keyId] = database[keyId];
    }
  }
  return usersUrls;
};

const checkShortUrl = (URL, database) => {
  return database[URL];
};

const checkValidUser = (userId, urlId, database) => {
  return userId === database[urlId].userId;
};

module.exports = { getUserByEmail ,loggedUser,usersUrlOnly, checkShortUrl ,checkValidUser};
