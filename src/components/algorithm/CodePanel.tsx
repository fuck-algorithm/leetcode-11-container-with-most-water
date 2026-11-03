import React, { useState } from 'react';

type Language = 'Java' | 'Python' | 'Go' | 'JavaScript';
interface CodePanelProps {
  activeAnchor: string;
  variables: Record<string, string | number>;
}

const code: Record<Language, { anchor: string; text: string }[]> = {
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
    { anchor: 'compare-area', text: '  res = Math.max(res, area);' },
    { anchor: 'move-left', text: '  if (height[i] < height[j]) i++;' },
    { anchor: 'move-right', text: '  else j--;' },
    { anchor: 'return', text: '}' },
    { anchor: 'return', text: 'return res;' },
  ],
};
const languages = Object.keys(code) as Language[];

const CodePanel: React.FC<CodePanelProps> = ({ activeAnchor, variables }) => {
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
      <pre className="code-list" aria-label={`${language} 双指针实现`}>
        {code[language].map((line, index) => (
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
      <div className="complexity"><span>时间 <b>O(n)</b></span><span>空间 <b>O(1)</b></span></div>
    </aside>
  );
};

export default CodePanel;
