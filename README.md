# 读者模拟器 - 智能标题点评系统

一个基于AI的智能标题点评系统，能够从不同读者画像的角度对文章标题进行专业点评。

## ✨ 新功能特性

### 🎯 多标题-多读者画像点评
- **标题池子管理**：支持输入标题 + 生成的多角度标题变体
- **多选读者画像**：可以同时选择多个读者画像进行点评
- **批量生成点评**：为每个标题 × 每个读者画像组合生成专业点评
- **智能排序筛选**：按评分、标题、读者画像等维度排序和筛选结果

### 🎨 丰富的读者画像
- **12种专业画像**：职场精英、在校学生、创业者、技术爱好者等
- **个性化点评**：每个画像都有独特的视角和评价标准
- **多维度分析**：评分、标签、建议等多维度点评内容

### 📊 强大的结果展示
- **统计信息**：总点评数、平均评分、高分点评数
- **筛选排序**：支持按评分、标题、读者画像筛选和排序
- **详细展示**：每个点评包含评分、评论、标签、建议等完整信息

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📖 使用指南

### 1. 输入标题
在左侧输入框中输入你的文章标题，系统会自动生成多个角度的标题变体。

### 2. 选择读者画像
从12种专业读者画像中选择一个或多个，支持多选。

### 3. 生成点评
点击"生成点评"按钮，系统将为每个标题 × 每个读者画像组合生成专业点评。

### 4. 查看结果
在右侧查看生成的点评结果，支持按评分、标题、读者画像等维度排序和筛选。

## 🛠️ 技术栈

- **前端框架**：React + TypeScript
- **UI组件库**：Shadcn/ui + Tailwind CSS
- **构建工具**：Vite
- **AI集成**：支持多种LLM API（OpenAI、Claude等）

## 🎯 核心功能

### 标题生成
- 基于输入标题生成5个不同角度的标题变体
- 情感角度、实用角度、好奇角度、权威角度、故事角度

### 读者画像
- **职场精英**：注重效率和实用性
- **在校学生**：充满好奇心和求知欲
- **创业者**：具备商业敏感和创新思维
- **技术爱好者**：追求技术深度和前沿趋势
- **创意工作者**：注重创意表达和视觉体验
- **服装设计师**：具备时尚敏感和艺术功底
- **数据分析师**：数据驱动和逻辑思维
- **视觉设计师**：品牌策划和视觉设计
- **AI设计师**：AI应用和设计转型
- **科技媒体编辑**：新闻敏感和深度分析
- **公共艺术策展人**：艺术策展和社会价值
- **金融科技从业者**：金融专业和科技理解

### 点评内容
- **评分**：1-10分的吸引力评分
- **评论**：100字以内的详细点评
- **标签**：体现读者画像特点的标题特征
- **建议**：具体的改进建议

## 🔧 配置说明

在设置面板中可以配置：
- LLM API地址和密钥
- 模型选择
- 其他参数设置

## �� 许可证

MIT License
