import './App.css';
import AlgorithmAnimation from './components/algorithm/AlgorithmAnimation';
import GitHubIcon from './assets/github.svg';

function App() {
  return (
    <div className="app-container">
      <a href="https://fuck-algorithm.github.io/leetcode-hot-100/" target="_blank" rel="noopener noreferrer" className="back-link">
        ← 返回LeetCode Hot 100
      </a>
      <a href="https://github.com/fuck-algorithm/leetcode-11-container-with-most-water" target="_blank" rel="noopener noreferrer">
        <img src={GitHubIcon} alt="GitHub" className="github-icon" />
      </a>
      <AlgorithmAnimation />
    </div>
  );
}

export default App;