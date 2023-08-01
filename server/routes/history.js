const express = require("express");

// User 모델 생성
const { History } = require("../models/History");
const { formatDate } = require("../utils/formatDate");

// router 객체 생성하기
const router = express.Router();

// 지갑 주소 목록 조회 라우트 
router.post("/get-yesterday-value", async (req, res) => {
    try {
        // 요청 바디에서 이메일을 추출하기
        const { email } = req.body;

        // 어제 날짜 구하기
        const yesterday = formatDate(1);

        // 이메일로 사용자 찾기
        const history = await History.findOne({ email });

        let historyValue = history.history.map((item) => {if(item.date === yesterday) return item.totalValue});
        if (!historyValue) {
            return res.status(404).json({ message: "History not found" });
        }

        // historyValue가 undefined가 아닌 요소만 필터링하기
        yesterdayValue = historyValue.filter(item => item !== undefined)[0];

        // 사용자의 지갑 주소 목록 응답으로 보내기
        res.status(200).json(yesterdayValue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 지갑 주소 목록 조회 라우트 
router.post("/get-week-value", async (req, res) => {
    try {
        // 요청 바디에서 이메일을 추출하기
        const { email } = req.body;

        // 이메일로 사용자 찾기
        const history = await History.findOne({ email });

        // weekly Date
        let week = [];
        for(let i = 1; i < 7; i++) {
            week.push(formatDate(i));
        };

        if (!history) {
            return res.status(404).json({ message: "History not found" });
        }

        let historyData = await history.history.map((item) => {if(week.includes(item.date)) return {"date": item.date, "totalValue": item.totalValue}});
        historyData = historyData.filter(item => item !== undefined);

        // 사용자의 지갑 주소 목록 응답으로 보내기
        res.status(200).json(historyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 지갑 주소 목록 조회 라우트 
router.post("/get-all-history", async (req, res) => {
    try {
        // 요청 바디에서 이메일을 추출하기
        const { email } = req.body;

        // 이메일로 사용자 찾기
        const history = await History.findOne({ email });

        if (!history) {
            return res.status(404).json({ message: "History not found" });
        }

        // 사용자의 지갑 주소 목록 응답으로 보내기
        res.status(200).json(history.history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;