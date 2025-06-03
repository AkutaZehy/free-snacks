const fs = require('fs');
const { execSync } = require('child_process');

// 读取sentenses.json文件
const sentencesData = JSON.parse(fs.readFileSync('./tools/resources/sentenses.json', 'utf8'));
const sentences = sentencesData.data.map(item => item.sentence);

// 随机选择一条句子
const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];

// 检查是否已执行git add
try {
  const gitStatus = execSync('git status --porcelain').toString();
  if (!gitStatus.trim()) {
    console.log('没有已暂存的文件，请先执行git add');
    process.exit(1);
  }

  // 执行git commit
  execSync(`git commit -m "bruh: ${randomSentence}"`);
  console.log(`成功提交commit: bruh: ${randomSentence}`);
} catch (error) {
  console.error('错误:', error.message);
  process.exit(1);
}