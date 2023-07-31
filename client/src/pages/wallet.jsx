import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import userAPI from "../api/userAPI"
import SideBar from "../components/sideBar"

// 지갑 주소 컴포넌트
const WalletAddress = ({ network, address, onDelete }) => {
    return (
        <div>
            {address} <button onClick={() => onDelete(network, address)}>-</button>
        </div>
    )
}

// 페이지 컴포넌트
const WalletPage = () => {
    const loc = useLocation();
    const state = loc.state;
    const email = state.email;

    // 현재 선택된 네트워크 상태
    const [selectedNetwork, setSelectedNetwork] = useState("ethereum")
    // 입력받은 지갑 주소 상태
    const [inputAddress, setInputAddress] = useState("")
    // 사용자의 지갑 주소 목록 상태
    const [wallets, setWallets] = useState({
        ethereum: [],
    })

    // 페이지가 마운트될 때 사용자의 지갑 주소 목록을 서버로부터 받아옴
    useEffect(() => {
        userAPI.post("/get-wallets", {
            email: email
        }).then(res => {
            setWallets(res.data)
        })
    }, [])

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
        <div>
            <SideBar />
            <select value={selectedNetwork} onChange={handleNetworkChange}>
                <option value="ethereum">ETH</option>
            </select>
            <input value={inputAddress} onChange={handleInputChange} />
            <button onClick={handleAddClick}>+</button>
            <div>
                ETH
                {wallets.ethereum.map(address => (
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
        </div>
    )
}

export default WalletPage;
