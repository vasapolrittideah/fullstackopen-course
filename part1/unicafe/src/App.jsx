import { useState } from "react";

const Feedback = () => <h1>give feedback</h1>;

const StatisticLine = ({ text, value }) => (
  <tr>
    <td>{text}</td>
    <td>{value}</td>
  </tr>
);

const Statistics = ({ good, neutral, bad }) => {
  const countAllFeedbacks = () => good + neutral + bad;

  const calculateAverageFeedback = () =>
    (good + bad * -1) / countAllFeedbacks();

  const calculatePositiveFeedback = () =>
    `${(good / countAllFeedbacks()) * 100} %`;

  return (
    <>
      <h1>statistics</h1>
      {countAllFeedbacks() === 0 ? (
        <p>No feedback given</p>
      ) : (
        <table>
          <tbody>
            <StatisticLine text="good" value={good} />
            <StatisticLine text="neutral" value={neutral} />
            <StatisticLine text="bad" value={bad} />
            <StatisticLine text="all" value={countAllFeedbacks()} />
            <StatisticLine text="average" value={calculateAverageFeedback()} />
            <StatisticLine
              text="positive"
              value={calculatePositiveFeedback()}
            />
          </tbody>
        </table>
      )}
    </>
  );
};

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>{text}</button>
);

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);

  return (
    <div>
      <Feedback />
      <div>
        <Button text="good" handleClick={() => setGood(good + 1)} />
        <Button text="neutral" handleClick={() => setNeutral(neutral + 1)} />
        <Button text="bad" handleClick={() => setBad(bad + 1)} />
      </div>
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  );
};

export default App;
