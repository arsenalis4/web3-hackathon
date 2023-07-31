const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 8000;

// MongoDB 연결
mongoose.connect("mongodb://localhost:27017/web3-hackathon", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database Connection Success.');
}).catch(err => {
    console.log('Database Connection Failure.', err);
    process.exit();
});;

// JSON 파싱 미들웨어 사용
app.use(express.json());

// cors 미들웨어를 사용하여 모든 라우트에 적용하기
app.use(cors());

// 3000번 포트의 요청만 허용하기
app.use(cors({
    origin: "http://localhost:3000"
}));

// router 객체 불러오기
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

// router 객체 사용하기
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});