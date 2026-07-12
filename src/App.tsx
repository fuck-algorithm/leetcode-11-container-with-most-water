import './App.css';
import AlgorithmAnimation from './components/algorithm/AlgorithmAnimation';
import GitHubIcon from './assets/github.svg';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a
          href="https://fuck-algorithm.github.io/leetcode-hot-100/"
          target="_blank"
          rel="noopener noreferrer"
          className="header-link"
        >
          ← 返回LeetCode Hot 100
        </a>
        <h1 className="app-title">盛最多水的容器 - 双指针法动画演示</h1>
        <a
          href="https://github.com/fuck-algorithm/leetcode-11-container-with-most-water"
          target="_blank"
          rel="noopener noreferrer"
          className="header-link"
        >
          <img src={GitHubIcon} alt="GitHub" className="github-icon" />
        </a>
      </header>
      <AlgorithmAnimation />
    </div>
  );
}

export default App;
