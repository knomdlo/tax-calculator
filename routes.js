const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const checkJwt = require('express-jwt')
const models = require('./models')
const utils = require('./utils')
const scheduler = require('./tax-scheduler')

require('dotenv').config()
function apiRouter() {
  const router = express.Router()

  router.use(
    //For ease, I've kept /api/addUser also in unless array
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
          return res.status(404).send('DB issue. Pls try again or report error')
        }
        else {
          return res.status(200).send('User added successfully')
        }
      })
    }
    return res.status(404).send('Invalid uname/ password format')

  })

  router.post('/computations', (req, res) => {
    const salaryDetails = req.body
    if (salaryDetails.saPercentage < 9.5) {
      return res.status(404).send('Superannuation percentage cannot be less than 9.5%')
    }
    else if (salaryDetails.grossAndSa <= 0 && salaryDetails.grossSalary <= 0) {
      return res.status(404).send('Income should be greater than 1')
    }
    else if(salaryDetails.grossAndSa > 0 && salaryDetails.grossSalary > 0) {
      return res.status(404).send('Income must be mentioned as with gross or gross+SA, not both')
    }

    let taxes = utils.comupteTaxDetails(salaryDetails)
    utils.persist(taxes)
    return res.send(taxes)
  })

  router.get('/computations', (req, res) => {
    models.TaxComputations.find({}, (err, computations) => {
      res.send(computations)
    })
  })

  router.get('/computations/:id', (req, res) => {
    const id = req.params.id
    models.TaxComputations.findOne({ "_id": id }, (err, computation) => {
      if (err) {
        console.log(error)
        return res.status(500).send(err)
      }
      if (!!computation) {
        return res.send(computation)
      }
      else return res.status(500).send('No record with the given id')
    })
  })

  router.delete('/computations', (req, res) => {
    models.TaxComputations.remove({}, (err, result) => {
      if (err) {
        console.log(err)
      }
      else return res.send('Successfully deleted the entire history')
    })
  })

  router.delete('/computations/:id', (req, res) => {
    let id = req.params.id
    models.TaxComputations.findOne({ "_id": id }, (err, computation) => {
      if (err) {
        return res.status(404).send('Erro in DB:' + err)
      }
      if (!!computation) {
        models.TaxComputations.remove(computation, (err, result) => {
          if (err) {
            return res.status(404).send('Error in DB:' + err)
          }
          else return res.send('Successfully deleted')
        })
      }
      else return res.status(404).send('The given ID is not found in DB')

    })
  })

  return router;
}

module.exports = apiRouter;