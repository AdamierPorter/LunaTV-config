import requests
import base58
import os

# JSON 文件 URL
url = "https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/luna-tv-config.json"

# 下载 JSON
response = requests.get(url)
response.raise_for_status()
json_str = response.text

# 转 Base58
base58_str = base58.b58encode(json_str.encode("utf-8")).decode("utf-8")

# 输出到根目录文件
output_file = os.path.join(os.getcwd(), "luna_tv_config_base58.txt")
with open(output_file, "w", encoding="utf-8") as f:
    f.write(base58_str)

# 打印前 200 个字符到日志，方便查看
print("✅ Base58 转换完成，前200字符预览：")
print(base58_str[:200] + " ...")
