const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const checkJwt = require('express-jwt')
const models = require('./models')
const utils = require('./utils')

require('dotenv').config()
function apiRouter() {
  const router = express.Router()

  router.use(
    checkJwt({ secret: process.env.JWT_SECRET }).unless({ path: ['/api/authenticate', '/api/addUser'] })
  )

  router.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send({ error: err.message });
    }
  })

  router.post('/authenticate', (req, res) => {
    const user = req.body
    models.User.findOne({ username: user.username }, (err, result) => {
      if (!result) {
        return res.status(404).json({ error: 'Invalid user!!' })
      }

      if (!bcrypt.compareSync(user.password, result.password)) {
        return res.status(401).json({ error: 'incorrect password ' });
      }

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '4h' });
      return res.send(token)
    })
  })

  router.post('/addUser', (req, res) => {
    let user = req.body
    // let pwd = user.password
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, 10) //Salts hard-coded
      let userDB = new models.User(user)
      userDB.save((err) => {
        if (err) {
          console.log(err)
          return res.status(404).send('Server issue. Pls try again or report error')
        }
        else {
          return res.status(200).send('User added successfully')
        }
      })
    }
    return res.status(500). send('Invalid uname/ password')

  })

  router.post('/calculate', (req, res) => {
    let details = req.body
    let taxes = {}
    let error = false
    if (details.saPercentage < 9.5) {
      error = true;
      res.status(500).send('Superannuation percentage cannot be less than 9.5%')
    }
    else if (details.grossAndSa <= 0 && details.grossSalary <= 0) {
      error = true
      res.status(500).send('Income should be greater than 1')
    }
    if (!error) {
      if (details.grossSalary) {
        taxes.saAmount = details.saPercentage * (details.grossSalary / 100);
        taxes.grossAndSa = details.grossSalary + taxes.saAmount
        taxes.grossSalary = details.grossSalary
      }
      else if (details.grossAndSa) {
        taxes.grossSalary = (details.grossAndSa * 100) / (100 + details.saPercentage)
        taxes.saAmount = details.grossAndSa - taxes.grossSalary
        taxes.grossAndSa = details.grossAndSa
      }

      taxes.tax = utils.calculateTax(taxes.grossSalary)
      taxes.netIncome = taxes.grossSalary - taxes.tax
      taxes.netAndSa = taxes.netIncome + taxes.saAmount
      res.send(taxes)
      taxes.saPercentage = details.saPercentage
      taxes.computationYear = details.year
      utils.persist(taxes)
    }
  })

  router.get('/computations', (req, res) => {
    models.TaxComputations.find({}, (err, computations) => {
      res.send(computations)
    })
  })

  router.get('/test', (req, res) => {
  res.send('Voila rewiring works')
})

  return router;
}

module.exports = apiRouter;