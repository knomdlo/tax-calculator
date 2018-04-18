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

  module.exports = taxRates