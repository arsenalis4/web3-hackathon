import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import historyAPI from "../api/historyAPI";
import userAPI from "../api/userAPI";
import SideBar from "../components/sideBar";
import { getUpbitBalance } from "../repos/cex/getUpbitBalance";
import { getTotalBalances } from "../repos/pool/functions/getTotalBalances";
import { formatDate } from "../utils/formatDate";

// 지갑 주소 컴포넌트
const WalletAddress = ({ network, address, onDelete }) => {
    return (
        <div className="walletBox">
            <div className="walletItem" style={{ "color": "white", "background-color": "#FFFFFF14", "width": "100%" }}>{address}</div>
            <div className="walletItem" onClick={() => onDelete(network, address)}><img src="img/Button.svg" /></div>
        </div>
    )
}

// 페이지 컴포넌트
const WalletPage = () => {
    const loc = useLocation();
    const state = loc.state;
    const email = state.email;

    const [wallets, setWallets] = useState({});
    const [totalTokens, setTotalTokens] = useState({});
    const [totalPools, setTotalPools] = useState({});
    const [totalTokenUSD, setTotalTokenUSD] = useState(0);
    const [totalPoolUSD, setTotalPoolUSD] = useState(0);
    const [totalCEXUSD, setTotalCEXUSD] = useState(0);
    const [totalDepositUSD, setTotalDepositUSD] = useState(0);

    const [yesterDayDepositUSD, setYesterdayDepositUSD] = useState(0);
    const [deltaDepositUSD, setDeltaDepositUSD] = useState(0);
    const [weekDepositUSD, setWeekDepositUSD] = useState([]);
    const [dailyRate, setDailyRate] = useState(0);

    const [tokenAllocation, setTokenAllocation] = useState({});
    const [poolAllocation, setPoolAllocation] = useState({});

    useEffect(() => {
        userAPI.post("/get-wallets", {
            email: email
        }).then(res => {
            setWallets(res.data)
        });

        historyAPI.post("/get-yesterday-value", {
            email: email
        }).then(res => {
            setYesterdayDepositUSD(res.data);
        })
    }, []);

    useEffect(() => {
        if (wallets.ethereum === undefined) return;

        const totalTokens = {};
        const totalPools = {};

        // wallets.ethereum의 각 원소에 대해 비동기 함수를 호출하고 프로미스 배열을 생성합니다.
        const promises = wallets.ethereum.map(async wallet => {
            const { ETH, tokens, pools } = await getTotalBalances(wallet);

            if (Number(ETH.balance) !== 0) {
                const ethAmount = Number(ETH.balance);
                const ethPrice = ETH.price.rate;
                const ethValue = ethAmount * ethPrice;
                if (totalTokens["ETH"] === undefined) {
                    totalTokens["ETH"] = {
                        amount: ethAmount,
                        price: ethPrice,
                        value: ethValue,
                        address: "0x0000000000000000000000000000000000000000"
                    };
                } else {
                    totalTokens["ETH"].amount += ethAmount;
                    totalTokens["ETH"].price = ethPrice;
                    totalTokens["ETH"].value += ethValue;
                }
            }

            tokens.forEach(token => {
                const symbol = token.tokenInfo.symbol;
                const amount = Number(token.balance) / Math.pow(10, Number(token.tokenInfo.decimals));
                const price = token.tokenInfo.price.rate;
                const address = token.tokenInfo.address;
                const value = amount * price;
                if (totalTokens[symbol] === undefined) {
                    totalTokens[symbol] = {
                        amount,
                        price,
                        value,
                        address
                    };
                } else {
                    totalTokens[symbol].amount += amount;
                    totalTokens[symbol].price = price;
                    totalTokens[symbol].value += value;
                }
            });

            pools.forEach(pool => {
                const { id, amount0, amount1, value } = pool;
                if (totalPools[id] === undefined) {
                    totalPools[id] = {
                        amount0,
                        amount1,
                        value
                    };
                } else {
                    totalPools[id].amount0 += amount0;
                    totalPools[id].amount1 += amount1;
                    totalPools[id].value += value;
                }
            })
        });

        // 모든 프로미스가 완료될 때까지 기다립니다.
        Promise.all(promises).then(() => {
            setTotalPools(totalPools);

            getUpbitBalance().then((tokens) => {
                let totalCEXUSD = 0;
                tokens.forEach((token) => {
                    const symbol = token.tokenInfo.symbol;
                    const amount = Number(token.balance) / Math.pow(10, Number(token.tokenInfo.decimals));
                    const price = token.tokenInfo.price.rate;
                    const value = amount * price;
                    totalCEXUSD += value;
                    if (totalTokens[symbol] === undefined) {
                        totalTokens[symbol] = {
                            amount,
                            price,
                            value,
                        };
                    } else {
                        totalTokens[symbol].amount += amount;
                        totalTokens[symbol].value += value;
                    }
                })

                setTotalCEXUSD(totalCEXUSD);
                setTotalTokens(totalTokens);
            });
        })
    }, [wallets]);

    useEffect(() => {
        if (Object.keys(totalTokens).length === 0 && Object.keys(totalPools).length === 0) return;

        if (Object.keys(totalTokens).length === 0) {
            let depositUSD = 0;
            Object.keys(totalPools).forEach((pool) => {
                depositUSD += totalPools[pool].value;
            })

            setTotalPoolUSD(depositUSD);
            setTotalDepositUSD(depositUSD);
        } else if (Object.keys(totalPools).length === 0) {
            let depositUSD = 0;
            Object.keys(totalTokens).forEach((token) => {
                depositUSD += totalTokens[token].value;
            })

            setTotalTokenUSD(depositUSD);
            setTotalDepositUSD(depositUSD);
        } else {
            let depositTokenUSD = 0;
            let depositPoolUSD = 0;
            let depositUSD = 0;
            Object.keys(totalTokens).forEach((token) => {
                depositTokenUSD += totalTokens[token].value;
                depositUSD += totalTokens[token].value;
            })
            Object.keys(totalPools).forEach((pool) => {
                depositPoolUSD += totalPools[pool].value;
                depositUSD += totalPools[pool].value;
            })

            setTotalTokenUSD(depositTokenUSD);
            setTotalPoolUSD(depositPoolUSD);
            setTotalDepositUSD(depositUSD);
        }
    }, [totalTokens, totalPools, yesterDayDepositUSD]);

    useEffect(() => {
        historyAPI.post("/get-week-value", {
            email: email
        }).then(res => {
            const todayDate = formatDate(0);
            const todayValue = {
                date: todayDate,
                totalValue: totalDepositUSD
            }

            const weekValue = res.data;
            weekValue.push(todayValue);
            setWeekDepositUSD(weekValue);
        });
    }, [totalDepositUSD])

    useEffect(() => {
        setDeltaDepositUSD(totalDepositUSD - yesterDayDepositUSD);
        setDailyRate(((totalDepositUSD - yesterDayDepositUSD) / yesterDayDepositUSD * 100).toFixed(2));
    }, [totalDepositUSD, yesterDayDepositUSD]);

    // 현재 선택된 네트워크 상태
    const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
    const [inputAddress, setInputAddress] = useState("");
    const [clickInputAddressModal, setClickInputAddressModal] = useState("none");
    const [clickCEXModal, setClickCEXModal] = useState("none");
    const [clickBinanceModal, setClickBinanceModal] = useState("none");

    // 네트워크 선택 변경 핸들러
    const handleNetworkChange = e => {
        setSelectedNetwork(e.target.value)
    }

    // 입력받은 지갑 주소 변경 핸들러
    const handleInputChange = e => {
        setInputAddress(e.target.value)
    }

    // 추가 버튼 클릭 핸들러
    const handleAddClick = () => {
        // 입력받은 지갑 주소가 유효한지 검사
        if (inputAddress.length !== 42 || !inputAddress.startsWith("0x")) {
            alert("유효한 지갑 주소를 입력해주세요.")
            return
        }
        // 이미 등록된 지갑 주소인지 검사
        if (wallets[selectedNetwork].includes(inputAddress)) {
            alert("이미 등록된 지갑 주소입니다.")
            return
        }

        // 실제로 존재하는 지갑인지 확인하는 로직 추가 필요

        // 서버에 지갑 주소 추가 요청을 보냄
        userAPI
            .post("/add-wallets", {
                email: email,
                network: selectedNetwork,
                address: inputAddress
            })
            .then(res => {
                console.log(res.data)
                // 성공적으로 추가되면 상태 업데이트
                if (res.data.success) {
                    setWallets(prev => ({
                        ...prev,
                        [selectedNetwork]: [...prev[selectedNetwork], inputAddress]
                    }))
                    setInputAddress("")
                } else {
                    alert(res.data.message)
                }
            })
    }

    // 삭제 버튼 클릭 핸들러
    const handleDeleteClick = (network, address) => {
        // 서버에 지갑 주소 삭제 요청을 보냄
        userAPI.delete("/wallets", { data: { email: email, network, address } }).then(res => {
            console.log(res.data)
            // 성공적으로 삭제되면 상태 업데이트
            if (res.data.success) {
                setWallets(prev => ({
                    ...prev,
                    [network.toLowerCase()]: prev[network.toLowerCase()].filter(
                        a => a !== address
                    )
                }))
            } else {
                alert(res.data.message)
            }
        })
    }

    return (
        <div className="page">
            <SideBar height={"150vh"} />
            <div className="dashboard">
                <div className="coreView" style={{ "height": "15vh" }}>
                    <div className="coreWorth">
                        <div className="title">NET WORTH</div>
                        <div className="netWorth">
                            <div className="netWorthText">$ {totalDepositUSD.toFixed(2)}</div>
                            <div className="dailyRate">{dailyRate}%</div>
                        </div>
                    </div>
                </div>
                <div className="connectView">
                    <div className="title">WALLET & ACCOUNT</div>
                    <div style={{ "color": "white", "font-size": "1.25rem" }} >CONNECT YOUR CRYPTO WALLET & CEX ACCOUNT</div>
                    <div className="connectBtns">
                        <div className="addBtn" style={{ "width": "15rem", "height": "5vh" }} onClick={() => { setClickInputAddressModal("flex"); setClickCEXModal("none"); setClickBinanceModal("none"); }}>ADD CRYPTO WALLET</div>
                        <div className="addBtn" style={{ "width": "15rem", "height": "5vh" }} onClick={() => { setClickInputAddressModal("none"); setClickCEXModal("flex"); setClickBinanceModal("none"); }}>ADD CEX ACCOUNT</div>
                    </div>
                </div>
                <div className="connectCEXView">
                    <div><img src="img/Upbit Image(Active).svg" /></div>
                    <div><img src="img/Binance Image (Inactive).svg" /></div>
                </div>
                <div className="walletView">
                    <div className="title" style={{ "margin-left": "7.5vw" }}>ETH WALLETS</div>
                    {wallets.ethereum?.map(address => (
                        <WalletAddress
                            key={address}
                            network="ETH"
                            address={address}
                            onDelete={() => {
                                handleDeleteClick("ethereum", address)
                            }}
                        />
                    ))}
                </div>
                <div className="walletView">
                    <div className="title" style={{ "margin-left": "7.5vw" }}>KLAYTN WALLETS</div>
                    {wallets.klaytn?.map(address => (
                        <WalletAddress
                            key={address}
                            network="ETH"
                            address={address}
                            onDelete={() => {
                                handleDeleteClick("klaytn", address)
                            }}
                        />
                    ))}
                </div>
            </div>
            <div className="addWalletModal" style={{ "display": clickInputAddressModal }}>
                <div style={{ "color": "white" }} className="addWalletModalTitle">Track your crypto wallet address</div>
                <div className="addWalletModalInput">
                    <div style={{ "color": "white", "font-size": "0.75rem", "white-space": "nowrap", "display": "flex", "align-items": "center" }}>Wallet address</div>
                    <div style={{ "width": "70%", "display": "flex" }}>
                        <div>
                            <select value={selectedNetwork} onChange={handleNetworkChange} style={{ "height": "100%" }}>
                                <option value="ethereum">ETH</option>
                            </select>
                        </div>
                        <div style={{ "width": "100%" }}>
                            <input value={inputAddress} onChange={handleInputChange} style={{ "width": "100%", "height": "100%" }} />
                        </div>
                    </div>
                </div>
                <div className="addWalletModalSelect">
                    <div className="modalBtn" style={{ "border": "1px solid white" }} onClick={() => {
                        setClickInputAddressModal("none");
                        setInputAddress("");
                    }}>Cancel</div>
                    <div className="modalBtn" style={{ "border": "1px solid #3C89E8", "background-color": "#3C89E8" }} onClick={() => {
                        handleAddClick();
                        setClickInputAddressModal("none");
                        setInputAddress("");
                    }}>OK</div>
                </div>
            </div>
            <div className="addWalletModal" style={{ "display": clickCEXModal }}>
                <div className="connectCEXView" style={{ "margin-left": "0", "justifyContent": "center" }}>
                    <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "space-between" }}>
                        <div style={{ "display": "flex" }}><img src="img/Upbit Image(Active).svg" style={{ "max-width": "10vw", "height": "10vh", "position": "relative", "left": "0.5rem" }} /></div>
                        <div className="modalBtn" style={{ "border": "1px solid #3C89E8", "background-color": "#3C89E8", "width": "6.5rem" }} onClick={() => {
                        }}>Connected</div>
                    </div>
                    <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "space-between" }}>
                        <div><img src="img/Binance Image (Inactive).svg" style={{ "max-width": "10vw", "height": "10vh" }} /></div>
                        <div className="modalBtn" style={{ "border": "1px solid #3C89E8", "background-color": "#3C89E8", "width": "6.5rem" }} onClick={() => {
                            setClickInputAddressModal("none");
                            setClickCEXModal("none");
                            setClickBinanceModal("flex");
                        }}>Connect</div>
                    </div>
                </div>
            </div>
            <div className="addWalletModal" style={{ "display": clickBinanceModal }}>
                {/*미구현*/}
                <div style={{ "color": "white" }} className="addWalletModalTitle">Track your crypto wallet address</div>
                <div className="addWalletModalInput">
                    <div style={{ "color": "white", "font-size": "0.75rem", "white-space": "nowrap", "display": "flex", "align-items": "center" }}>Access key</div>
                    <div style={{ "width": "70%", "display": "flex" }}>
                        <div style={{ "width": "100%" }}>
                            <input value={inputAddress} onChange={handleInputChange} style={{ "width": "100%", "height": "100%" }} />
                        </div>
                    </div>
                </div>
                <div className="addWalletModalInput">
                    <div style={{ "color": "white", "font-size": "0.75rem", "white-space": "nowrap", "display": "flex", "align-items": "center" }}>Secret key</div>
                    <div style={{ "width": "70%", "display": "flex" }}>
                        <div style={{ "width": "100%" }}>
                            <input value={inputAddress} onChange={handleInputChange} style={{ "width": "100%", "height": "100%" }} />
                        </div>
                    </div>
                </div>
                <div className="addWalletModalSelect">
                    <div className="modalBtn" style={{ "border": "1px solid white" }} onClick={() => {
                        setClickInputAddressModal("none");
                        setClickCEXModal("none");
                        setClickBinanceModal("none");
                        setInputAddress("");
                    }}>Cancel</div>
                    <div className="modalBtn" style={{ "border": "1px solid #3C89E8", "background-color": "#3C89E8" }} onClick={() => {
                        // handleAddClick();
                        setClickInputAddressModal("none");
                        setClickCEXModal("none");
                        setClickBinanceModal("none");
                        setInputAddress("");
                    }}>OK</div>
                </div>
            </div>
        </div>
    )
}

export default WalletPage;
