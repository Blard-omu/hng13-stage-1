export interface AnalyzeRequest {
    value: string;
  }
  
  export interface StringProperties {
    length: number;
    is_palindrome: boolean;
    unique_characters: number;
    word_count: number;
    sha256_hash: string;
    character_frequency_map: Record<string, number>;
  }
  
  export interface StoredString {
    id: string;
    value: string;
    properties: StringProperties;
    created_at: string;
  }
  
  export interface AnalyzeResponse {
    id: string;
    value: string;
    properties: StringProperties;
    created_at: string;
  }
  
  export interface FilterResponse {
    data: StoredString[];
    count: number;
    filters_applied?: Record<string, any>;
  }
  
  export interface NLFilterResponse {
    data: StoredString[];
    count: number;
    interpreted_query: {
      original: string;
      parsed_filters: Record<string, any>;
    };
  }

  export interface ErrorResponse {
    error: string;
  }