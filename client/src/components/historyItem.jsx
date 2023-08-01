import React, { useState } from "react";
import { formatNumber } from "../utils/formatNumber";
import { Collapse } from "reactstrap";
import { compareByValue } from "../utils/compareByValue";

const HistoryItem = ({ history, index, userHistory }) => {
    const [isCollapse, setIsCollapse] = useState(false); // state variable to control collapse
    const [icon, setIcon] = useState("img/DownOutlined.svg"); // state variable to control icon

    console.log(isCollapse);
    const toggle = () => {
        setIsCollapse(!isCollapse); // toggle collapse
        setIcon(state => {
            return state === "img/DownOutlined.svg" ? "img/UpOutlined.svg" : "img/DownOutlined.svg"; // toggle icon
        });
    };

    return (
        <div>
            <div className="scrollItem">
                <div className="scrollField" style={{ alignItems: "center" }}>
                    <div>{history.date}</div>
                </div>
                <div className="scrollField" style={{ alignItems: "center" }}>
                    <div>NET WORTH</div>
                    <div>${history.totalValue.toFixed(2)}</div>
                </div>
                <div className="scrollField" style={{ alignItems: "center" }}>
                    <div>DAILY P&L</div>
                    <div>
                        {formatNumber(history.totalValue - userHistory[index + 1]?.totalValue || 0)}
                    </div>
                </div>
                <div className="scrollField" style={{ alignItems: "center" }}>
                    <div onClick={toggle}>view <span><img src={icon} /></span></div>
                </div>
            </div>
            <Collapse isOpen={isCollapse} className="collapse-content">
                <div className="scrollView" style={{"width": "100%"}}>
                    {Object.keys(compareByValue(history.totalTokens)).map((token) => {
                        return (
                            <div className="scrollItem" style={{"background-color": "black"}}>
                                <div className="scrollField" style={{"alignItems": "center"}}>{token}</div>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>AMOUNT</div>
                                    <div>{(history.totalTokens[token].amount).toFixed(4)}개 </div>
                                </div>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>PRICE</div>
                                    <div>${(history.totalTokens[token].price).toFixed(4)}</div>
                                </div>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>TOTAL ESTIMATED</div>
                                    <div>${(history.totalTokens[token].value).toFixed(4)}</div>
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(compareByValue(history.totalPools)).map((pool) => {
                        return (
                            <div className="scrollItem" style={{"background-color": "black"}}>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>{pool.split("/")[1]}</div>
                                    <div>{pool.split("/")[0]}</div>
                                </div>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>AMOUNT</div>
                                    <div> {(history.totalPools[pool].amount0).toFixed(4)} - {(history.totalPools[pool].amount1).toFixed(4)}</div>
                                </div>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>APY</div>
                                    <div>N/A</div>
                                </div>
                                <div className="scrollField" style={{"alignItems": "center"}}>
                                    <div>TOTAL ESTIMATED</div>
                                    <div>${(history.totalPools[pool].value).toFixed(4)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Collapse>
        </div>
    );
}

export default HistoryItem;
