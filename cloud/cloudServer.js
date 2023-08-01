const schedule = require("node-schedule");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const { History } = require("./models/History");
const { getWallets } = require("./getWallets");
const { calculateBalances } = require("./calculateBalances");
const { calculateTotalUSD } = require("./calculateTotalUSD");
const { formatDate } = require("./formatDate");

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

// 매일 밤 11시 59분에 실행할 작업을 정의합니다.
const job = schedule.scheduleJob("59 23 * * *", async () => {
    // email 변수는 적절한 값으로 설정해야 합니다.
    const users = await User.find();
    const date = formatDate(0);

    users.forEach(async (user) => {
        const email = user.email;
        const userHistory = await History.findOne({ email });

        // getWallets 함수를 호출하여 wallets 값을 얻습니다.
        const wallets = await getWallets(email);

        // calculateBalances 함수를 호출하여 totalTokens과 totalPools 값을 얻습니다.
        const { totalTokens, totalPools } = await calculateBalances(wallets);

        // 결과를 콘솔에 출력합니다.
        console.log(totalTokens);
        console.log(totalPools);

        // userHistory에 totalTokens과 totalPools을 저장합니다.
        userHistory.history.push(
            {"date": date, "totalTokens": totalTokens, "totalPools": totalPools, "totalValue": calculateTotalUSD(totalTokens, totalPools)}
        )

        userHistory.markModified("history");

        await userHistory.save();
    });
});