# 读者模拟器 - AI标题点评工具

## 项目简介

这是一个基于AI的读者模拟器，可以根据不同的读者画像对文章标题进行智能点评。通过设置不同的读者角色（如技术专家、普通用户、行业从业者等），AI会从不同角度分析标题的吸引力和改进建议。

## 主要功能

- **多角色点评**: 支持多种读者画像，每种角色都有独特的评价标准
- **智能分析**: AI自动生成评分、标签、评论和改进建议
- **实时预览**: 输入标题后实时预览效果
- **LLM API设置**: 支持自定义API密钥、模型和请求地址

## 新增功能

### LLM API 设置

现在支持自定义LLM API配置：

1. **API请求地址**: 可以设置不同的API端点
2. **API密钥**: 支持自定义API密钥，带密码显示/隐藏功能
3. **模型选择**: 支持多种预定义模型，也支持自定义模型名称
4. **配置管理**: 
   - 自动保存到浏览器本地存储
   - 支持测试API连接
   - 支持重置为默认配置
   - 支持导入/导出配置

### 使用方法

1. 点击页面顶部的"设置"按钮
2. 在设置面板中配置你的LLM API参数
3. 点击"测试连接"验证配置是否正确
4. 点击"保存配置"保存设置
5. 返回主页面开始使用

## 项目信息

**URL**: https://lovable.dev/projects/1abf20b7-6276-4e79-9afb-fb3caef8ddb4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1abf20b7-6276-4e79-9afb-fb3caef8ddb4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1abf20b7-6276-4e79-9afb-fb3caef8ddb4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
