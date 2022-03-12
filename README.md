# antd-slider-parenthesis-demo

> 版权声明：本文为博主原创文章，未经博主允许不得转载。欢迎 Issues 留言。

# 一、背景

在实际开发过程中，遇到个有趣的小功能，这里分享一下实现过程。主要是通过 antd 的 slider 组件进行实现，并且用括号标注一个区间进行显示。如下图所示：

![示例图.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f0dc707f9f944f6acda95e69c3f0226~tplv-k3u1fbpfcp-watermark.image?)

我们要实现的效果是：

- 动态的根据时间数据给出的时间节点进行显示
- 如果当前时间在两个时间节点之间，显示进度在节点之间
- 不能手动对 Slider 进行拖拽。

# 二、功能实现

## 1. 数据准备

首先我们的时间数据是动态获取的，时间顺序可能也没有排序，所以需要对获取到得时间做一个处理。
下面显示的是我们处理完后的假数据格式如下：

```js
// 比如我们获取的时间数据如下
// data.js
export const timeArray = [
  {
    time: "2022-03-01",
    type: "start" // 标记括号区间开始位置
  },
  {
    time: "2022-03-10"
  },
  {
    time: "2022-02-26"
  },
  {
    time: "2022-06-07"
  },
  {
    time: "2022-05-08"
  }
];
```

## 2. Slider 使用

