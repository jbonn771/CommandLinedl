import Router from "express";
import { sendMessageToSlack } from "../controllers/slackController";

const router = Router();

router.post("/send-message", sendMessageToSlack);

export default router;