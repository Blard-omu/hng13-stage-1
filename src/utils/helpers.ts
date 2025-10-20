import CryptoJS from 'crypto-js';
import { StoredString, ErrorResponse } from '../types';
import { Response } from 'express';


const DATA_FILE = 'data.json';

export function analyzeString(value: string): StoredString['properties'] {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  const length = value.length;
  const lowerValue = value.toLowerCase();
  const is_palindrome = lowerValue === lowerValue.split('').reverse().join('');
  const unique_characters = new Set(value.toLowerCase()).size;
  const word_count = value.trim().split(/\s+/).filter(w => w.length > 0).length;
  const sha256_hash = CryptoJS.SHA256(value).toString();
  const character_frequency_map: Record<string, number> = {};
  for (const char of value.toLowerCase()) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return { length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map };
}

export function loadData(): Map<string, StoredString> {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed: StoredString[] = JSON.parse(data);
    const map = new Map<string, StoredString>();
    parsed.forEach(s => map.set(s.id, s));
    return map;
  } catch (error) {
    return new Map();
  }
}

export function saveData(data: Map<string, StoredString>): void {
  const fs = require('fs');
  const array = Array.from(data.values());
  fs.writeFileSync(DATA_FILE, JSON.stringify(array, null, 2));
}


export function sendError(
  res: Response,
  status: 400 | 422,
  message: string
): Response<ErrorResponse> {
  return res.status(status).json({ error: message });
}