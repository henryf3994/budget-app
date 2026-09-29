import { describe, expect, it } from 'vitest';
import { HEALTH_BAR_CELL_COUNT, getHealthBarCells, normalizePercentages } from './categoryMath.js';

describe('normalizePercentages', () => {
  it('保留原始百分比並計算寬度', () => {
    const result = normalizePercentages([
      { name: 'A', percentage: '30.0' },
      { name: 'B', percentage: '70.0' }
    ]);
    expect(result).toEqual([
      { name: 'A', percentage: '30.0', widthPercent: 30 },
      { name: 'B', percentage: '70.0', widthPercent: 70 }
    ]);
  });

  it('四捨五入造成的誤差由最後一項吸收，總和必定為 100', () => {
    const result = normalizePercentages([
      { name: 'A', percentage: '33.3' },
      { name: 'B', percentage: '33.3' },
      { name: 'C', percentage: '33.3' }
    ]);
    const widths = result.map(item => item.widthPercent);
    expect(widths[0]).toBeCloseTo(33.3, 5);
    expect(widths[1]).toBeCloseTo(33.3, 5);
    expect(widths[2]).toBeCloseTo(33.4, 5);
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(100, 5);
  });

  it('百分比全為 0 時保持 0（不強制填滿）', () => {
    const result = normalizePercentages([{ name: 'A', percentage: 0 }, { name: 'B' }]);
    expect(result.map(item => item.widthPercent)).toEqual([0, 0]);
  });

  it('空陣列回傳空陣列', () => {
    expect(normalizePercentages([])).toEqual([]);
  });
});

describe('getHealthBarCells', () => {
  it('固定產生 HEALTH_BAR_CELL_COUNT 格', () => {
    const cells = getHealthBarCells([
      { name: 'A', widthPercent: 50 },
      { name: 'B', widthPercent: 50 }
    ]);
    expect(cells).toHaveLength(HEALTH_BAR_CELL_COUNT);
    expect(cells.filter(c => c.category.name === 'A')).toHaveLength(HEALTH_BAR_CELL_COUNT / 2);
  });

  it('總寬度為 0 時回傳空陣列', () => {
    expect(getHealthBarCells([{ name: 'A', widthPercent: 0 }])).toEqual([]);
    expect(getHealthBarCells([])).toEqual([]);
  });

  it('比例不整除時仍填滿所有格數，且不重複超出', () => {
    const cells = getHealthBarCells([
      { name: 'A', widthPercent: 33.3 },
      { name: 'B', widthPercent: 33.3 },
      { name: 'C', widthPercent: 33.4 }
    ]);
    expect(cells).toHaveLength(HEALTH_BAR_CELL_COUNT);
    expect(cells.every(cell => Boolean(cell.category))).toBe(true);
  });

  it('負數百分比視為 0', () => {
    const cells = getHealthBarCells([
      { name: 'A', widthPercent: -10 },
      { name: 'B', widthPercent: 100 }
    ]);
    expect(cells).toHaveLength(HEALTH_BAR_CELL_COUNT);
    expect(cells.every(cell => cell.category.name === 'B')).toBe(true);
  });
});
