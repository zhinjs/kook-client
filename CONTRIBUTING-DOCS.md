# 文档贡献指南

本仓库使用 VitePress 构建文档。本指南将帮助你了解如何为项目文档做出贡献。

## 文档结构

```
docs/
├── .vitepress/          # VitePress 配置
│   ├── config.mts       # 主配置文件
│   └── theme/           # 主题自定义
│       ├── index.ts
│       └── custom.css
└── src/                 # 文档源文件
    ├── index.md         # 首页
    ├── config.md        # 配置文档
    ├── faq.md           # 常见问题
    ├── best-practices.md # 最佳实践
    ├── guide/           # 指南
    │   ├── instruction.md
    │   └── start.md
    ├── event/           # 事件文档
    │   ├── index.md
    │   ├── private.md
    │   └── channel.md
    ├── module/          # 模块文档
    │   ├── client.md
    │   ├── guild.md
    │   ├── role.md
    │   ├── channel.md
    │   └── user.md
    └── segment/         # 消息段文档
        ├── index.md
        ├── text.md
        ├── image.md
        └── ...
```

## 本地开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run docs:dev
```

文档将在 http://localhost:5566 上可访问。

### 构建文档

```bash
pnpm run docs:build
```

构建产物将输出到 `docs/dist/` 目录。

### 预览构建结果

```bash
pnpm run docs:serve
```

## 编写文档

### Markdown 规范

1. **Front Matter**: 每个文档文件应包含 front matter：

```markdown
---
layout: doc
---

# 页面标题
```

2. **标题层级**: 使用合理的标题层级，从 h1 开始

3. **代码块**: 使用语言标识符：

```markdown
\`\`\`javascript
const client = new Client({...})
\`\`\`
```

4. **链接**: 使用相对路径链接到其他文档：

```markdown
查看 [快速开始](./guide/start.md)
```

### 文档模板

#### API 文档模板

```markdown
---
layout: doc
---

# 模块名称

模块的简短描述。

## 方法名称

方法的描述。

**参数**:

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| param1 | string | true | 参数描述 |

**返回值**: Promise\<ReturnType>

**示例**:

\`\`\`javascript
// 代码示例
\`\`\`
```

#### 指南文档模板

```markdown
---
layout: doc
---

# 指南标题

## 前置条件

列出需要的前置知识或设置。

## 步骤 1

详细说明...

\`\`\`javascript
// 示例代码
\`\`\`

## 步骤 2

...

## 总结

总结要点。

## 下一步

- [相关主题](./related.md)
```

## 配置导航和侧边栏

编辑 `docs/.vitepress/config.mts`：

```typescript
export default defineConfig({
  themeConfig: {
    nav: [
      { text: '开始', link: '/guide/start' },
      // 添加更多导航项
    ],
    sidebar: [
      {
        text: '分类名称',
        items: [
          { text: '页面标题', link: '/path/to/page' }
        ]
      }
    ]
  }
})
```

## 部署

文档使用 GitHub Actions 自动部署到 GitHub Pages。

### 自动部署流程

1. 当代码推送到 `master` 分支时触发
2. 安装依赖并构建文档
3. 部署到 GitHub Pages

### 手动触发部署

在 GitHub 仓库的 Actions 标签页，选择 "Docs" workflow，点击 "Run workflow"。

### 查看部署状态

访问 https://github.com/zhinjs/kook-client/actions 查看部署状态。

部署成功后，文档将在 https://zhinjs.github.io/kook-client/ 可访问。

## 贡献流程

1. Fork 本仓库
2. 创建特性分支
3. 编写或修改文档
4. 本地测试确保构建成功
5. 提交 Pull Request

### 提交信息规范

- `docs: 添加 XXX 文档`
- `docs: 更新 XXX 说明`
- `docs: 修复 XXX 链接`

## 注意事项

1. **内部链接**: 使用 `.md` 扩展名，VitePress 会自动转换
2. **图片**: 放在 `docs/src/assets/` 目录下
3. **构建产物**: `docs/dist/` 已被 .gitignore，不要提交
4. **相对路径**: 所有链接使用相对路径，不要使用绝对路径
5. **中文支持**: 确保文件使用 UTF-8 编码

## 常见问题

### 本地预览时样式异常？

清除 VitePress 缓存：

```bash
rm -rf docs/.vitepress/cache
```

### 链接显示 404？

检查：
1. 文件路径是否正确
2. 是否包含 `.md` 扩展名
3. 是否在 config.mts 中配置了路由

### 部署后某些页面 404？

确保 `docs/.vitepress/config.mts` 中的 `base` 配置正确：

```typescript
export default defineConfig({
  base: '/kook-client/',
  // ...
})
```

## 资源链接

- [VitePress 官方文档](https://vitepress.dev/)
- [Markdown 语法](https://www.markdownguide.org/)
- [GitHub Pages](https://pages.github.com/)

## 联系方式

如有问题，请：
- 提交 [Issue](https://github.com/zhinjs/kook-client/issues)
- 加入 QQ 群：446290761
