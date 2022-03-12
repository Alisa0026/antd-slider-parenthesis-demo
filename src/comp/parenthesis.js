import "./index.css";

const Parenthesis = (props) => {
  let { data, step, day } = props;

  return (
    <div
      className="parenthesis-box"
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
