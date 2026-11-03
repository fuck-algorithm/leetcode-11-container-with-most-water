import './App.css';
import AlgorithmAnimation from './components/algorithm/AlgorithmAnimation';
import { GitHubBadge } from './components/GitHubBadge';
import { CommunityFloat } from './components/CommunityFloat';
import { ProblemDescriptionModal } from './components/ProblemDescriptionModal';
import { AlgorithmThoughtModal } from './components/AlgorithmThoughtModal';
import './components/AlgorithmThoughtModal.css';
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
        <div className="header-right">
          <div className="header-actions" aria-label="题目信息">
            <ProblemDescriptionModal />
            <AlgorithmThoughtModal />
          </div>
          <GitHubBadge />
        </div>
      </header>
      <AlgorithmAnimation />
      <CommunityFloat />
    </div>
  );
}

export default App;
