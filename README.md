# 个人博客

## 本地开发

```bash
npm install
npm run dev
```

## 校验

```bash
npm run check
npm test
```

## 构建

```bash
npm run build
```

## 部署到 Vercel

1. 将仓库导入 Vercel。
2. Framework Preset 选择 `Astro`。
3. 保持默认构建命令 `npm run build` 与输出目录 `dist`。
4. 首次上线后，把 `astro.config.mjs` 和 `src/data/site.ts` 里的站点域名替换为真实地址。

当前 `site` 使用的是占位域名 `https://example-blog.vercel.app`，正式部署前请按实际线上地址替换。
