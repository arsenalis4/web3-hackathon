const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// authSchema 정의
const authSchema = new Schema({
    email: { type: String, required: true, unique: true },
});

// Auth 모델 생성
const Auth = mongoose.model("Auth", authSchema);

module.exports = { Auth } 