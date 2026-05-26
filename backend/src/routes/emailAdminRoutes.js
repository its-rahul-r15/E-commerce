import express from 'express';
import * as emailAdminController from '../controllers/emailAdminController.js';
import auth from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require admin authentication
router.use(auth, requireAdmin);

router.get('/templates', emailAdminController.getTemplates);
router.put('/templates/:name', emailAdminController.updateTemplate);
router.post('/broadcast', emailAdminController.sendBroadcast);

export default router;
