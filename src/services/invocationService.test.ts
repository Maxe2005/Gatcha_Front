import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  invocationApi: { post: vi.fn() },
}));
vi.mock('./logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { invocationApi } from './api';
import { invocationService } from './invocationService';
import { ApiError, ErrorTypes } from './apiClient';

const mockedPost = invocationApi.post as unknown as ReturnType<typeof vi.fn>;

describe('invocationService.invoke', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects an empty username without calling the API', async () => {
    await expect(invocationService.invoke('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('throws when the API returns no data', async () => {
    mockedPost.mockResolvedValue({ data: null });

    await expect(invocationService.invoke('alice')).rejects.toThrow(ApiError);
  });

  it('rejects a monster with neither id, nom nor name', async () => {
    mockedPost.mockResolvedValue({ data: { rang: 'RARE' } });

    await expect(invocationService.invoke('alice')).rejects.toThrow(ApiError);
  });

  it('normalizes a monster response using the French API field names', async () => {
    mockedPost.mockResolvedValue({
      data: {
        nom: 'Dracolion',
        rang: 'EPIC',
        element: 'FEU',
        stats: { hp: 100, atk: 20, def: 15, vit: 10 },
        description: 'Une bête légendaire',
        skills: [{ name: 'Griffe' }],
      },
    });

    const result = await invocationService.invoke('alice');

    expect(result).toEqual({
      id: 'Dracolion',
      name: 'Dracolion',
      element: 'feu',
      rank: 'EPIC',
      level: 1,
      stats: { hp: 100, atk: 20, def: 15, vit: 10 },
      description: 'Une bête légendaire',
      skills: [{ name: 'Griffe' }],
      imageUrl: '',
    });
  });

  it('falls back to defaults for missing optional fields', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'm-1' } });

    const result = await invocationService.invoke('alice');

    expect(result).toEqual({
      id: 'm-1',
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
