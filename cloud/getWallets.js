const userAPI = require("./api/userAPI");

// userAPI.post 함수를 호출하는 함수
async function getWallets(email) {
    try {
        const res = await userAPI.post("/get-wallets", {
            email: email
        });
        return res.data;
    } catch (err) {
        console.error(err);
    }
}

module.exports = { getWallets };