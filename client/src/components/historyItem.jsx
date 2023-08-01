import React, { useState } from "react";
import { formatNumber } from "../utils/formatNumber";
// import { Collapse } from "reactstrap";

const HistoryItem = ({ history, index, userHistory }) => {
  const [isCollapse, setIsCollapse] = useState(false); // state variable to control collapse
  const [icon, setIcon] = useState("v"); // state variable to control icon

  const toggle = () => {
    setIsCollapse(!isCollapse); // toggle collapse
    setIcon(state => {
      return state === "v" ? "^" : "v"; // toggle icon
    });
  };

  return (
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
        <div onClick={toggle}>view <span>{icon}</span></div>
      </div>
      {/* <Collapse isOpen={isCollapse}>
         <div>{history.totalValue.toFixed(2)}</div>
      </Collapse> */}
    </div>
  );
}

export default HistoryItem;