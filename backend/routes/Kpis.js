import express from 'express';
import KpiController from '../controllers/KpiController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, KpiController.createKpi);
router.get('/', verifyToken, KpiController.listKpis);
router.get('/:id/results', verifyToken, KpiController.getKpiResults);
// Ad-hoc compute endpoint (does not persist)
router.post('/compute', verifyToken, (req, res, next) => {
  return KpiController.computeAdHoc(req, res, next);
});
// route reserved for future server-side PDF export (currently returns same JSON)
router.get('/:id/export', verifyToken, KpiController.getKpiResults);

export default router;
