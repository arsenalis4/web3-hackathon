const axios = require('axios')
const { v4: uuidv4 } = require("uuid")
const sign = require('jsonwebtoken').sign

const access_key = "CtlxwKO2IfgcvBJKnWUfa4OqyYmYa94BezDvqzxP"
const secret_key = "JpaAEPu6KiQEcxAdkRdaxx2gCf5kKWysFvX9Hljq"

const payload = {
    access_key: access_key,
    nonce: uuidv4(),
}

const token = sign(payload, secret_key);

const options = {
    method: "GET",
    url: "https://api.upbit.com/v1/accounts",
    headers: { Authorization: `Bearer ${token}` },
}

const getUpbitBalance = async () => {
    const response = await axios(options.url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

getUpbitBalance().then((data) => console.log(data));