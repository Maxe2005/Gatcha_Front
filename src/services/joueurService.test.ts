import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  joueurApi: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('./logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { joueurApi } from './api';
import { joueurService } from './joueurService';
import { ApiError, ErrorTypes } from './apiClient';

const mockedGet = joueurApi.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = joueurApi.post as unknown as ReturnType<typeof vi.fn>;
const mockedDelete = joueurApi.delete as unknown as ReturnType<typeof vi.fn>;

describe('joueurService.getPlayer', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('rejects an empty username without calling the API', async () => {
    await expect(joueurService.getPlayer('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('rejects a response with a missing username', async () => {
    mockedGet.mockResolvedValue({ data: { level: 3 } });

    await expect(joueurService.getPlayer('alice')).rejects.toThrow(ApiError);
  });

  it('rejects a response with a non-numeric level', async () => {
    mockedGet.mockResolvedValue({
      data: { username: 'alice', level: 'beaucoup' },
    });

    await expect(joueurService.getPlayer('alice')).rejects.toThrow(ApiError);
  });

  it('normalizes a full player response', async () => {
    mockedGet.mockResolvedValue({
      data: {
        username: 'alice',
        id: 'p-1',
        level: 5,
        experience: 420,
        gold: 100,
        gems: 10,
        tickets: 2,
        monsterIds: ['m-1', 'm-2'],
      },
    });

    const result = await joueurService.getPlayer('alice');

    expect(result).toEqual({
      username: 'alice',
      userId: 'p-1',
      level: 5,
      experience: 420,
      gold: 100,
      gems: 10,
      tickets: 2,
      monsterIds: ['m-1', 'm-2'],
    });
  });

  it('falls back to defaults for missing optional fields', async () => {
    mockedGet.mockResolvedValue({ data: { username: 'alice' } });

    const result = await joueurService.getPlayer('alice');

    expect(result).toEqual({
      username: 'alice',
      userId: undefined,
      level: 1,
      experience: 0,
      gold: 0,
      gems: 0,
      tickets: 0,
      monsterIds: [],
    });
  });
});

describe('joueurService.createPlayer', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects an empty username without calling the API', async () => {
    await expect(joueurService.createPlayer('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });
});

describe('joueurService.addExperience', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects a non-positive XP amount without calling the API', async () => {
    await expect(
      joueurService.addExperience('alice', 0)
    ).rejects.toMatchObject({ type: ErrorTypes.VALIDATION });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric XP amount', async () => {
    await expect(
      joueurService.addExperience('alice', NaN)
    ).rejects.toMatchObject({ type: ErrorTypes.VALIDATION });
  });
});

describe('joueurService.removeMonster', () => {
  beforeEach(() => {
    mockedDelete.mockReset();
  });

  it('rejects an empty monster ID without calling the API', async () => {
    await expect(
      joueurService.removeMonster('alice', '')
    ).rejects.toMatchObject({ type: ErrorTypes.VALIDATION });
    expect(mockedDelete).not.toHaveBeenCalled();
  });
});
