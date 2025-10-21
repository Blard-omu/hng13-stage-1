export interface ParseResult {
  filters: Record<string, any>;
  conflicts: boolean;
}

export function parseNLQuery(raw: string): ParseResult {
  const q = raw.trim().toLowerCase();
  const tokens = q.split(/\s+/);
  const filters: Record<string, any> = {};
  let i = 0;
  let matchedAny = false;

  const set = (k: string, v: any) => {
    if (filters[k] !== undefined && filters[k] !== v) filters.conflicts = true;
    filters[k] = v;
  };

  while (i < tokens.length) {
    let matched = false;

    // 1. "all single word palindromic strings"
    if (
      i + 4 < tokens.length &&
      tokens[i] === 'all' &&
      tokens[i + 1] === 'single' &&
      tokens[i + 2] === 'word' &&
      (tokens[i + 3] === 'palindromic' || tokens[i + 3] === 'palindrome') &&
      tokens[i + 4] === 'strings'
    ) {
      set('word_count', 1);
      set('is_palindrome', true);
      i += 5;
      matched = matchedAny = true;
      continue;
    }

    // 2. "strings longer than X characters"
    if (
      i + 4 < tokens.length &&
      tokens[i] === 'strings' &&
      tokens[i + 1] === 'longer' &&
      tokens[i + 2] === 'than' &&
      /^\d+$/.test(tokens[i + 3]) &&
      tokens[i + 4] === 'characters'
    ) {
      const n = parseInt(tokens[i + 3], 10);
      set('min_length', n + 1);
      i += 5;
      matched = matchedAny = true;
      continue;
    }

    // 3. "palindromic strings that contain the first vowel"
    if (
      i + 6 < tokens.length &&
      tokens[i] === 'palindromic' &&
      tokens[i + 1] === 'strings' &&
      tokens[i + 2] === 'that' &&
      tokens[i + 3] === 'contain' &&
      tokens[i + 4] === 'the' &&
      tokens[i + 5] === 'first' &&
      tokens[i + 6] === 'vowel'
    ) {
      set('is_palindrome', true);
      set('contains_character', 'a');
      i += 7;
      matched = matchedAny = true;
      continue;
    }

    // 4. "strings containing the letter Z"
    if (
      i + 4 < tokens.length &&
      tokens[i] === 'strings' &&
      tokens[i + 1] === 'containing' &&
      tokens[i + 2] === 'the' &&
      tokens[i + 3] === 'letter' &&
      /^[a-z]$/i.test(tokens[i + 4])
    ) {
      set('contains_character', tokens[i + 4].toLowerCase());
      i += 5;
      matched = matchedAny = true;
      continue;
    }

    // 5. short form "strings containing Z"
    if (
      i + 2 < tokens.length &&
      tokens[i] === 'strings' &&
      tokens[i + 1] === 'containing' &&
      /^[a-z]$/i.test(tokens[i + 2])
    ) {
      set('contains_character', tokens[i + 2].toLowerCase());
      i += 3;
      matched = matchedAny = true;
      continue;
    }

    // No match for this token → skip to next
    i++;
    if (!matched) break; // Stop if we can't match anything
  }

  // Additional conflict check: word_count=1 implies length >= 1
  if (filters.word_count === 1 && filters.min_length !== undefined && filters.min_length > 1) {
    filters.conflicts = true;
  }

  return {
    filters: matchedAny ? filters : {},
    conflicts: !!filters.conflicts,
  };
}