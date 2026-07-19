import { describe, expect, it } from 'vitest';
import { parseAIJson } from '@/utils/parse-ai-json.js';

describe('parseAIJson', () => {
  it('parses plain and fenced JSON', () => {
    expect(parseAIJson('{"score":80}')).toEqual({ score: 80 });
    expect(parseAIJson('```json\n{"score":80}\n```')).toEqual({ score: 80 });
  });

  it('extracts the first valid balanced object around prose and braces', () => {
    const content = String.raw`Reasoning {not json}. Result: {"message":"value with } and \"quotes\"","score":80} trailing {notes}`;
    expect(parseAIJson(content)).toEqual({ message: 'value with } and "quotes"', score: 80 });
  });
});
