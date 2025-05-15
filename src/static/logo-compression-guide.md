# 图片压缩操作指南

## 需要压缩的文件
1. `src/static/logo.png` (423KB)
2. `src/static/生成育儿时光纪 logo.png` (423KB)

## 立即解决方案 (必须执行)

1. **删除或重命名原大文件**
   ```bash
   # 将原文件重命名为备份
   ren "src\static\logo.png" "logo-original.png"
   ren "src\static\生成育儿时光纪 logo.png" "生成育儿时光纪 logo-original.png"
   ```

2. **使用在线压缩工具**
   - 访问 [TinyPNG](https://tinypng.com/) 或 [Squoosh](https://squoosh.app/)
   - 上传原始logo图片
   - 下载压缩后的图片（确保大小<200KB）
   - 将压缩后的图片重命名为原文件名，放回原位置

3. **替代方案：使用命令行工具**
   ```bash
   # 安装 imagemin (需要先安装 Node.js)
   npm install -g imagemin-cli
   npm install -g imagemin-pngquant

   # 压缩图片
   imagemin "src\static\logo-original.png" --out-dir=src\static\ --plugin=pngquant
   ```

4. **参考设置**
   - 分辨率: 如果原图是1000x1000以上，考虑缩小到800x800或更小
   - 质量: 60-80% 通常可以保持良好的视觉效果
   - 色彩深度: 可以从 32位 降低到 24位 或 8位(如适用)

## 项目中引用图片的位置
检查以下文件中对logo的引用，确保压缩后的图片仍然有效:
- `App.vue`
- 任何引用了logo的组件文件

## 测试步骤
1. 压缩后在开发工具中预览效果
2. 确认图片显示正常且没有明显质量损失
3. 重新运行代码质量检测，确认问题已解决

## 长期解决方案
1. **建立图片资源规范**
   - 所有图片资源必须小于200KB
   - logo和图标优先使用SVG格式
   - 为不同屏幕密度准备不同尺寸的图片

2. **添加提交前检查**
   - 在CI/CD流程中添加图片大小检查
   - 使用git钩子在提交前检查新增图片的大小

3. **使用CDN托管大图片**
   - 对于必须保持高质量的大图片，考虑使用云存储或CDN
   - 在小程序中通过URL引用这些图片

按照上述步骤操作后，微信小程序的代码质量检测应该能够通过图片大小检测。 