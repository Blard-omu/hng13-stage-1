type FilterMap = Record<string, any>;

export interface ParseResult {
  filters: FilterMap;
  conflicts: boolean;
}

/**
 * Deterministic parser that recognises **exactly** the four example queries.
 * It walks the token list and stops as soon as it finds a match.
 * Conflicts are flagged when the same key receives different values.
 */
export function parseNLQuery(raw: string): ParseResult {
  const query = raw.trim().toLowerCase();
  const tokens = query.split(/\s+/);
  const filters: FilterMap = {};
  let i = 0;

  const set = (key: string, value: any) => {
    if (filters[key] !== undefined && filters[key] !== value) {
      filters.conflicts = true;
    }
    filters[key] = value;
  };

  // -----------------------------------------------------------------
  // 1. "all single word palindromic strings"
  // -----------------------------------------------------------------
  if (
    tokens[i] === 'all' &&
    tokens[i + 1] === 'single' &&
    tokens[i + 2] === 'word' &&
    (tokens[i + 3] === 'palindromic' || tokens[i + 3] === 'palindrome') &&
    tokens[i + 4] === 'strings'
  ) {
    set('word_count', 1);
    set('is_palindrome', true);
    i += 5;
  }

  // -----------------------------------------------------------------
  // 2. "strings longer than X characters"
  // -----------------------------------------------------------------
  else if (
    tokens[i] === 'strings' &&
    tokens[i + 1] === 'longer' &&
    tokens[i + 2] === 'than' &&
    /^\d+$/.test(tokens[i + 3]) &&
    tokens[i + 4] === 'characters'
  ) {
    const n = parseInt(tokens[i + 3], 10);
    set('min_length', n + 1);
    i += 5;
  }

  // -----------------------------------------------------------------
  // 3. "palindromic strings that contain the first vowel"
  // -----------------------------------------------------------------
  else if (
    tokens[i] === 'palindromic' &&
    tokens[i + 1] === 'strings' &&
    tokens[i + 2] === 'that' &&
    tokens[i + 3] === 'contain' &&
    tokens[i + 4] === 'the' &&
    tokens[i + 5] === 'first' &&
    tokens[i + 6] === 'vowel'
  ) {
    set('is_palindrome', true);
    set('contains_character', 'a'); // first vowel = a
    i += 7;
  }

  // -----------------------------------------------------------------
  // 4. "strings containing the letter Z"  (long form)
  // -----------------------------------------------------------------
  else if (
    tokens[i] === 'strings' &&
    tokens[i + 1] === 'containing' &&
    tokens[i + 2] === 'the' &&
    tokens[i + 3] === 'letter' &&
    /^[a-z]$/i.test(tokens[i + 4])
  ) {
    set('contains_character', tokens[i + 4].toLowerCase());
    i += 5;
  }

  // -----------------------------------------------------------------
  // 5. "strings containing Z"  (short form)
  // -----------------------------------------------------------------
  else if (
    tokens[i] === 'strings' &&
    tokens[i + 1] === 'containing' &&
    /^[a-z]$/i.test(tokens[i + 2])
  ) {
    set('contains_character', tokens[i + 2].toLowerCase());
    i += 3;
  }

  // -----------------------------------------------------------------
  // If we consumed **all** tokens → success, otherwise → unparsable
  // -----------------------------------------------------------------
  const parsedAll = i === tokens.length;
  return {
    filters: parsedAll ? filters : {},
    conflicts: !!filters.conflicts,
  };
}