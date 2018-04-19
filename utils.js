// const taxRates = require('./taxes')
const models = require('./models')
const scheduler = require('./tax-scheduler')
const _ = require('lodash')

function comupteTaxDetails(details) {
  let computations = {}
  if (details.grossSalary) {
    _.round(details.grossSalary + computations.saAmount, 2)
    computations.saAmount = _.round(details.saPercentage * (details.grossSalary / 100), 2)
    computations.grossAndSa = _.round(details.grossSalary + computations.saAmount, 2)
    computations.grossSalary = _.round(details.grossSalary, 2)
  }
  else if (details.grossAndSa) {
    computations.grossSalary = _.round((details.grossAndSa * 100) / (100 + details.saPercentage), 2)
    computations.saAmount = _.round(details.grossAndSa - computations.grossSalary, 2)
    computations.grossAndSa = _.round(details.grossAndSa, 2)
  }

  computations.tax = calculateTax(computations.grossSalary, details.year)
  computations.netIncome = computations.grossSalary - computations.tax
  computations.netAndSa = computations.netIncome + computations.saAmount
  computations.saPercentage = details.saPercentage
  computations.computationYear = details.year
  return computations
}

function calculateTax(grossSalary, year) {
  let taxRates = scheduler.getTaxRates(year)
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

  return _.round(tax, 2)
}

function persist(taxes) {
  let taxData = new models.TaxComputations(taxes)
  taxData.save((err) => {
    if (err) {
      console.log(err)
    }
  })
}

module.exports = {
  persist: persist,
  calculateTax: calculateTax,
  comupteTaxDetails: comupteTaxDetails
}