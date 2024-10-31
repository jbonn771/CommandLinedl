import { Router } from 'express';
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from '../controllers/employeeController';

const router = Router();

router.post('/create-employee', createEmployee);
router.get('/employees', getEmployees);
router.put('/update-employee/:id', updateEmployee);
router.delete('/delete-employee/:id', deleteEmployee);

export default router;
