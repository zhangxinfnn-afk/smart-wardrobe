import { useState, useEffect } from 'react';

export default function TestPages() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('...');

  useEffect(() => {
    setStatus('✅ Pages Router Hydration 成功！');
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Pages Router 测试</h1>
      <p style={{
        padding: 12, borderRadius: 8,
        background: status.includes('成功') ? '#dcfce7' : '#fef3c7',
      }}>{status}</p>

      <button
        onClick={() => setCount(count + 1)}
        style={{ padding: '12px 24px', fontSize: 18, background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 16 }}
      >
        React onClick 计数: {count}
      </button>

      <br /><br />

      <button
        id="native-btn"
        style={{ padding: '12px 24px', fontSize: 16, background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
      >
        原生 JS 测试
      </button>
      <span id="native-out" style={{ marginLeft: 12 }}></span>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('native-btn').onclick = function() {
            document.getElementById('native-out').textContent = '✅ 原生 onclick 触发: ' + new Date().toLocaleTimeString();
          };
          console.log('Pages Router: inline script executed');
        `
      }} />
    </div>
  );
}
