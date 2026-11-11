import React, { useState } from 'react';
import { getSolution } from '../../features/solutions/solutionRegistry';

type Language = 'Java' | 'Python' | 'Go' | 'JavaScript';
interface CodePanelProps {
  activeAnchor: string;
  variables: Record<string, string | number>;
  algorithmType: 'bruteForce' | 'twoPointer';
}

type CodeLine = { anchor: string; text: string };
const code: Record<Language, CodeLine[]> = {
  Java: [
    { anchor: 'init', text: 'int[] height = input;' },
    { anchor: 'init', text: 'int i = 0, j = height.length - 1;' },
    { anchor: 'init', text: 'int res = 0;' },
    { anchor: 'compare-area', text: 'while (i < j) {' },
    { anchor: 'compare-area', text: '  int h = Math.min(height[i], height[j]);' },
    { anchor: 'compare-area', text: '  int area = h * (j - i);' },
    { anchor: 'update', text: '  res = Math.max(res, area);' },
    { anchor: 'move-left', text: '  if (height[i] < height[j]) i++;' },
    { anchor: 'move-right', text: '  else j--;' },
    { anchor: 'return', text: '}' },
    { anchor: 'return', text: 'return res;' },
  ],
  Python: [
    { anchor: 'init', text: 'height = input' },
    { anchor: 'init', text: 'i, j = 0, len(height) - 1' },
    { anchor: 'init', text: 'res = 0' },
    { anchor: 'compare-area', text: 'while i < j:' },
    { anchor: 'compare-area', text: '    h = min(height[i], height[j])' },
    { anchor: 'compare-area', text: '    area = h * (j - i)' },
    { anchor: 'update', text: '    res = max(res, area)' },
    { anchor: 'move-left', text: '    if height[i] < height[j]:' },
    { anchor: 'move-left', text: '        i += 1' },
    { anchor: 'move-right', text: '    else: j -= 1' },
    { anchor: 'return', text: 'return res' },
  ],
  Go: [
    { anchor: 'init', text: 'height := input' },
    { anchor: 'init', text: 'i, j, res := 0, len(height)-1, 0' },
    { anchor: 'compare-area', text: 'for i < j {' },
    { anchor: 'compare-area', text: '    h := min(height[i], height[j])' },
    { anchor: 'compare-area', text: '    area := h * (j - i)' },
    { anchor: 'update', text: '    res = max(res, area)' },
    { anchor: 'move-left', text: '    if height[i] < height[j] {' },
    { anchor: 'move-left', text: '        i++' },
    { anchor: 'move-right', text: '    } else {' },
    { anchor: 'move-right', text: '        j--' },
    { anchor: 'return', text: '}' },
    { anchor: 'return', text: 'return res' },
  ],
  JavaScript: [
    { anchor: 'init', text: 'const height = input;' },
    { anchor: 'init', text: 'let i = 0, j = height.length - 1;' },
    { anchor: 'init', text: 'let res = 0;' },
    { anchor: 'compare-area', text: 'while (i < j) {' },
    { anchor: 'compare-area', text: '  const h = Math.min(height[i], height[j]);' },
    { anchor: 'compare-area', text: '  const area = h * (j - i);' },
    { anchor: 'update', text: '  res = Math.max(res, area);' },
    { anchor: 'move-left', text: '  if (height[i] < height[j]) i++;' },
    { anchor: 'move-right', text: '  else j--;' },
    { anchor: 'return', text: '}' },
    { anchor: 'return', text: 'return res;' },
  ],
};
const bruteForceCode: Record<Language, CodeLine[]> = {
  Java: [
    { anchor: 'brute-init', text: 'int res = 0;' },
    { anchor: 'brute-compare', text: 'for (int i = 0; i < n - 1; i++) {' },
    { anchor: 'brute-compare', text: '  for (int j = i + 1; j < n; j++) {' },
    { anchor: 'brute-compare', text: '    int area = Math.min(h[i], h[j]) * (j - i);' },
    { anchor: 'brute-update', text: '    res = Math.max(res, area);' },
    { anchor: 'brute-move', text: '  } // 尝试下一条右边界' },
    { anchor: 'return', text: '}' },
    { anchor: 'return', text: 'return res;' },
  ],
  Python: [
    { anchor: 'brute-init', text: 'res = 0' },
    { anchor: 'brute-compare', text: 'for i in range(len(height) - 1):' },
    { anchor: 'brute-compare', text: '    for j in range(i + 1, len(height)):' },
    { anchor: 'brute-compare', text: '        area = min(height[i], height[j]) * (j - i)' },
    { anchor: 'brute-update', text: '        res = max(res, area)' },
    { anchor: 'brute-move', text: '        # 继续枚举下一组边界' },
    { anchor: 'return', text: 'return res' },
  ],
  Go: [
    { anchor: 'brute-init', text: 'res := 0' },
    { anchor: 'brute-compare', text: 'for i := 0; i < len(height)-1; i++ {' },
    { anchor: 'brute-compare', text: '    for j := i+1; j < len(height); j++ {' },
    { anchor: 'brute-compare', text: '        area := min(height[i], height[j]) * (j-i)' },
    { anchor: 'brute-update', text: '        res = max(res, area)' },
    { anchor: 'brute-move', text: '    } // 尝试下一条右边界' },
    { anchor: 'return', text: 'return res' },
  ],
  JavaScript: [
    { anchor: 'brute-init', text: 'let res = 0;' },
    { anchor: 'brute-compare', text: 'for (let i = 0; i < height.length - 1; i++) {' },
    { anchor: 'brute-compare', text: '  for (let j = i + 1; j < height.length; j++) {' },
    { anchor: 'brute-compare', text: '    const area = Math.min(height[i], height[j]) * (j - i);' },
    { anchor: 'brute-update', text: '    res = Math.max(res, area);' },
    { anchor: 'brute-move', text: '  } // 尝试下一条右边界' },
    { anchor: 'return', text: 'return res;' },
  ],
};
const languages = Object.keys(code) as Language[];

