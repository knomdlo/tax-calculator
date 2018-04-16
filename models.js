var mongoose = require('mongoose')


let TaxComputations = mongoose.model('TaxComputations', {
  saAmount: Number,
  grossSalary: Number, //if gross+sa sent
  grossAndSa: Number, // if gross sent
  tax: Number,
  netIncome: Number, //gross - salary
  netAndSa: Number, // Guess SA doesn't get added to tax.
  saPercentage: Number,
  computationYear: Number
})

module.exports = {
  TaxComputations: TaxComputations
}