# Notion Pages

> 把 Notion 上自己的文章和收集的内容分享出来（Notion 的发布站点国内访问不了）

## 折腾站点遇到的坑

1. Notion 导出得到的产物是.zip
2. Mac 上`unzip`解压文件可能会遇到[illegal-byte-sequence](https://stackoverflow.com/questions/77206910/error-illegal-byte-sequence-when-unzipping-zip-file-parts-on-mac)报错，解决方案是`brew install unzip`更新大法好！
3. 解压出来的 html 文件在浏览器上的样式没毛病，但是为了兼容移动端的展示友好，可以看到`index.js`脚本内的处理逻辑（给每个文件都插入了`style标签以及favicon`）