const CodePanel: React.FC<CodePanelProps> = ({ activeAnchor, variables, algorithmType }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('codeLanguage') as Language | null;
    return saved && languages.includes(saved) ? saved : 'Java';
  });
  const selectLanguage = (value: Language) => {
    localStorage.setItem('codeLanguage', value);
    setLanguage(value);
  };

  return (
    <aside className="code-panel" aria-label="算法代码与变量">
      <div className="code-panel-heading">
        <span>执行代码</span>
        <select aria-label="代码语言" value={language} onChange={(event) => selectLanguage(event.target.value as Language)}>
          {languages.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <pre className="code-list" aria-label={`${language} ${algorithmType === 'bruteForce' ? '暴力枚举' : '双指针'}实现`}>
        {(algorithmType === 'bruteForce' ? bruteForceCode[language] : code[language]).map((line, index) => (
          <div className={`code-line${line.anchor === activeAnchor ? ' is-active' : ''}`} data-anchor={line.anchor} key={`${index}-${line.anchor}`}>
            <span className="line-number">{String(index + 1).padStart(2, '0')}</span>
            <code>{line.text}</code>
          </div>
        ))}
      </pre>
      <div className="variable-watch" aria-label="关键变量">
        <div className="watch-heading">关键变量 <span>LIVE</span></div>
        {Object.entries(variables).map(([name, value]) => (
          <div className="watch-row" key={name}><code>{name}</code><b>{value}</b></div>
        ))}
      </div>
      <div className="complexity"><span>时间 <b>{getSolution(algorithmType).timeComplexity}</b></span><span>空间 <b>{getSolution(algorithmType).spaceComplexity}</b></span></div>
    </aside>
  );
};

export default CodePanel;
