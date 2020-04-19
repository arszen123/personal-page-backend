'use strict';
const express = require('express');
const PasswordHelper = require('../helpers/password-helper');
const router = express.Router();
let getRenderBaseOptions = null;

router.get('/login', function(req, res) {
  res.render('login', getRenderBaseOptions(req));
});

router.post('/login', async function(req, res) {
  const email = req.body.email;
  const password = PasswordHelper.hash(req.body.password);
  const user = await req.db.collection('user').findOne({
    email,
    password,
  });
  if (user) {
    req.session.user = getUserForSession(user._id, user);
    res.redirect('/');
    return;
  }
  res.render('login', {
    ...getRenderBaseOptions(req),
    errorMessage: 'Wrong username or password!',
  });
});

router.get('/register', function(req, res) {
  res.render('register', getRenderBaseOptions(req));
});

router.post('/register', async function(req, res) {
  const body = req.body;
  const isEmailExists = !!(await req.db.collection('user').findOne({
    email: body.email,
  }));
  if (isEmailExists) {
    res.render('register',
        {errorMessage: 'User with this email address already exists!'});
  }
  try {
    const data = {
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      password: PasswordHelper.hash(body.password),
    };
    let k = await req.db.collection('user').insertOne(data);
    req.session.user = getUserForSession(k.insertedId, data);
    res.redirect('/');
  } catch (e) {
    res.render('login', getRenderBaseOptions(req));
  }
});

router.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/');
});

function getUserForSession(id, user) {
  return {
    id: id,
    email: user.email,
    name: {
      first: user.first_name,
      last: user.last_name,
    },
  };
}

module.exports = function(getRenderBaseOptionsFn) {
  getRenderBaseOptions = getRenderBaseOptionsFn;
  return router;
};
