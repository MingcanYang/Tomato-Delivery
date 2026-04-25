import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { sendMessage, listMessages, listUserMessages, replyMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post('/send', sendMessage);
messageRouter.get('/list', adminAuth, listMessages);
messageRouter.get('/mine', authMiddleware, listUserMessages);
messageRouter.post('/reply', adminAuth, replyMessage);

export default messageRouter;
