import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export function parseAIJson(content: string, errorMessage = 'AI provider returned invalid JSON. Please retry.'): unknown {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const candidates = [cleaned, ...findBalancedJsonCandidates(cleaned)];
  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');
  if (objectStart >= 0 && objectEnd > objectStart) candidates.push(cleaned.slice(objectStart, objectEnd + 1));
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart >= 0 && arrayEnd > arrayStart) candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));

  for (const candidate of new Set(candidates)) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      // Try the next extraction candidate.
    }
  }
  logger.error('AI JSON parsing failed', {
    contentLength: cleaned.length,
    firstCharacter: cleaned.at(0),
    lastCharacter: cleaned.at(-1),
    balancedCandidateCount: candidates.length - 1,
    hasCodeFence: content.includes('```'),
  });
  throw new AppError(errorMessage, 502);
}

function findBalancedJsonCandidates(value: string): string[] {
  const candidates: string[] = [];
  for (let start = 0; start < value.length; start += 1) {
    const opening = value[start];
    if (opening !== '{' && opening !== '[') continue;

    const stack: string[] = [];
    let inString = false;
    let escaped = false;
    for (let index = start; index < value.length; index += 1) {
      const character = value[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') {
        inString = true;
        continue;
      }
      if (character === '{' || character === '[') stack.push(character);
      else if (character === '}' || character === ']') {
        const expected = character === '}' ? '{' : '[';
        if (stack.pop() !== expected) break;
        if (stack.length === 0) {
          candidates.push(value.slice(start, index + 1));
          break;
        }
      }
    }
  }
  return candidates;
}
