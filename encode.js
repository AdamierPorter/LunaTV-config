const fs = require('fs');
const path = require('path');
const bs58 = require('bs58');

const inputFile = path.join(__dirname, 'luna-tv-config.json');
const outputFile = path.join(__dirname, 'LunaTV-config.txt');

// 读取 JSON 文件
const jsonData = fs.readFileSync(inputFile);

// 转 Base58
const base58Encoded = bs58.encode(jsonData);

// 写入输出文件
fs.writeFileSync(outputFile, base58Encoded);

console.log(`Base58 编码已生成: ${outputFile}`);
