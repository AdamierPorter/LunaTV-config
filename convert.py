import base58

# 读取本地 JSON 文件
with open("luna-tv-config.json", "r", encoding="utf-8") as f:
    data = f.read().encode("utf-8")

# 转 Base58
encoded = base58.b58encode(data).decode("utf-8")

# 写入文件
with open("luna-tv-config.base58.txt", "w", encoding="utf-8") as f:
    f.write(encoded)

print("Base58 conversion completed.")
