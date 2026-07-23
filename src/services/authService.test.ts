import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  authApi: { post: vi.fn() },
}));
vi.mock('./logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { authApi } from './api';
import { authService, AuthRoutes, CredentialRules } from './authService';
import { ApiError, ErrorTypes } from './apiClient';

const mockedPost = authApi.post as unknown as ReturnType<typeof vi.fn>;

describe('authService.login', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects an empty username/password without calling the API', async () => {
    await expect(authService.login('', '')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('normalizes a successful login response using the input username', async () => {
    mockedPost.mockResolvedValue({
      data: { token: 'abc123', refreshToken: 'refresh-abc123' },
    });

    const result = await authService.login('Alice', 'password123');

    expect(result).toEqual({
      token: 'abc123',
      refreshToken: 'refresh-abc123',
      username: 'Alice',
    });
  });

  it('throws a validation ApiError when the API response has no token', async () => {
    mockedPost.mockResolvedValue({ data: { refreshToken: 'refresh-abc123' } });

    await expect(authService.login('Alice', 'password123')).rejects.toThrow(
      ApiError
    );
  });

  it('throws a validation ApiError when the API response has no refresh token', async () => {
    mockedPost.mockResolvedValue({ data: { token: 'abc123' } });

    await expect(authService.login('Alice', 'password123')).rejects.toThrow(
      ApiError
    );
  });
});

describe('authService.register', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects a username shorter than the minimum length', async () => {
    await expect(
      authService.register('ab', 'password123', 'password123')
    ).rejects.toMatchObject({ type: ErrorTypes.VALIDATION });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('rejects a username with characters outside the allowed pattern', async () => {
    await expect(
      authService.register('bad user!', 'password123', 'password123')
    ).rejects.toThrow(ApiError);
  });

  it('rejects a password shorter than the minimum length', async () => {
    await expect(
      authService.register('validuser', 'short', 'short')
    ).rejects.toThrow(ApiError);
  });

  it('rejects mismatched password confirmation', async () => {
    await expect(
      authService.register('validuser', 'password123', 'password456')
    ).rejects.toThrow(ApiError);
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('accepts a username at the boundary lengths', async () => {
    mockedPost.mockResolvedValue({
      data: { token: 'tok', refreshToken: 'refresh-tok' },
    });
    const minName = 'a'.repeat(CredentialRules.USERNAME_MIN_LENGTH);

    const result = await authService.register(
      minName,
      'password123',
      'password123'
    );

    expect(result).toEqual({
      token: 'tok',
      refreshToken: 'refresh-tok',
      username: minName,
    });
  });
});

describe('authService.verifyToken', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects an empty token without calling the API', async () => {
    await expect(authService.verifyToken('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('defaults the role to USER when the API omits it', async () => {
    mockedPost.mockResolvedValue({ data: { username: 'bob' } });

    const result = await authService.verifyToken('tok');

    expect(result).toEqual({ username: 'bob', role: 'USER', isValid: true });
  });

  it('keeps the role returned by the API', async () => {
    mockedPost.mockResolvedValue({ data: { username: 'bob', role: 'ADMIN' } });

    const result = await authService.verifyToken('tok');

    expect(result.role).toBe('ADMIN');
  });

  it('throws a validation ApiError when the response has no username', async () => {
    mockedPost.mockResolvedValue({ data: {} });

    await expect(authService.verifyToken('tok')).rejects.toThrow(ApiError);
  });
});

describe('authService.refreshToken', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('rejects an empty refresh token without calling the API', async () => {
    await expect(authService.refreshToken('')).rejects.toMatchObject({
      type: ErrorTypes.VALIDATION,
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('returns the rotated token pair on success', async () => {
    mockedPost.mockResolvedValue({
      data: { token: 'new-access', refreshToken: 'new-refresh' },
    });

    const result = await authService.refreshToken('old-refresh');

    expect(mockedPost).toHaveBeenCalledWith(AuthRoutes.REFRESH_TOKEN, {
      refreshToken: 'old-refresh',
    });
    expect(result).toEqual({
      token: 'new-access',
      refreshToken: 'new-refresh',
    });
  });

  it('throws a validation ApiError when the response is missing the rotated refresh token', async () => {
    mockedPost.mockResolvedValue({ data: { token: 'new-access' } });

    await expect(authService.refreshToken('old-refresh')).rejects.toThrow(
      ApiError
    );
  });

  it('propagates a parsed ApiError when the refresh token is invalid/expired/reused', async () => {
    mockedPost.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          errors: [{ statusCode: 498, message: 'Invalid refresh token' }],
        },
      },
    });

    await expect(authService.refreshToken('stale-refresh')).rejects.toThrow(
      ApiError
    );
  });
});

describe('authService.logout', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('sends both token and refreshToken when revoking', async () => {
    mockedPost.mockResolvedValue({ data: {} });

    const result = await authService.logout('tok', 'refresh-tok');

    expect(mockedPost).toHaveBeenCalledWith(AuthRoutes.LOGOUT, {
      token: 'tok',
      refreshToken: 'refresh-tok',
    });
    expect(result).toEqual({ success: true });
  });

  it('omits refreshToken from the payload when not provided', async () => {
    mockedPost.mockResolvedValue({ data: {} });

    await authService.logout('tok');

    expect(mockedPost).toHaveBeenCalledWith(AuthRoutes.LOGOUT, {
      token: 'tok',
      refreshToken: undefined,
    });
  });

  it('still resolves successfully when the API call fails', async () => {
    mockedPost.mockRejectedValue(new Error('network down'));

    const result = await authService.logout('tok', 'refresh-tok');

    expect(result).toEqual({ success: true });
  });
});
