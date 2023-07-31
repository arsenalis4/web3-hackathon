const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// defaultWallets 정의
const defaultWallets = {
    "ethereum": [],
}

// userSchema 정의
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    wallets: { type: Schema.Types.Mixed, of: [String], default: () => defaultWallets }, // 키가 문자열이고 값이 배열인 객체
});

// User 모델 생성
const User = mongoose.model("User", userSchema);

module.exports = { User } 