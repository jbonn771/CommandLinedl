import Router from 'express';
import { startAssigning, stopAssigning, getAdminsInInboxByAwayModeStatus } from '../controllers/intercomController';

const router = Router();

router.post('/start', startAssigning)

router.post('/stop', stopAssigning);

router.get('/status', async (req, res) => {
    try {
      const { activeTeammates, inactiveTeammates } = await getAdminsInInboxByAwayModeStatus();
      res.json({ activeTeammates, inactiveTeammates });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve admin data' });
    }
  });

  router.get('/send-message'
  )

export default router;
