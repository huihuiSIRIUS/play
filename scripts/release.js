import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

// 获取当前文件的目录路径（ES模块方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 前端目录
const frontendDir = path.resolve(__dirname, '..');
// Git仓库目录
const gitRepoDir = 'E:\\AIDesign\\tarce\\git';
// changelog文件路径
const changelogPath = path.join(frontendDir, 'src', 'assets', 'changelog.json');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 询问用户本次更新的内容
rl.question('本次更新的内容是什么？ ', (updateContent) => {
  try {
    // 读取或创建changelog.json
    let changelog = [];
    if (fs.existsSync(changelogPath)) {
      const changelogContent = fs.readFileSync(changelogPath, 'utf8');
      changelog = JSON.parse(changelogContent);
    }

    // 生成版本号（基于日期和时间）
    const now = new Date();
    const version = `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 生成当前日期
    const date = now.toISOString().split('T')[0];

    // 追加新的更新记录
    changelog.unshift({
      version,
      date,
      content: updateContent
    });

    // 写入changelog.json
    fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2));
    console.log('✓ 已更新changelog.json');
    
    // 同时复制到Git仓库目录
    const gitChangelogPath = path.join(gitRepoDir, 'src', 'assets', 'changelog.json');
    // 确保目录存在
    fs.mkdirSync(path.dirname(gitChangelogPath), { recursive: true });
    fs.writeFileSync(gitChangelogPath, JSON.stringify(changelog, null, 2));
    console.log('✓ 已复制changelog.json到Git仓库目录');
    
    // 创建版本备份
    const backupBaseDir = path.join(gitRepoDir, 'backups');
    const systemNameDir = path.join(backupBaseDir, 'git-manager-system');
    const versionDir = path.join(systemNameDir, version);
    
    // 确保备份目录存在
    fs.mkdirSync(versionDir, { recursive: true });
    console.log('✓ 已创建版本备份目录:', versionDir);
    
    // 复制前端代码到备份目录
    const frontendFiles = [
      'src',
      'index.html',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.node.json',
      'vite.config.ts',
      'server.js'
    ];
    
    frontendFiles.forEach(file => {
      const sourcePath = path.join(gitRepoDir, file);
      const destPath = path.join(versionDir, file);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          // 递归复制目录
          fs.mkdirSync(destPath, { recursive: true });
          const files = fs.readdirSync(sourcePath);
          files.forEach(subFile => {
            const subSourcePath = path.join(sourcePath, subFile);
            const subDestPath = path.join(destPath, subFile);
            if (fs.statSync(subSourcePath).isDirectory()) {
              fs.mkdirSync(subDestPath, { recursive: true });
              // 这里可以添加更详细的目录复制逻辑
            } else {
              fs.copyFileSync(subSourcePath, subDestPath);
            }
          });
        } else {
          // 复制文件
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    });
    console.log('✓ 已复制代码到版本备份目录');

    // 切换到Git仓库目录并执行Git命令
    console.log('✓ 切换到Git仓库目录...');
    // 只提交与版本更新相关的文件
    execSync('git add src/assets/changelog.json', { cwd: gitRepoDir, stdio: 'inherit' });
    console.log('✓ 已执行git add src/assets/changelog.json');
    
    const commitMessage = `feat: [${version}] ${updateContent}`;
    execSync(`git commit -m "${commitMessage}"`, { cwd: gitRepoDir, stdio: 'inherit' });
    console.log('✓ 已执行git commit');

    console.log('\n🎉 发布脚本执行完成！');
    console.log(`- 版本号: ${version}`);
    console.log(`- 更新内容: ${updateContent}`);
    console.log(`- 提交信息: ${commitMessage}`);

  } catch (error) {
    console.error('❌ 执行过程中出现错误:', error.message);
  } finally {
    rl.close();
  }
});
