let express = require('express')
let bodyParser = require('body-parser')
let app = express()
let models = require('./models')
let _ = require('lodash')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


const taxRates =
  [
    {
      "incomeSlab": 1,
      "rangeString": "0 – $18,200",
      "range": [0, 18200],
      "fixed": 0,
      "unitRate": 0
    },
    {
      "incomeSlab": 2,
      "rangeString": "$18,201 – $37,000",
      "range": [18201, 37000],
      "fixed": 0,
      "unitRate": 19
    },
    {
      "incomeSlab": 3,
      "rangeString": "$37,001 – $87,000",
      "range": [37001, 87000],
      "fixed": 3572,
      "unitRate": 32.5
    },
    {
      "incomeSlab": 4,
      "rangeString": "$87,001 – $180,000",
      "range": [87001, 180000],
      "fixed": 19822,
      "unitRate": 37
    },
    {
      "incomeSlab": 5,
      "rangeString": "$180,001 and over",
      "range": [],
      "fixed": 54232,
      "unitRate": 45
    }
  ]

app.get('/test', (req, res) => {
  res.send(taxRates)
})

app.post('/calculate', (req, res) => {
  // let details = new models.SalaryDetails(req.body);
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
  models.TaxComputations.find({}, (err, computations) =>{
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
    if(err) {
      console.log(err)
    }
  })
}

module.exports = app;