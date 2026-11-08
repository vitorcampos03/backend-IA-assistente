import { Router } from "express";
import {
  handleListConversations,
  handleGetConversation,
  handleDeleteConversation,
} from "../controllers/historyController.js";

const router = Router();

router.get("/", handleListConversations);
router.get("/:conversationId", handleGetConversation);
router.delete("/:conversationId", handleDeleteConversation);

export default router;