// generate-blog-index.js
// Run automatically on every deploy via package.json build script
// Reads all HTML files in /blog folder and generates blog-index.json

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const outputFile = path.join(__dirname, 'blog-index.json');

// Skip these files
const SKIP_FILES = ['blog-post-template.html'];

function extractFrontmatter(content) {
  // Match YAML frontmatter between --- markers
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const data = {};

  yaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    // Remove surrounding quotes if present
    value = value.replace(/^["']|["']$/g, '');
    data[key] = value;
  });

  return data;
}

function extractMetaFallback(content) {
  // Fallback: extract from HTML meta tags if no frontmatter
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const descMatch = content.match(/<meta name="description" content="(.*?)"/);
  const dateMatch = content.match(/datePublished["']?\s*:\s*["']?([\d-]+)/);
  const categoryMatch = content.match(/class="blog-tag"[^>]*>(.*?)<\/span>/);

  return {
    title: titleMatch ? titleMatch[1].replace(' — Aaqib Bhat', '').trim() : '',
    description: descMatch ? descMatch[1] : '',
    date: dateMatch ? dateMatch[1] : new Date().toISOString(),
    category: categoryMatch ? categoryMatch[1] : 'SEO'
  };
}

try {
  if (!fs.existsSync(blogDir)) {
    console.log('No blog directory found, creating empty index.');
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
  }

  const files = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.html') && !SKIP_FILES.includes(f));

  const posts = [];

  files.forEach(filename => {
    const filepath = path.join(blogDir, filename);
    const content = fs.readFileSync(filepath, 'utf8');

    // Try frontmatter first, then fall back to HTML meta tags
    let data = extractFrontmatter(content);
    if (!data.title) {
      data = { ...data, ...extractMetaFallback(content) };
    }

    if (!data.title) {
      console.log(`Skipping ${filename} — no title found`);
      return;
    }

    posts.push({
      title: data.title,
      date: data.date || new Date().toISOString(),
      category: data.category || 'SEO',
      description: data.description || '',
      url: `blog/${filename}`,
      slug: filename.replace('.html', '')
    });
  });

  // Sort by date — newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
  console.log(`✓ Blog index generated — ${posts.length} post(s) found`);
  posts.forEach(p => console.log(`  · ${p.title}`));

} catch (err) {
  console.error('Error generating blog index:', err);
  process.exit(1);
}