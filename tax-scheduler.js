const taxes = require('./taxes')
const scheduler = require('cron')
const CronJob = require('cron').CronJob
const _ = require('lodash')

let index = 0

function startScheduler() {
    new CronJob('*/30 * * * * *', () => {
        console.log(new Date())
        index = _.random(0,2)
    }, null, true, 'Australia/Sydney');
}

function getTaxRates(year) {
    return taxes[index][year]
}

module.exports = 
{ 
    startScheduler : startScheduler,
    getTaxRates : getTaxRates
}
/* let taxRates = function () {
    let currentTax = taxes[0]

    function getTax(year) {
        return currentTax[year]
    }

    function updateTaxes(index) {
        currentTax = taxes[index]
    }
    return {
        getTax: getTax
    }
} */