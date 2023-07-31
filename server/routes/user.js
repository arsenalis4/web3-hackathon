const express = require("express");

// User 모델 생성
const { User } = require("../models/User");

// router 객체 생성하기
const router = express.Router();

// 지갑 주소 목록 조회 라우트 
router.post("/get-wallets", async (req, res) => {
    try {
        // 요청 바디에서 이메일을 추출하기
        const { email } = req.body;

        // 이메일로 사용자 찾기
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 사용자의 지갑 주소 목록 응답으로 보내기
        res.status(200).json(user.wallets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 지갑 주소 추가 라우트 
router.post("/add-wallets", async (req, res) => {
    try {
        // 요청 바디에서 네트워크와 주소 추출 
        const { email, network, address } = req.body;

        // 이메일로 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 네트워크에 따라 지갑 주소 목록에 추가하기
        if (network === "ethereum") {
            user.wallets.ethereum.push(address);
        } else {
            return res.status(400).json({ message: "Invalid network" });
        }

        // wallets 필드에 변화가 있음을 표시하기
        user.markModified("wallets");

        // 사용자 저장하기
        await user.save();

        // 성공 응답 보내기
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// 지갑 주소 삭제 라우트 
router.delete("/wallets", async (req, res) => {
    try {
        // 요청 바디에서 네트워크와 주소 추출 
        const { email, network, address } = req.body;

        // 이메일로 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 네트워크에 따라 지갑 주소 목록에서 삭제하기
        if (network === "ethereum") {
            user.wallets.ethereum = user.wallets.ethereum.filter(
                (a) => a !== address
            );
        } else {
            return res.status(400).json({ message: "Invalid network" });
        }

        // wallets 필드에 변화가 있음을 표시하기
        user.markModified("wallets");

        // 사용자 저장하기
        await user.save();

        // 성공 응답 보내기
        res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;