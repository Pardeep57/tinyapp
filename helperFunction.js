const express = require("express");


const getUserByEmail = (newVal, database) => {
  for (let user in database) {
    if (database[user].email === newVal) {
      return false;
    }
  }
  return true;
  };


  module.exports = { getUserByEmail };
