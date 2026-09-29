import { describe, expect, it } from 'vitest';
import { createId } from './id.js';

describe('createId', () => {
  it('帶上呼叫端指定的前綴', () => {
    expect(createId('tx_')).toMatch(/^tx_/);
    expect(createId('temp_rec_')).toMatch(/^temp_rec_/);
    expect(createId()).toMatch(/^id_/);
  });

  it('同一毫秒內連續呼叫也不會重複', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId('tx_')));
    expect(ids.size).toBe(500);
  });

  it('不同前綴產生不同的 id', () => {
    const a = createId('tx_');
    const b = createId('rec_');
    expect(a).not.toBe(b);
    expect(a.replace(/^tx_/, '')).not.toBe(b.replace(/^rec_/, ''));
  });
});
