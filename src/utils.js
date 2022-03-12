import { timeArray } from "./data";
import moment from "moment";
export const getParam = () => {
  const marks = {}; //slider上的标记对象
  const parenthesisArr = []; // 大括号
  // 对时间数组排序
  const newTimeArray = timeArray.sort((a, b) =>
    moment(a.time).isSameOrAfter(b.time) ? 1 : -1
  );
  // 根据时间节点计算节点位置
  let nmark =
    newTimeArray.length > 1 ? (100 / (newTimeArray.length - 1)).toFixed(2) : 0;
  // 两节点之间的中间值为步长，表示在两时间节点中的状态
  let nstep = (nmark / 2).toFixed(2);
  console.log(newTimeArray.length, nmark, nstep);
  let sliderValue = 0; // 记录当前时间轴的值

  newTimeArray.forEach((item, i) => {
    let length = newTimeArray.length;
    // 是否是最后一个节点
    let islast = length > 1 ? i === length - 1 : false;
    // 计算时间的标记位置数字 0-100之间的
    let markNum = (i * (nmark * 100)) / 100;

    // 今天的日期
    let todayTime = moment(moment().format("YYYY-MM-DD"));

    // 如果时间是今天，时间节点是相等时间的mark值
    if (moment(item.time).isSame(todayTime)) {
      sliderValue = Number(markNum);
    }
    // 如果今天时间在某个时间节点的后面，则mark值在这个节点和下个节点中间，所以加个step值
    else if (todayTime.isAfter(moment(item.time))) {
      sliderValue = (Number(markNum) * 100 + Number(nstep) * 100) / 100;
    }

    // let label = <div>{item.time}</div>;

    // 浮点计算问题
    marks[islast ? 100 : markNum] = {
      label: item.time
    };

    // ------ 对大括号显示处理------//
    // 记录开始节点
    if (item.type === "start") {
      parenthesisArr.push({
        name: "显示间距",
        left: markNum // 大括号左侧位移距离
      });
    }
  });

  return {
    timeArr: newTimeArray,
    marks,
    step: nstep,
    sliderValue,
    parenthesisArr
  };
};
