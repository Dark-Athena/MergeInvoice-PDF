# PDF发票合并器 （MergeInvoice-PDF）

一个完全在浏览器本地运行的PDF合并工具，支持多种布局方式，无需上传到服务器，保护您的隐私。

## 功能特性

- ✅ **批量合并PDF** - 支持一次选择多个PDF文件进行合并
- ✅ **灵活布局** - 支持每页2张、3张、4张三种布局方式
- ✅ **拖拽上传** - 支持拖拽文件上传和文件顺序调整
- ✅ **本地处理** - 所有处理在浏览器本地完成，不上传任何数据
- ✅ **完全免费** - 无需注册，无限次使用
- ✅ **即用即走** - 无需安装任何软件

## 使用方法

1. 在浏览器中打开 `index.html` 文件
2. 拖拽或点击上传多个PDF文件
3. 选择每页显示的PDF数量（2/3/4张）
4. 点击"生成预览"按钮进行合并(预览效果不代表实际生成品质)
5. 点击"下载合并的PDF"保存文件

## 技术栈

- **pdf-lib** - PDF处理库，用于合并PDF文件
- 纯HTML/CSS/JavaScript - 无需任何构建工具

## 浏览器兼容性

支持所有现代浏览器：
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 本地运行

直接双击 `index.html` 文件即可在浏览器中打开使用（该方式预览时部分中文显示可能不正常，但不影响使用）。

或者使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (http-server)
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 隐私说明

所有PDF文件均在您的浏览器本地处理，不会上传到任何服务器。您的数据完全安全。
但需要访问网络上的js静态资源来运行：
1. https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js
2. https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js
3. https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js
4. cmaps - https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/

## 适用场景

- 财务人员批量打印发票
- 合并多个PDF文件便于归档
- 节省打印纸张成本
- 邮件发送多个PDF时合并为一个文件

## 开源协议

MIT License

## 致谢

本项目使用了以下开源库：
- [pdf-lib](https://pdf-lib.js.org/) - PDF处理核心库
- [pdfjs-dist](https://github.com/mozilla/pdf.js) 
