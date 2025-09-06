import base58

def json_to_base58(json_str: str) -> str:
    """把 JSON 字符串转换成 Base58"""
    encoded = base58.b58encode(json_str.encode("utf-8"))
    return encoded.decode("utf-8")

def main():
    # 读取仓库里的 JSON 文件
    with open("luna-tv-config.json", "r", encoding="utf-8") as f:
        json_str = f.read()

    # 转换
    base58_str = json_to_base58(json_str)

    # 保存结果
    with open("luna_tv_config_base58.txt", "w", encoding="utf-8") as f:
        f.write(base58_str)

    print("✅ 转换完成，结果保存到 luna_tv_config_base58.txt")

if __name__ == "__main__":
    main()
