# markdown-it-mermaid

## 前言

vitepress 的文档解析是基于 markdown-it 做的，所以 vitepress 也兼容 markdown-it 社区的插件，这一篇文章主要就是来结束 vitepress 怎么接入 mermaid （流程图等）

## 接入 vitepress-plugin-mermaid

- [VitePress Plugin Mermaid](https://emersonbottero.github.io/vitepress-plugin-mermaid/)

安装

```shell
npm i vitepress-plugin-mermaid mermaid @mermaid-js/mermaid-mindmap -D
```

老王亲测，vitepress-1.0.0-beta 按 vitepress-plugin-mermaid 官方的安装方式引入，运行时会报错

相关 [issues](https://github.com/emersonbottero/vitepress-plugin-mermaid/issues/33)

原因时新版的 mermaid 不太兼容 vite 的环境，修改方式直接降低 mermaid 版本即可

```shell
npm i mermaid@9.1.7
```

## markdown-it-mermaid 语法

### 流程图

### 时序图
