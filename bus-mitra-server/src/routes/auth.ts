import { Router } from 'express';
import { AdminUserModel, ActivityLogModel } from '../models/index.js';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username or Email and password are required' });
    }

    const cleanIdentifier = identifier.trim();

    // Find admin by username or email
    const admin = await AdminUserModel.findOne({
      $or: [
        { username: { $regex: `^${cleanIdentifier}$`, $options: 'i' } },
        { email: { $regex: `^${cleanIdentifier}$`, $options: 'i' } },
      ],
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password (plain comparison with seeded credentials, extensible for bcrypt)
    if (admin.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    const now = new Date().toISOString();
    admin.lastLoginAt = now;
    await admin.save();

    await ActivityLogModel.create({
      id: `act-${Date.now()}`,
      type: 'stand_added',
      title: `Admin Login: ${admin.name}`,
      description: `Role: ${admin.role} logged in to Admin Dashboard`,
      timestamp: now,
    });

    // Simple deterministic session token
    const token = `adm_tok_${admin.id}_${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        designation: admin.designation,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed due to server error' });
  }
});

// GET /api/auth/me
authRouter.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const match = token.match(/^adm_tok_(admin-[a-z0-9-]+)_/);

    if (!match) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    const adminId = match[1];
    const admin = await AdminUserModel.findOne({ id: adminId });

    if (!admin) {
      return res.status(401).json({ error: 'Admin account not found' });
    }

    res.json({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      designation: admin.designation,
      lastLoginAt: admin.lastLoginAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Session verification failed' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
