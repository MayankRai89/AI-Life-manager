const authService = require("../services/auth.service");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, timezone } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerUser({
      name,
      email,
      password,
      timezone,
    });

    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err); // handled by error.middleware.js
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    // Stateless JWT: nothing to invalidate server-side unless a token blacklist
    // (e.g. Redis) is added later. Client is responsible for discarding the token.
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    // req.user is attached by auth.middleware.js after verifying the JWT
    const user = await authService.getUserById(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe, refresh };
