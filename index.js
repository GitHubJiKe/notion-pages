const fs = require("fs")
const path = require("path")
const { exec } = require('child_process');



// 1. 为所有非index.html的html文件（从notion导出的文章文件）添加样式扩展，用来支持移动端的字体正常展示

const MOBILE_FONT_SIZE_STYLE = `<style>html{font-size:120%;}code[class*=language-],pre[class*=language-] {font-size:2rem !important;}</style>`
const titles = [];

function handleAllHTMLMobileStyle() {
    const directoryPath = './docs'; // 替换为你的文件夹路径

    // 读取目录下的所有文件
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory', err);
            return;
        }

        // 过滤出所有非index.html的.html文件
        const htmlFiles = files.filter(file => {
            return path.extname(file) === '.html' && path.basename(file, '.html') !== 'index';
        });

        // 读取每个文件的内容
        htmlFiles.forEach(file => {
            const filePath = path.join(directoryPath, file);
            fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                    console.error(`Error reading file: ${file}`, err);
                    return;
                }
                // 使用正则表达式提取<title>标签内容
                const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                    // 将提取的title内容添加到数组中
                    titles.push({ title: titleMatch[1], filePath });
                }

                if (titles.length === htmlFiles.length) {
                    handleIndexHTML()
                }
                if (content.includes(MOBILE_FONT_SIZE_STYLE)) {
                    return
                }
                // 你可以在这里进行进一步的操作，例如处理或输出文件内容
                const [start, end] = content.split("</title>")
                const newContent = `${start}</title>${MOBILE_FONT_SIZE_STYLE}${end}`;
                // 将处理后的新内容写入到文件
                fs.writeFile(filePath, newContent, 'utf8', (err) => {
                    if (err) {
                        console.error(`Error writing to file: ${file}`, err);
                        return;
                    }
                    console.log(`File has been updated: ${filePath}`);
                });
            });
        });
    });
}

// 2. 扩展index.html的内容，将所有的其他html文件，扩展成链接的形式插入到index.html文件内

function handleIndexHTML() {
    const indexPath = './docs/index.html'; // 替换为你的index.html文件的路径

    // 读取index.html文件
    fs.readFile(indexPath, 'utf8', (err, content) => {
        if (err) {
            console.error('Error reading index.html file', err);
            return;
        }

        // 使用正则表达式找到id为list的div的结束标签
        const listDivRegex = /(<div id="list">)([\s\S]*?)(<\/div>)/i;
        const listDivMatch = content.match(listDivRegex);

        if (listDivMatch) {
            // 创建新的a标签字符串
            const newATags = titles.map(({ title, filePath }) => {
                const origin = `https://githubjike.github.io/notion-pages/${filePath.replace('docs/', '')}`;

                return `<a href="${origin}" target="_blank">${title}</a>`
            }).join('');

            // 将新的a标签插入到<div id="list">和</div>之间
            const newListContent = `<div id="list">${newATags}</div>`;

            // 将新的完整内容替换原始的<div id="list">...</div>
            const newContent = content.replace(listDivRegex, newListContent);

            // 将新内容写回index.html文件
            fs.writeFile(indexPath, newContent, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to index.html file', err);
                    return;
                }
                console.log('index.html has been updated with new titles.');
            });
        } else {
            console.error('Could not find <div id="list"> in index.html');
        }
    });
}

// 3. 解压缩所有的文件
function unzipFiles() {

    // 定义要解压缩的 ZIP 文件所在的目录
    const zipFilesFolder = './docs';

    // 定义解压缩后文件的存放目录
    const destinationFolder = './docs';

    // 读取 ZIP 文件所在的目录
    fs.readdir(zipFilesFolder, (err, files) => {
        if (err) {
            console.error('Error reading directory', err);
            return;
        }

        // 过滤出所有的 ZIP 文件
        const zipFiles = files.filter(file => path.extname(file) === '.zip');
        let successCount = 0;
        // 遍历并解压每个 ZIP 文件
        zipFiles.forEach(zipFile => {
            const zipFilePath = path.join(zipFilesFolder, zipFile);
            const command = `unzip -o "${zipFilePath}" -d "${destinationFolder}"`;

            // 执行 unzip 命令
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error unzipping file ${zipFile}:`, error);
                } else {
                    successCount++;
                    if (successCount === zipFiles.length) {
                        handleAllHTMLMobileStyle()
                    }
                    console.log(`Unzipped file ${zipFile} successfully.`);
                }
            });
        });
    });

}

// 4. 执行逻辑

unzipFiles()