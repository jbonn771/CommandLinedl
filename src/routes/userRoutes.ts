import express from 'express';
import { getPendingUsers, approveUser, denyUser, getApprovedUsers } from '../controllers/userController';


const router = express.Router();

router.get('/approved', getApprovedUsers); 
router.get('/pending-approval', getPendingUsers);
router.put('/approve/:userId', approveUser); 
router.delete('/deny/:userId', denyUser);   

export default router;
