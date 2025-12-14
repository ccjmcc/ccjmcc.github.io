# 管理后台使用说明

## 功能说明

这是一个基于 GitHub API 的在线 Markdown 编辑器，可以直接在浏览器中编辑和发布博客文章，无需本地 Git 操作。

## 使用方法

### 1. 获取 GitHub Personal Access Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token" (classic)
3. 填写 Token 名称（如：Blog Editor）
4. **重要**：勾选 `repo` 权限（完整仓库访问权限）
5. 点击 "Generate token"
6. **复制并保存 Token**（只显示一次！）

### 2. 访问管理后台

- 直接访问：`https://你的域名.github.io/admin.html`
- 或从导航菜单进入（如果已显示）

### 3. 登录

1. 在登录页面输入你的 GitHub Personal Access Token
2. 点击"登录"
3. Token 会保存在浏览器本地存储中，下次访问自动登录

### 4. 编辑文章

- **查看文章列表**：登录后自动加载所有文章
- **编辑文章**：点击文章标题进入编辑模式
- **新建文章**：点击"新建文章"按钮
- **删除文章**：在编辑模式下点击"删除"按钮

### 5. 文章格式

编辑器会自动处理 Jekyll 的 front matter：

```yaml
---
layout: post
title: 文章标题
subtitle: 副标题（可选）
date: 2025-01-01
author: 作者名（可选）
header-img: img/post-bg-desk.jpg（可选）
tags:
    - 标签1
    - 标签2
---
```

## 注意事项

1. **Token 安全**：
   - 不要将 Token 分享给他人
   - 如果 Token 泄露，立即在 GitHub 设置中撤销
   - Token 只保存在浏览器本地，不会上传到服务器

2. **文件命名**：
   - 新建文章会自动生成文件名：`日期-标题.md`
   - 日期格式：`YYYY-MM-DD`
   - 标题会自动转换为小写并用连字符连接

3. **GitHub Pages 更新**：
   - 保存后，GitHub Pages 会自动重新构建
   - 通常需要 1-5 分钟才能看到更新
   - 可以在 GitHub 仓库的 Actions 中查看构建状态

4. **权限要求**：
   - Token 必须具有 `repo` 权限
   - 确保你的 GitHub 账号有仓库的写入权限

## 功能特性

- ✅ 在线 Markdown 编辑器（SimpleMDE）
- ✅ 实时预览
- ✅ 自动生成 front matter
- ✅ 文章列表管理
- ✅ 创建/编辑/删除文章
- ✅ Token 本地保存
- ✅ 响应式设计

## 故障排除

**无法登录**：
- 检查 Token 是否正确
- 确认 Token 有 `repo` 权限
- 检查网络连接

**无法保存**：
- 确认 Token 未过期
- 检查仓库权限
- 查看浏览器控制台错误信息

**文章不显示**：
- 等待 GitHub Pages 构建完成
- 检查文件名格式是否正确
- 确认 front matter 格式正确

## 技术说明

- 使用 GitHub REST API v3
- 前端使用 SimpleMDE Markdown 编辑器
- 数据通过 Base64 编码传输
- Token 存储在 localStorage