查看 antd 的[slider 的 API](https://ant.design/components/slider-cn/)，可以看到我们需要的大概有如下的参数：

- marks 刻度标记
- step 步长，取值必须大于 0
- value 设置当前取值
- disable 值为 true 时，滑块为禁用状态
- tooltipVisible 值为 true 时，Tooltip 将会始终显示；否则始终不显示，哪怕在拖拽及移入时

```js
import { Slider } from "antd";
...
<Slider
    marks={marks} // 刻度标记
    step={step}   // 步长
    value={value} // 当前取值
    disabled      // 值为 true 时，滑块为禁用状态
    tooltipVisible={false}  // 始终不显示tooltip
/>
```

## 3. 处理 Slider 需要的参数

我们需要定义一个方法`getParam`来对组件 Slider 需要的参数进行一个处理。

首先处理动态显示时间节点的问题：

### 1） 定义 marks 来存放处理好的 slider 的节点。

```js
// utils.js
import { timeArray } from "./data.js";

export const getParam = () => {
  const marks = {}; //slider上的标记对象
  ...
}
```

marks 对象的格式是`{ number: ReactNode }` 或者`{ number: { style: CSSProperties, label: ReactNode } }`

```js
// antd demo显示
const marks = {
  0: "0°C",
  26: "26°C",
  37: "37°C",
  100: { style: { color: "#f50" }, label: <strong>100°C</strong> }
};
```

所以后续我们需要处理后得到如 demo 所示的数据结果。

### 2） timeArray 先通过 sort 对时间进行排序，保证时间顺序正确

```js
import moment from "moment";
...
// 对时间数组排序
const newTimeArray = timeArray.sort((a, b) =>
    moment(a.time).isSameOrAfter(b.time) ? 1 : -1
);
```

### 3）根据数组内的时间节点个数，动态计算节点 number 值和节点步长 step。

比如当前数组内有**4 个时间节点**，那么 marks 对象的 0 和 100 会分别占据 2 个节点，剩余 2 个节点要在 0 至 100 之间平均分配。也就是 **0 至 100 会被平均分成 3 份**，每一份的长度 就是我们要计算的`nmark`。

因为我们的需求第 2 点提到**如果当前时间在两个时间节点之间，显示进度在节点之间**，所以，我们的步长 `nstep` 其实是前面`nmark`长度的一半。

```js
// 根据时间节点计算节点位置
let nmark =
  newTimeArray.length > 1 ? (100 / (newTimeArray.length - 1)).toFixed(2) : 0;

// 两节点之间的中间值为步长，表示在两时间节点中的状态
let nstep = (nmark / 2).toFixed(2);
```

### 4） 在 marks 对象进行刻度标记

- 当我们计算好每份的长度和步长以后，我们需要通过遍历时间数组，对每个数据显示的节点的在 marks 对象进行刻度标记。

- 并且跟今天的日期做对比，记录当前我们应该显示的 value 值是什么。
  - 如果今天的日期和某个标记日期正好相等，value 就是标记日期的刻度值
  - 如果今天日期 在某两个刻度（比如刻度 1、2）之间，则 value 值是这两个刻度之间的刻度值（这里就是为什么前面 nstep 是 nmark 的一半的原因），既 `value = 刻度1的mark值 + nstep`，则正好位于刻度 1、2 之间

```js
  let sliderValue = 0; // 记录当前时间轴的值

  // 对排序后的时间进行遍历
  newTimeArray.forEach((item, i) => {
    // 数组长度
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

    // 刻度标记marks对象
    marks[islast ? 100 : markNum] = {
      label: item.time
    };
    ...

  });

  return {
    timeArr: newTimeArray,
    marks,
    step: nstep,
    sliderValue,
  };
}
```

## 4. 大括号的实现

### 1）获取参数处理

这里处理的比较简单，我们这里默认显示两个节点之间的间距。所以给要显示的时间节点加个 `type` ，这里 是 type = “start”

```js
{
    time: "2022-03-01",
    type: "start" // 标记括号区间开始位置
},
```

然后在上面 3 中第 4）步遍历时间数组的时候，对大括号要显示的地方做个处理。

```js
const parenthesisArr = []; // 大括号

// 对排序后的时间进行遍历
newTimeArray.forEach((item, i) => {
     ...
    // 计算时间的标记位置数字 0-100之间的
    let markNum = (i * (nmark * 100)) / 100;

    // ------ 对大括号显示处理------//
    // 记录开始节点
    if (item.type === "start") {
        parenthesisArr.push({
            name: "显示间距",
            left: markNum // 大括号左侧位移距离
        });
    }

   ...

});
```

然后大括号的组件处理

```js
import Parenthesis from "./comp/parenthesis.js";
import { getParam } from "./utils";

...

 const [value, set_value] = useState(0);  // 当前值
 const [marks, set_marks] = useState({});  // 标记
 const [step, set_step] = useState(null); // 步长
 const [parenthesisArr, set_parenthesisArr] = useState([]); // 显示大括号数组

 useEffect(() => {
    let param = getParam();

    set_marks(param.marks);
    set_step(param.step);
    set_value(param.sliderValue);
    set_parenthesisArr(param.parenthesisArr);
 }, []);

  ...

{parenthesisArr.map((item, i) => {
    return (
        <Parenthesis
            key={i}
            data={item}
            step={Number(step) * 2} // 默认显示相邻两个节点之前的间距
            day={item.name}
        />
    );
})}
```

### 2）大括号的样式实现

主要根据步长来设置大括号的宽度，left 是向左位移的距离。

```js
// parenthesis.js

import "./index.css";

const Parenthesis = (props) => {
  let { data, step, day } = props;

  return (
    <div
      className="parenthesis-box"
      // 这里根据步长来设置大括号的宽度
      style={{ left: `${data.left}%`, width: `${step}%` }}
    >
      <div className="parenthesis-inner">
        <div className="parenthesis">
          <div className="parenthesis-text">{day}</div>
        </div>
      </div>
    </div>
  );
};

export default Parenthesis;
```

css 样式如下：
主要是利用 before、after 伪类进行实现。

```css
/*index.css*/

.parenthesis-box {
  position: absolute;
  top: 40px;
}

/*显示提示文案*/
.parenthesis-text {
  position: relative;
  top: -40px;
}

/*大括号样式*/
.parenthesis-inner {
  position: relative;
  width: 100%;
  height: 40px;
}
.parenthesis-inner::before,
.parenthesis-inner::after,
.parenthesis::before,
.parenthesis::after {
  content: "";
  display: block;
  position: absolute;
  width: calc(50% - 20px);
  height: 20px;
  border-style: solid;
  border-color: rgb(9, 113, 241);
  border-width: 0;
}
.parenthesis::before,
.parenthesis::after {
  top: 0;
  border-top-width: 1px;
}
.parenthesis-inner::before,
.parenthesis-inner::after {
  top: -19px;
  border-bottom-width: 1px;
}
.parenthesis::before {
  left: 0;
  border-top-left-radius: 20px;
}
.parenthesis::after {
  right: 0;
  border-top-right-radius: 20px;
}
.parenthesis-inner::before {
  left: 20px;
  border-bottom-right-radius: 20px;
}
.parenthesis-inner::after {
  right: 20px;
  border-bottom-left-radius: 20px;
}
```

[点击查看以上 demo 完整代码](https://codesandbox.io/s/slidershi-jian-jian-ju-olnwp7)

# 三、参考文章

- [css3 平行四边形 、大括弧](https://www.cnblogs.com/arealy/p/7736856.html)
- [antd Slider](https://ant.design/components/slider-cn/)
