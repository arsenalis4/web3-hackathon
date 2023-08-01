const express = require("express");
const { convertCurrency } = require('krw-exchange-rate-to-json');

// router 객체 생성하기
const router = express.Router();

router.get("/get-exchange-rates", async (req, res) => {
    const usd = await convertCurrency('USD');
    const averageUSD = (usd.sell + usd.buy) / 2;
    return res.status(200).json(averageUSD);
});

module.exports = router;