const taxRates = require('./taxes')
const models = require('./models')

function comupteTaxDetails(details) {
  let computations = {}
  if (details.grossSalary) {
    computations.saAmount = details.saPercentage * (details.grossSalary / 100);
    computations.grossAndSa = details.grossSalary + computations.saAmount
    computations.grossSalary = details.grossSalary
  }
  else if (details.grossAndSa) {
    computations.grossSalary = (details.grossAndSa * 100) / (100 + details.saPercentage)
    computations.saAmount = details.grossAndSa - computations.grossSalary
    computations.grossAndSa = details.grossAndSa
  }

  computations.tax = calculateTax(computations.grossSalary)
  computations.netIncome = computations.grossSalary - computations.tax
  computations.netAndSa = computations.netIncome + computations.saAmount
  // res.send(computations)
  computations.saPercentage = details.saPercentage
  computations.computationYear = details.year
  // utils.persist(taxes)
  return computations
}

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

module.exports = {
  persist: persist,
  calculateTax: calculateTax,
  comupteTaxDetails: comupteTaxDetails
}