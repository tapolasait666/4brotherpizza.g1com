import { Router } from 'express';
import summary from './summary.js';
import orders from './orders.js';
import catalog from './catalog.js';
import coupons from './coupons.js';
import customers from './customers.js';
import reports from './reports.js';
import manage from './manage.js';
import uploads from './uploads.js';

const router = Router();

router.use(summary);
router.use(orders);
router.use(catalog);
router.use(coupons);
router.use(customers);
router.use(reports);
router.use(manage);
router.use(uploads);

export default router;
