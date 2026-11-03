import './App.css';
import AlgorithmAnimation from './components/algorithm/AlgorithmAnimation';
import { GitHubBadge } from './components/GitHubBadge';
import { CommunityFloat } from './components/CommunityFloat';
import './components/overlays.css';

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
        <h1 className="app-title"><a href="https://leetcode.cn/problems/container-with-most-water/" target="_blank" rel="noopener noreferrer">11. 盛最多水的容器</a></h1>
        <GitHubBadge />
      </header>
      <AlgorithmAnimation />
      <CommunityFloat />
    </div>
  );
}

export default App;
