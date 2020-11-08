import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  res.clearCookie('x-auth-token');
  
  res.json({});
});

export { router as signoutRouter };
