import { Slider } from "antd";
import { useState, useEffect } from "react";
import Parenthesis from "./comp/parenthesis.js";
import { getParam } from "./utils";
import "./styles.css";
import "antd/dist/antd.css";

export default function App() {
  const [value, set_value] = useState(0);
  const [marks, set_marks] = useState({});
  const [step, set_step] = useState(null);
  const [parenthesisArr, set_parenthesisArr] = useState([]);

  useEffect(() => {
    let param = getParam();

    set_marks(param.marks);
    set_step(param.step);
    set_value(param.sliderValue);
    set_parenthesisArr(param.parenthesisArr);
  }, []);

  return (
    <div className="App">
      <Slider
        marks={marks}
        step={step}
        value={value}
        disabled
        tooltipVisible={false}
      />

      {parenthesisArr.map((item, i) => {
        return (
          <Parenthesis
            key={i}
            data={item}
            step={Number(step) * 2}
            day={item.name}
          />
        );
      })}
    </div>
  );
}
