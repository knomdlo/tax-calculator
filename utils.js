const taxRates = require('./taxes')
const models = require('./models')


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
    calculateTax: calculateTax
}