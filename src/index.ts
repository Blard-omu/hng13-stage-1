import express, { Request, Response, NextFunction } from 'express';
import {
  AnalyzeRequest,
  AnalyzeResponse,
  ErrorResponse,
  FilterResponse,
  NLFilterResponse,
  StoredString,
} from './types';
import { analyzeString, loadData, saveData, sendError } from './utils/helpers';
import { parseNLQuery } from './utils/nlParser';
import CryptoJS from 'crypto-js';

const app = express();
const port = process.env.PORT || 3000;
let db = loadData();

app.use(express.json());
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  next();
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

/* --------------------------------------------------------------
   1. POST /strings
   -------------------------------------------------------------- */
app.post(
  '/strings',
  (req: Request, res: Response<AnalyzeResponse | ErrorResponse>) => {
    try {
      const { value } = req.body as AnalyzeRequest;
      if (!value) return res.status(400).json({ error: 'Missing "value" field' });
      if (typeof value !== 'string') return res.status(422).json({ error: 'Value must be a string' });

      const properties = analyzeString(value);
      const id = properties.sha256_hash;
      const created_at = new Date().toISOString();

      if (db.has(id)) return res.status(409).json({ error: 'String already exists' });

      const entry: StoredString = { id, value, properties, created_at };
      db.set(id, entry);
      saveData(db);
      res.status(201).json(entry);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  }
);

/* --------------------------------------------------------------
   2. GET /strings/filter-by-natural-language
   -------------------------------------------------------------- */
app.get(
  '/strings/filter-by-natural-language',
  (req: Request<{}, NLFilterResponse | ErrorResponse>, res: Response<NLFilterResponse | ErrorResponse>) => {
    const raw = req.query.query as string | undefined;

    if (!raw) return sendError(res, 400, 'Missing required query parameter: query');

    const { filters, conflicts } = parseNLQuery(raw);
    if (Object.keys(filters).length === 0) return sendError(res, 400, 'Unable to parse natural language query');
    if (conflicts) return sendError(res, 422, 'Query parsed but resulted in conflicting filters');

    let data = Array.from(db.values());
    data = data.filter(entry => {
      const p = entry.properties;
      if (filters.is_palindrome !== undefined && p.is_palindrome !== filters.is_palindrome) return false;
      if (filters.min_length !== undefined && p.length < filters.min_length) return false;
      if (filters.max_length !== undefined && p.length > filters.max_length) return false;
      if (filters.word_count !== undefined && p.word_count !== filters.word_count) return false;
      if (filters.contains_character !== undefined) return entry.value.toLowerCase().includes(filters.contains_character);
      return true;
    });

    res.json({
      data,
      count: data.length,
      interpreted_query: { original: raw, parsed_filters: filters },
    } satisfies NLFilterResponse);
  }
);

/* --------------------------------------------------------------
   3. GET /strings (filtered list)
   -------------------------------------------------------------- */
app.get(
  '/strings',
  (req: Request, res: Response<FilterResponse | ErrorResponse>) => {
    try {
      const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
      const filters: Record<string, any> = {};

      if (is_palindrome !== undefined) {
        if (is_palindrome === 'true') filters.is_palindrome = true;
        else if (is_palindrome === 'false') filters.is_palindrome = false;
        else return res.status(400).json({ error: 'Invalid value for is_palindrome. Must be "true" or "false".' });
      }

      if (min_length !== undefined) {
        const num = parseInt(min_length as string, 10);
        if (isNaN(num) || num < 0) return res.status(400).json({ error: 'Invalid min_length. Must be a non-negative integer.' });
        filters.min_length = num;
      }

      if (max_length !== undefined) {
        const num = parseInt(max_length as string, 10);
        if (isNaN(num) || num < 0) return res.status(400).json({ error: 'Invalid max_length. Must be a non-negative integer.' });
        filters.max_length = num;
      }

      if (word_count !== undefined) {
        const num = parseInt(word_count as string, 10);
        if (isNaN(num) || num <= 0) return res.status(400).json({ error: 'Invalid word_count. Must be a positive integer.' });
        filters.word_count = num;
      }

      if (contains_character !== undefined) {
        const char = contains_character as string;
        if (typeof char !== 'string' || char.length !== 1) return res.status(400).json({ error: 'Invalid contains_character. Must be a single character.' });
        filters.contains_character = char.toLowerCase();
      }

      if (filters.min_length !== undefined && filters.max_length !== undefined) {
        if (filters.min_length > filters.max_length) return res.status(400).json({ error: 'min_length cannot be greater than max_length.' });
      }

      let data = Array.from(db.values());
      if (Object.keys(filters).length > 0) {
        data = data.filter(entry => {
          const p = entry.properties;
          if (filters.is_palindrome !== undefined && p.is_palindrome !== filters.is_palindrome) return false;
          if (filters.min_length !== undefined && p.length < filters.min_length) return false;
          if (filters.max_length !== undefined && p.length > filters.max_length) return false;
          if (filters.word_count !== undefined && p.word_count !== filters.word_count) return false;
          if (filters.contains_character !== undefined) return entry.value.toLowerCase().includes(filters.contains_character);
          return true;
        });
      }

      res.json({ data, count: data.length, filters_applied: filters });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  }
);

/* --------------------------------------------------------------
   4. GET /strings/:string_value  – **Changed to use raw string**
   -------------------------------------------------------------- */
app.get(
  '/strings/:string_value',
  (req: Request<{ string_value: string }>, res: Response<AnalyzeResponse | ErrorResponse>) => {
    const string_value = decodeURIComponent(req.params.string_value); // Decode URL-encoded string (e.g., "hello%20world" → "hello world")
    const id = CryptoJS.SHA256(string_value).toString(); // Compute hash to look up in DB
    const entry = db.get(id);
    if (!entry) return res.status(404).json({ error: 'String does not exist in the system' });
    res.json(entry);
  }
);

/* --------------------------------------------------------------
   5. DELETE /strings/:string_value  – **Changed to use raw string**
   -------------------------------------------------------------- */
app.delete(
  '/strings/:string_value',
  (req: Request<{ string_value: string }>, res: Response<ErrorResponse | void>) => {
    const string_value = decodeURIComponent(req.params.string_value); // Decode URL-encoded string
    const id = CryptoJS.SHA256(string_value).toString(); // Compute hash to look up in DB
    if (!db.delete(id)) return res.status(404).json({ error: 'String does not exist in the system' });
    saveData(db);
    res.status(204).send();
  }
);

/* --------------------------------------------------------------
   Server start
   -------------------------------------------------------------- */
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));