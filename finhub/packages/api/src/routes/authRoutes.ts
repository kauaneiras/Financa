import { Router } from 'express';

const router = Router();
const mockUsers: any[] = [];

// Simple inline mock token instead of jose to avoid compilation issues
const fakeSignToken = (payload: any) => Buffer.from(JSON.stringify(payload)).toString('base64');

router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Bad Request' });
  const user = { id: Math.random().toString(), email, name, password };
  mockUsers.push(user);
  res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email && u.password === password) || { id: '1', email, name: 'User' };
  
  // Accept any login for UI demonstration
  const token = fakeSignToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post('/login/google', async (req, res) => {
  const token = fakeSignToken({ id: '2', email: 'google.user@gmail.com' });
  res.json({ token, user: { id: '2', email: 'google.user@gmail.com', name: 'Google Acc' } });
});

router.post('/login/microsoft', async (req, res) => {
  const token = fakeSignToken({ id: '3', email: 'ms.user@outlook.com' });
  res.json({ token, user: { id: '3', email: 'ms.user@outlook.com', name: 'MS Acc' } });
});

export default router;
