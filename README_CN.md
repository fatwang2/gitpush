# GitPush

[English](README.md) | 简体中文

一个基于 AI 的 GitHub Release 追踪器，监控你关注的仓库，使用 AI 总结更新内容，并直接发送到你的邮箱。
![CleanShot 2025-03-07 at 14 53 02@2x](https://github.com/user-attachments/assets/352d8ff3-3014-4793-8a00-e6ee4efa703f)

## 技术栈

GitPush 基于四个核心的 Cloudflare 服务构建：

- **Workers**：应用程序的无服务器运行环境
- **Workflows**：用于发布监控和处理的自动化流水线
- **Workers AI**：使用 DeepSeek R1 进行 AI 驱动的发布内容总结
- **Email Routing**：可靠的邮件通知投递系统

## 配置

### 环境变量

> **安全提示**：建议通过 Cloudflare Workers 仪表板配置这些环境变量，而不是将它们存储在 `wrangler.jsonc` 文件中，以防止敏感信息在 GitHub 上暴露。

| 变量名 | 描述 | 示例 | 备注 |
|---------------|-------------|---------|--------|
| `GITHUB_REPOS` | 需要监控的 GitHub 仓库 | "https://github.com/owner/repo1,https://github.com/owner/repo2" | 使用逗号分隔多个仓库 |
| `EMAIL_FROM_ADDRESS` | 通知发送者邮箱 | "noreply@yourdomain.com" | 必须在 Cloudflare 中配置，参考[这里](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/) |
| `EMAIL_TO_ADDRESS` | 通知接收者邮箱，必须与 destination_address 匹配 | "your.email@domain.com" | 必须在 Cloudflare 中配置，参考[这里](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/) |
| `GITHUB_TOKEN` | GitHub 个人访问令牌 | "xxxxxxxxxxxx" | 可选。个人使用不需要（每小时 60 个未认证请求。更多详情参考[这里](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28)） |

### `wrangler.jsonc` 中的其他配置
| 配置项 | 描述 | 示例 | 备注 |
|--------------|-------------|---------|--------|
| `send_email.destination_address` | 通知接收者邮箱 | "your.email@domain.com" | 必须与 EMAIL_TO_ADDRESS 匹配 |
| `triggers.crons` | 仓库监控计划 | "0 1 * * *" | Cron 表达式格式（例如，"0 1 * * *" 表示每天凌晨 1 点运行，检查过去 24 小时的更新） |

## 部署

> **注意**：本项目设计为在 Cloudflare Workers 上运行，需要 Cloudflare 的基础设施。由于依赖 Cloudflare 特有的功能（如 Email API 和 AI 功能），无法在本地运行。

```bash
# 安装依赖
pnpm install

# 部署到 Cloudflare Workers
pnpm run publish
```

## 使用方法

### 自动更新

部署完成后，GitPush 将自动：
- 每天凌晨 1 点运行（可通过 `wrangler.jsonc` 中的 `triggers.crons` 配置）
- 检查你监控的仓库中的新发布
- 如果发现更新，发送邮件通知

### 手动触发

你可以通过以下三种方式手动触发工作流：

1. **使用网页界面**

最简单的使用方式：
1. 访问你部署的应用 URL（例如：`https://your-worker.workers.dev`）
2. 输入你想要监控的 GitHub 仓库 URL
3. 点击 "开始工作流" 触发工作流

2. **使用 API**

创建工作流：
```bash
curl -X POST https://your-worker.workers.dev/api/workflow/create \
  -H "Content-Type: application/json" \
  -d '{
    "repo_urls": [
      "https://github.com/owner/repo1",
      "https://github.com/owner/repo2"
    ]
  }'
```

查询工作流状态：
```bash
curl -X POST https://your-worker.workers.dev/api/workflow/status \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "your-workflow-instance-id"
  }'
```

3. **使用 Cloudflare 仪表板**

- 访问 [Cloudflare 仪表板](https://dash.cloudflare.com)
- 导航到 Compute(Workers) > Workflows > 你的工作流
- 点击 "Trigger" 按钮
- 输入你的目标仓库并触发工作流

```json
{
  "repo_urls": [
    "https://github.com/owner/repo1",
    "https://github.com/owner/repo2"
  ]
}
```

### 监控

要监控工作流执行情况：
1. 访问 [Cloudflare 仪表板](https://dash.cloudflare.com)
2. 导航到 Compute(Workers) > Workflows > 你的工作流
3. 在这里你可以查看：
   - 执行历史
   - 成功/失败状态
   - 每个步骤的详细日志
   - 邮件投递状态
