const express = require('express')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const router = express.Router()

const User = require('../../models/users')

router.get('/login', (req, res) => {
  req.flash('error_msg')
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true  
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  if (!email || !password || !confirmPassword) {
    errors.push({ message: '必填欄位未填寫!'})
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與驗證密碼不符合!' })
  }
  if (errors.length) {
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }
  User.findOne({ email })
    .then(user => {
      if (user) {
        errors.push({ message: '這個信箱已經註冊過了!'})
        return res.render('register', {
          errors,
          name,
          email,
          password,
          confirmPassword
        })
      } 
      return bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => {User.create({
          name,
          email,
          password: hash
        })})
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '您已成功登出!')
  res.redirect('/users/login')
})

module.exports = router