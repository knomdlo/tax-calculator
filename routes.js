let express = require('express')
let bodyParser = require('body-parser')
let app = express()
let models = require('./models')
let _ = require('lodash')
let taxRates = require('./taxes')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/test', (req, res) => {
  res.send(taxRates)
})

app.post('/authenticate', (req, res) => {
  const user = req.body
  models.User.findOne({ username: user.username }, (err, result) => {
    if (!result) {
      return res.status(404).json({ error: 'Invalid user!!' })
    }

    if (!bcrypt.compareSync(user.password, result.password)) {
          return res.status(401).json({ error: 'incorrect password '});
        }
    
    const token = jwt.sign(user, 'asecretfortaxapp', { expiresIn: '4h' });
    return res.send(token)
  })
})

app.post('/addUser', (req, res) => {
  let user = req.body
  // let pwd = user.password
  if (user.password) {
    user.password = bcrypt.hashSync(user.password, 10) //Salts hard-coded
    let userDB = new models.User(user)
    userDB.save((err) => {
      if (err) {
        console.log(err)
        res.status(404).send('Server issue. Pls try again or report error')
      }
      else {
        res.status(200).send('User added successfully')
      }
    })
  }

})

app.post('/calculate', (req, res) => {
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

    taxes.tax = calculateTax(taxes.grossSalary)
    taxes.netIncome = taxes.grossSalary - taxes.tax
    taxes.netAndSa = taxes.netIncome + taxes.saAmount
    res.send(taxes)
    taxes.saPercentage = details.saPercentage
    taxes.computationYear = details.year
    persist(taxes)
  }
})

app.get('/computations', (req, res) => {
  models.TaxComputations.find({}, (err, computations) => {
    res.send(computations)
  })
})

function calculateTax(grossSalary) {
  let taxRate
  for (let i = 0; i < taxRates.length; i++) {
    let rate = taxRates[i]
    if (!rate.range[1]) {
      taxRate = rate
      break
    }
    else if (grossSalary > rate.range[0] && grossSalary <= rate.range[1]) {
      taxRate = rate
      break
    }
  }

  let tax = taxRate.fixed + (taxRate.unitRate / 100) * grossSalary

  return tax
}

function persist(taxes) {
  let taxData = new models.TaxComputations(taxes)

  taxData.save((err) => {
    if (err) {
      console.log(err)
    }
  })
}

module.exports = app;