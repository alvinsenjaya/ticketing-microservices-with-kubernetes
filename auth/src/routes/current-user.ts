import express from 'express';

import { currentUser } from '../common/middleware/current-user';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  return res.json({
    currentUser: req.currentUser || null
  });
});

export { router as currentUserRouter };
