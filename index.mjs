import {
    readdir as _readdir,
    readFile as _readFile,
    writeFile as _writeFile,
    rename as _rename,
} from "fs";
import { extname, basename, join } from "path";
import { load } from "cheerio";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);
const readdir = promisify(_readdir);
const readFile = promisify(_readFile);
const writeFile = promisify(_writeFile);
const rename = promisify(_rename);

const directoryPath = "./docs";
const MOBILE_FONT_SIZE_STYLE = `
<meta name="viewport" content="user-scalable=no">
<style>
    html{font-size:120%;}
</style>
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
<script src="device.js"></script>
`;
const titles = [];
const unrenamedTitles = [];
const indexPath = `${directoryPath}/index.html`;

async function handleAllHTMLMobileStyle() {
    try {
        const files = await readdir(directoryPath);
        const htmlFiles = files.filter((file) => {
            return (
                extname(file) === ".html" && basename(file, ".html") !== "index"
            );
        });

        await Promise.all(
            htmlFiles.map(async (file) => {
                const filePath = join(directoryPath, file);
                try {
                    const content = await readFile(filePath, "utf8");
                    const $ = load(content);
                    if (!$("title").length) {
                        console.error(`Error: No title found in ${file}`);
                        return;
                    }
                    const title = $("title").text();
                    // 将提取的title内容添加到数组中
                    titles.push({ title, filePath });
                    if (content.includes(MOBILE_FONT_SIZE_STYLE)) {
                        return;
                    }
                    const newContent = `${content.replace(
                        "</title>",
                        `</title>${MOBILE_FONT_SIZE_STYLE}`
                    )}`;
                    await writeFile(filePath, newContent, "utf8");
                    console.log(`File has been updated: ${filePath}`);
                } catch (err) {
                    console.error(
                        `Error reading or writing file: ${file}`,
                        err
                    );
                }
            })
        );

        handleIndexHTML();
    } catch (err) {
        console.error("Error reading directory", err);
    }
}

async function handleIndexHTML() {
    try {
        // 读取 index.html 文件内容
        const content = await readFile(indexPath, "utf8");

        // 使用正则表达式找到 id 为 list 的 div 的结束标签
        const listDivRegex = /(<div id="list">)([\s\S]*?)(<\/div>)/i;
        const listDivMatch = content.match(listDivRegex);

        if (listDivMatch) {
            // 创建新的 a 标签字符串
            const newATags = titles
                .map(({ title, filePath }) => {
                    const origin = `https://githubjike.github.io/notion-pages/${filePath.replace(
                        "docs/",
                        ""
                    )}`;

                    return `<a href="${origin}" target="_blank">${title}</a>`;
                })
                .join("");

            // 将新的 a 标签插入到 <div id="list"> 和 </div> 之间
            const newListContent = `<div id="list">${newATags}</div>`;

            // 将新的完整内容替换原始的 <div id="list">...</div>
            const newContent = content.replace(listDivRegex, newListContent);

            // 将新内容写回 index.html 文件
            await writeFile(indexPath, newContent, "utf8");
            console.log("index.html has been updated with new titles.");
        } else {
            console.error('Could not find <div id="list"> in index.html');
        }
    } catch (err) {
        console.error("Error reading or writing index.html file", err);
    }
}

async function renameHTMLFiles() {
    try {
        const files = await readdir(directoryPath);
        const filteredFiles = files.filter((file) => {
            const bName = basename(file);
            return (
                bName !== "index.html" &&
                unrenamedTitles.includes(bName) &&
                extname(file).toLowerCase() === ".html"
            );
        });

        await Promise.all(
            filteredFiles.map(async (file) => {
                const filePath = join(directoryPath, file);
                const content = await readFile(filePath, "utf8");
                const $ = load(content);
                if (!$("title").length) {
                    console.error(`Error: No title found in ${file}`);
                    return;
                }
                const title = $("title").text();
                const newFilePath = join(directoryPath, `${title}.html`);
                await rename(filePath, newFilePath);
                console.log(`Renamed ${file} to ${title}.html`);
            })
        );
        handleAllHTMLMobileStyle();
        console.log("All HTML files have been renamed successfully.");
    } catch (err) {
        console.error("Error renaming HTML files:", err);
    }
}

async function unzipFiles() {
    try {
        // 读取 ZIP 文件所在的目录
        const files = await readdir(directoryPath);

        // 过滤出所有的 ZIP 文件
        const zipFiles = files.filter((file) => extname(file) === ".zip");

        if (zipFiles.length > 0) {
            // 遍历并解压每个 ZIP 文件
            await Promise.all(
                zipFiles.map(async (zipFile) => {
                    const zipFilePath = join(directoryPath, zipFile);
                    const command = `unzip -o "${zipFilePath}" -d "${directoryPath}"`;

                    try {
                        // 执行 unzip 命令
                        const { stdout, stderr } = await execAsync(command);

                        const n = stdout
                            .split(".zip")[1]
                            .replace("inflating: ./docs/", "")
                            .trim();
                        unrenamedTitles.push(n);
                        console.log(`unzipped successfully:::${n}`);
                    } catch (error) {
                        console.error(
                            `Error unzipping file ${zipFile}:`,
                            error
                        );
                    }
                })
            );
        }

        await renameHTMLFiles();
    } catch (err) {
        console.error("Error reading directory", err);
    }
}

(async () => {
    await unzipFiles();
})();
