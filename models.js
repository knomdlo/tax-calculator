var mongoose = require('mongoose')

let SalaryDetails = mongoose.model('SalaryDetails', {
  saPercentage: Number,
  grossSalary: Number,
  grossAndSa: Number, //if no grossSalary
  year: String
})

let TaxComputations = mongoose.model('TaxComputations', {
  saAmount: Number,
  grossSalary: Number, //if gross+sa sent
  grossAndSa: Number, // if gross sent
  tax: Number,
  netIncome: Number, //gross - salary
  netAndSa: Number // Guess SA doesn't get added to tax.
})

module.exports = {
  SalaryDetails: SalaryDetails,
  TaxComputations: TaxComputations
}