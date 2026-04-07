const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 移除 YAML frontmatter
function removeFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/, '');
}

// 转换单个文件
function convertFile(mdPath) {
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const cleanContent = removeFrontmatter(mdContent);
  
  // 使用 marked 转换，启用 gfm
  const htmlContent = marked.parse(cleanContent, {
    gfm: true,
    breaks: false
  });
  
  // 将 index.md 转换为 index.html
  const htmlPath = mdPath.replace(/\.md$/, '.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`✅ Converted: ${path.relative(process.cwd(), mdPath)} -> ${path.relative(process.cwd(), htmlPath)}`);
}

// 递归转换目录
function convertDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      convertDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      convertFile(fullPath);
    }
  }
}

// 转换 InfluxDB 文章
const influxdbDir = path.join(__dirname, 'articles', 'data-storage', 'influxdb');
if (fs.existsSync(influxdbDir)) {
  console.log('Converting InfluxDB markdown files to HTML...\n');
  convertDirectory(influxdbDir);
  console.log('\n✨ All files converted successfully!');
} else {
  console.error('InfluxDB directory not found:', influxdbDir);
  process.exit(1);
}
