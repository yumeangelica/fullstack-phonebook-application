const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SignJWT } = require('jose');
const { requireAuth } = require('../middleware/auth');
const { createRateLimiter, errorHandler } = require('../middleware/index');
const { generateToken } = require('../utils/auth');
const { JWT_SECRET } = require('../utils/config');

const createMockRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

const createMockReq = (authorization) => ({ get: () => authorization });

describe('createRateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = createRateLimiter(60 * 1000, 2);
    const req = { ip: '198.51.100.1' };
    let nextCalls = 0;

    limiter(req, createMockRes(), () => nextCalls++);
    limiter(req, createMockRes(), () => nextCalls++);

    assert.strictEqual(nextCalls, 2);
  });

  it('returns 429 with retryAfter once the limit is exceeded', () => {
    const limiter = createRateLimiter(60 * 1000, 1);
    const req = { ip: '198.51.100.2' };

    limiter(req, createMockRes(), () => {});

    const res = createMockRes();
    let nextCalled = false;
    limiter(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 429);
    assert.strictEqual(res.body.error, 'Too many requests');
    assert.strictEqual(res.body.retryAfter, 60);
  });

  it('tracks limits per client ip', () => {
    const limiter = createRateLimiter(60 * 1000, 1);

    limiter({ ip: '198.51.100.3' }, createMockRes(), () => {});

    let nextCalled = false;
    limiter({ ip: '198.51.100.4' }, createMockRes(), () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  it('allows requests again after the window has passed', () => {
    const limiter = createRateLimiter(1, 1);
    const req = { ip: '198.51.100.5' };

    limiter(req, createMockRes(), () => {});

    // Window is 1ms; wait for it to expire deterministically
    const waitUntil = Date.now() + 5;
    while (Date.now() < waitUntil) {
      // busy-wait: the limiter compares plain timestamps
    }

    let nextCalled = false;
    limiter(req, createMockRes(), () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });
});

describe('requireAuth', () => {
  it('returns 401 when the authorization header is missing', async () => {
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(createMockReq(undefined), res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Token missing');
  });

  it('returns 401 when the scheme is not bearer', async () => {
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(createMockReq('Basic dXNlcjpwYXNz'), res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Token missing');
  });

  it('returns 401 for a malformed token', async () => {
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(createMockReq('Bearer not-a-jwt'), res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Token invalid or expired');
  });

  it('returns 401 for an expired token', async () => {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiredToken = await new SignJWT({
      id: 'user-id-123',
      username: 'ada',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(nowInSeconds - 7200)
      .setExpirationTime(nowInSeconds - 3600)
      .sign(new TextEncoder().encode(JWT_SECRET));

    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(createMockReq(`Bearer ${expiredToken}`), res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Token invalid or expired');
  });

  it('sets request.user and calls next for a valid token', async () => {
    const token = await generateToken('user-id-123', 'ada');
    const req = createMockReq(`Bearer ${token}`);
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, null);
    assert.deepStrictEqual(req.user, { id: 'user-id-123', username: 'ada' });
  });
});

describe('errorHandler', () => {
  it('responds 500 without internal details for unexpected errors', () => {
    const res = createMockRes();

    errorHandler(new Error('database exploded'), {}, res, () => {});

    assert.strictEqual(res.statusCode, 500);
    // Outside development the body must not leak the error message
    assert.deepStrictEqual(res.body, { error: 'Internal server error' });
  });
});
