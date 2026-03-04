import './App.css';

import ProgressCircle, { ProgressCircleI, ProgressType } from './components/ProgressCircle';

const mockData: readonly Omit<ProgressCircleI, 'animationIndex'>[] = [
  {
    progressType: ProgressType.FRACTION,
    title: 'Quizzes',
    icon: 'quizzes',
    value: 24,
    maxValue: 31,
    size: 250,
    strokeWidth: 8,
  },
  {
    progressType: ProgressType.FRACTION,
    title: 'Questions',
    icon: 'questions',
    value: 122,
    maxValue: 131,
    size: 250,
    strokeWidth: 8,
  },
  {
    progressType: ProgressType.PERCENTAGE,
    title: 'Success Rate',
    icon: 'success-rate',
    value: 94,
    size: 250,
    strokeWidth: 8,
  },
];

function App() {
  return (
    <div className='progress-circles-wrapper'>
      {mockData.map((data, index) => (
        <ProgressCircle
          key={`progress-circle-${index}`}
          animationIndex={index}
          {...data}
        />
      ))}
    </div>
  );
}

export default App;
