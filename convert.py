import base58
import requests
import sys

# JSON 文件 URL
url = "https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/luna-tv-config.json"

try:
    response = requests.get(url)
    response.raise_for_status()
except Exception as e:
    print(f"Error fetching JSON: {e}")
    sys.exit(1)

data = response.text.encode('utf-8')

# 转 Base58
encoded = base58.b58encode(data).decode('utf-8')

# 写入文件
with open("luna-tv-config.base58.txt", "w") as f:
    f.write(encoded)

print("Base58 conversion completed.")
