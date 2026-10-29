// 把 src/ 拼成一个可以直接打开的 dist/index.html（模块按 src/js/ORDER.txt 的顺序，共享同一个脚本作用域）
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const order = fs.readFileSync(path.join(root, 'src/js/ORDER.txt'), 'utf8').split('\n').filter(Boolean);
const js = order.map(f => fs.readFileSync(path.join(root, 'src/js', f), 'utf8').replace(/\n$/, '')).join('\n');
const css = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8').replace(/\n$/, '');
const shell = fs.readFileSync(path.join(root, 'src/shell.html'), 'utf8');
const out = shell.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), out);
// 语法检查
try { new Function(js); } catch (e) { console.error('语法错误：', e.message); process.exit(1); }
console.log(`dist/index.html  ${(out.length / 1024).toFixed(0)} KB  ${order.length} 个模块`);
