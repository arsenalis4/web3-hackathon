import authAPI from "../../api/authAPI"
import { v4 as uuidv4 } from "uuid"

const getUpbitBalance = async () => {
    const access_key = "CtlxwKO2IfgcvBJKnWUfa4OqyYmYa94BezDvqzxP"
    const secret_key = "JpaAEPu6KiQEcxAdkRdaxx2gCf5kKWysFvX9Hljq"

    const payload = {
        access_key: access_key,
        nonce: uuidv4(),
    }

    const response = await authAPI.post("/get-upbit-tokens", {
        payload: payload,
        secret_key: secret_key,
    });

    const tokens = response.data.data.map((token) => {
        const { currency, balance, avg_buy_price } = token;
        return {
            balance: Number(balance),
            tokenInfo: {
                symbol: currency,
                price: {
                    rate: Number(avg_buy_price),
                },
                decimals: 0,
            }
        }
    });

    console.log(tokens);
    return tokens;
}

export { getUpbitBalance };