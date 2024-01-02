
import express from 'express';
import loggerController from '../controllers/loggerController.js';

const router = express.Router();

router.get('/loggerTest', loggerController.loggerTest);

export default router;
