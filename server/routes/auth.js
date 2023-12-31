const express = require("express");
const axios = require("axios");
const { sign } = require("jsonwebtoken");

// User와 Auth 모델 생성
const { User } = require("../models/User");
const { Auth } = require("../models/Auth");
const { History } = require("../models/History")

// router 객체 생성하기
const router = express.Router();

// 구글로 로그인하기 라우트 추가하기
router.post("/google", async (req, res) => {
    try {
        // 요청 바디에서 이메일을 추출하기
        const { email } = req.body;

        // 이메일 유효성 검사
        if (!email || !email.includes("@")) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // 이메일 중복 검사 (Auth 모델)
        let auth = await Auth.findOne({ email });

        // 없으면 새로운 인증 생성 및 저장하기
        if (!auth) {
            auth = new Auth({
                email,
            });

            await auth.save();
        }

        // User 모델에서 email이 일치하는 문서 찾기 
        let user = await User.findOne({ email });

        // 없으면 새로운 유저 생성 및 저장하기
        if (!user) {
            user = new User({
                email,
            });

            await user.save();
        }

        // History 모델에서 email이 일치하는 문서 찾기 
        let history = await History.findOne({ email });

        // 없으면 새로운 히스토리 생성 및 저장하기
        if(!history){
            history = new History({
                email,
            });

            await history.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error); res.status(500).json({ message: "Server error" });
    }
});

router.post("/get-upbit-tokens", async (req, res) => {
    const { payload, secret_key } = req.body;
    const token = sign(payload, secret_key);
    const apiURL = "https://api.upbit.com/v1/accounts";

    const response = await axios(apiURL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = response.data;

    res.status(200).json({ data });
})

module.exports = router;