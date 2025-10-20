"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeString = analyzeString;
exports.loadData = loadData;
exports.saveData = saveData;
exports.sendError = sendError;
const crypto_js_1 = __importDefault(require("crypto-js"));
const DATA_FILE = 'data.json';
function analyzeString(value) {
    if (typeof value !== 'string') {
        throw new Error('Value must be a string');
    }
    const length = value.length;
    const lowerValue = value.toLowerCase();
    const is_palindrome = lowerValue === lowerValue.split('').reverse().join('');
    const unique_characters = new Set(value.toLowerCase()).size;
    const word_count = value.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sha256_hash = crypto_js_1.default.SHA256(value).toString();
    const character_frequency_map = {};
    for (const char of value.toLowerCase()) {
        character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }
    return { length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map };
}
function loadData() {
    try {
        const fs = require('fs');
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        const map = new Map();
        parsed.forEach(s => map.set(s.id, s));
        return map;
    }
    catch (error) {
        return new Map();
    }
}
function saveData(data) {
    const fs = require('fs');
    const array = Array.from(data.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(array, null, 2));
}
function sendError(res, status, message) {
    return res.status(status).json({ error: message });
}
//# sourceMappingURL=helpers.js.map