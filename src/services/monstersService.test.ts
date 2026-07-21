import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  monstersApi: { get: vi.fn(), delete: vi.fn() },
}));
vi.mock('./logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('./indexedDBService', () => ({
  getMonsterFromCache: vi.fn().mockResolvedValue(null),
  cacheMonster: vi.fn().mockResolvedValue(undefined),
  cacheMonsters: vi.fn().mockResolvedValue(undefined),
}));

import { monstersApi } from './api';
import { monstersService } from './monstersService';
import { ApiError, ErrorTypes } from './apiClient';

const mockedGet = monstersApi.get as unknown as ReturnType<typeof vi.fn>;
const mockedDelete = monstersApi.delete as unknown as ReturnType<typeof vi.fn>;

describe('monstersService.getMonster', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedDelete.mockReset();
  });

  it('rejects a missing monster ID without calling the API', async () => {
    await expect(monstersService.getMonster('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('rejects a monster with neither id, nom nor name', async () => {
    mockedGet.mockResolvedValue({ data: { rang: 'RARE' } });

    await expect(monstersService.getMonster('m-1')).rejects.toThrow(ApiError);
  });

  it('rejects an invalid element', async () => {
    mockedGet.mockResolvedValue({ data: { id: 'm-1', element: 'PLASMA' } });

    await expect(monstersService.getMonster('m-1')).rejects.toThrow(ApiError);
  });

  it('rejects non-numeric stats', async () => {
    mockedGet.mockResolvedValue({
      data: { id: 'm-1', stats: { hp: 'beaucoup' } },
    });

    await expect(monstersService.getMonster('m-1')).rejects.toThrow(ApiError);
  });

  it('rejects negative stats', async () => {
    mockedGet.mockResolvedValue({ data: { id: 'm-1', stats: { hp: -10 } } });

    await expect(monstersService.getMonster('m-1')).rejects.toThrow(ApiError);
  });

  it('normalizes a monster response, preferring nom/rang over name/rank', async () => {
    mockedGet.mockResolvedValue({
      data: {
        id: 'm-1',
        nom: 'Dracolion',
        name: 'ignored',
        rang: 'EPIC',
        rank: 'ignored',
        element: 'FIRE',
        level: 5,
        stats: { hp: 100, atk: 20, def: 15, vit: 10 },
        description: 'Une bête légendaire',
        skills: [{ name: 'Griffe' }],
        imageUrl: 'https://example.com/dracolion.webp',
      },
    });

    const result = await monstersService.getMonster('m-1');

    expect(result).toEqual({
      id: 'm-1',
      name: 'Dracolion',
      element: 'fire',
      rank: 'EPIC',
      level: 5,
      stats: { hp: 100, atk: 20, def: 15, vit: 10 },
      description: 'Une bête légendaire',
      skills: [{ name: 'Griffe' }],
      imageUrl: 'https://example.com/dracolion.webp',
    });
  });

  it('falls back to defaults for missing optional fields', async () => {
    mockedGet.mockResolvedValue({ data: { id: 'm-2' } });

    const result = await monstersService.getMonster('m-2');

    expect(result).toEqual({
      id: 'm-2',
      name: 'Unknown',
      element: 'neutre',
      rank: 'COMMON',
      level: 1,
      stats: { hp: 0, atk: 0, def: 0, vit: 0 },
      description: '',
      skills: [],
      imageUrl: '',
    });
  });
});

describe('monstersService.getMonsters', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('rejects an empty array of IDs without calling the API', async () => {
    await expect(monstersService.getMonsters([])).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('rejects a non-array response', async () => {
    mockedGet.mockResolvedValue({ data: { not: 'an array' } });

    await expect(monstersService.getMonsters(['m-1'])).rejects.toThrow(
      ApiError
    );
  });
});

describe('monstersService.getMonstersByPlayer', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('rejects an empty username without calling the API', async () => {
    await expect(
      monstersService.getMonstersByPlayer('')
    ).rejects.toMatchObject({ type: ErrorTypes.VALIDATION });
    expect(mockedGet).not.toHaveBeenCalled();
  });
});

describe('monstersService.deleteMonster', () => {
  beforeEach(() => {
    mockedDelete.mockReset();
  });

  it('rejects a missing monster ID without calling the API', async () => {
    await expect(monstersService.deleteMonster('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedDelete).not.toHaveBeenCalled();
  });
});
