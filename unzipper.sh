#!/bin/bash
# 指定需要解压的文件夹路径
TARGET_FOLDER="$(pwd)/Codes/notion-pages/docs"

# 切换到目标文件夹
cd "$TARGET_FOLDER"
echo "The current working directory is: $(pwd)"
# 遍历文件夹中的所有 .zip 文件并解压
for zip_file in *.zip; do
    # 检查是否是文件
    if [ -f "$zip_file" ]; then
        # 解压 ZIP 文件到当前目录
        unzip -o "$zip_file"
        # 如果需要，可以解压到指定目录
        # unzip -o "$zip_file" -d /path/to/destination
    fi
done
