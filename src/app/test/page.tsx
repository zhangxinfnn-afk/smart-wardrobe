'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [jsStatus, setJsStatus] = useState('检测中...');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setJsStatus('✅ React Hydration 成功！JS 正常运行');

    // Catch window errors
    const handler = (e: ErrorEvent) => {
      setErrors((prev) => [...prev, e.message]);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>诊断页面</h1>

      {/* JS Status */}
      <div style={{
        marginTop: 16, padding: 12, borderRadius: 8,
        background: jsStatus.includes('成功') ? '#dcfce7' : '#fef3c7',
        border: '1px solid ' + (jsStatus.includes('成功') ? '#86efac' : '#fde68a'),
      }}>
        <strong>{jsStatus}</strong>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5' }}>
          <strong>❌ 捕获到错误:</strong>
          {errors.map((e, i) => <pre key={i} style={{ margin: '4px 0', fontSize: 12 }}>{e}</pre>)}
        </div>
      )}

      {/* Button test */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setCount(count + 1)}
          style={{ padding: '12px 24px', fontSize: 18, background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          点击计数: {count}
        </button>
      </div>

      {/* Input test */}
      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文字测试 onChange..."
          style={{ padding: 12, fontSize: 16, border: '2px solid #ddd', borderRadius: 8, width: 320 }}
        />
        <p style={{ marginTop: 8 }}>你输入: <strong>{text || '(空)'}</strong></p>
      </div>

      {/* Native onclick test (no React) */}
      <div style={{ marginTop: 24 }}>
        <button
          ref={(el) => {
            if (el) {
              el.onclick = () => {
                document.getElementById('native-result')!.textContent = '原生 onclick 触发于: ' + new Date().toLocaleTimeString();
              };
            }
          }}
          style={{ padding: '12px 24px', fontSize: 16, background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          原生 JS onclick 测试
        </button>
        <span id="native-result" style={{ marginLeft: 12, color: '#666' }}></span>
      </div>

      {/* API test */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/users');
              const data = await res.json();
              setJsStatus('✅ API 调用成功: ' + data.length + ' 个用户');
            } catch (e) {
              setJsStatus('❌ API 错误: ' + (e as Error).message);
            }
          }}
          style={{ padding: '12px 24px', fontSize: 16, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          API 测试
        </button>
      </div>

      <hr style={{ marginTop: 32 }} />
      <p style={{ color: '#888', fontSize: 13 }}>
        💡 如果「原生 JS onclick」按钮有效但 React 按钮无效 → React 事件系统有问题<br />
        💡 如果全部无效 → JavaScript 未加载<br />
        💡 如果全部有效 → 问题在其他页面组件中
      </p>
    </div>
  );
}
