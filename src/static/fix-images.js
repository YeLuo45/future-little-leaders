/**
 * 图片压缩脚本
 * 此脚本自动压缩static目录下超过200KB的图片
 * 
 * 使用方法:
 * 1. 安装依赖: npm install sharp fs-extra
 * 2. 运行脚本: node fix-images.js
 */

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// 配置
const MAX_SIZE = 200 * 1024; // 最大200KB
const QUALITY = 70; // 压缩质量
const STATIC_DIR = path.join(__dirname); // 静态资源目录
const TEMP_DIR = path.join(STATIC_DIR, 'temp'); // 临时目录

// 获取所有图片文件
async function getImageFiles() {
  const files = await fs.readdir(STATIC_DIR);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });
}

// 检查文件大小
async function checkFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

// 为文件名创建一个唯一的临时文件名
function createTempFilename(originalFilename) {
  const hash = crypto.createHash('md5').update(originalFilename).digest('hex').substring(0, 8);
  return `temp_${hash}${path.extname(originalFilename)}`;
}

// 压缩图片
async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  const tempFilename = createTempFilename(filename);
  const tempOutputPath = path.join(TEMP_DIR, tempFilename);
  
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    console.log(`原始图片: ${filename}`);
    console.log(`- 尺寸: ${metadata.width}x${metadata.height}`);
    console.log(`- 大小: ${await checkFileSize(filePath)} bytes`);
    
    // 计算新尺寸 (最大尺寸800px)
    const maxDim = Math.max(metadata.width, metadata.height);
    const ratio = maxDim > 800 ? 800 / maxDim : 1;
    const newWidth = Math.round(metadata.width * ratio);
    const newHeight = Math.round(metadata.height * ratio);
    
    // 调整图片并保存到临时文件
    if (ext === '.png') {
      await image
        .resize(newWidth, newHeight)
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toFile(tempOutputPath);
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      await image
        .resize(newWidth, newHeight)
        .jpeg({ quality: QUALITY })
        .toFile(tempOutputPath);
    } else if (ext === '.webp') {
      await image
        .resize(newWidth, newHeight)
        .webp({ quality: QUALITY })
        .toFile(tempOutputPath);
    }
    
    // 将临时文件复制回原始位置
    await fs.copy(tempOutputPath, filePath, { overwrite: true });
    
    console.log(`压缩后图片: ${filename}`);
    console.log(`- 新尺寸: ${newWidth}x${newHeight}`);
    console.log(`- 新大小: ${await checkFileSize(filePath)} bytes`);
    console.log('----------------------------');
    
    return await checkFileSize(filePath);
  } catch (error) {
    console.error(`处理图片 ${filename} 时出错:`, error.message);
    throw error;
  } finally {
    // 尝试删除临时文件（即使出错也执行）
    try {
      if (await fs.pathExists(tempOutputPath)) {
        await fs.remove(tempOutputPath);
      }
    } catch (e) {
      console.warn(`无法删除临时文件 ${tempOutputPath}:`, e.message);
    }
  }
}

// 主函数
async function main() {
  try {
    // 创建备份和临时目录
    const backupDir = path.join(STATIC_DIR, 'backup');
    await fs.ensureDir(backupDir);
    await fs.ensureDir(TEMP_DIR);
    
    // 获取所有图片
    const imageFiles = await getImageFiles();
    console.log(`发现 ${imageFiles.length} 个图片文件`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 处理每个图片
    for (const file of imageFiles) {
      const filePath = path.join(STATIC_DIR, file);
      
      try {
        const fileSize = await checkFileSize(filePath);
        
        // 如果图片大于限制大小
        if (fileSize > MAX_SIZE) {
          console.log(`处理大图片: ${file} (${fileSize} bytes)`);
          
          // 备份原文件
          const backupPath = path.join(backupDir, file);
          await fs.copy(filePath, backupPath);
          console.log(`备份原文件到: ${path.basename(backupPath)}`);
          
          // 压缩图片
          const newSize = await compressImage(filePath);
          
          // 检查压缩后的大小
          if (newSize > MAX_SIZE) {
            console.warn(`警告: ${file} 仍然超过大小限制 (${newSize} bytes)`);
            console.warn('建议使用更激进的压缩设置或手动优化');
          } else {
            console.log(`成功: ${file} 已压缩到 ${newSize} bytes`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`处理文件 ${file} 时出错:`, error.message);
        failCount++;
      }
    }
    
    // 清理临时目录
    try {
      await fs.remove(TEMP_DIR);
    } catch (e) {
      console.warn('清理临时目录时出错:', e.message);
    }
    
    console.log(`图片处理完成! 成功: ${successCount}, 失败: ${failCount}`);
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 运行脚本
main();