import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/channels/:channelId/toggle-subscription").put(verifyJWT, toggleSubscription);

router.route("/channels/:channelId/subscribers").get(verifyJWT, getUserChannelSubscribers);

router.route("/user/:subscriberId/subscriptions").get(verifyJWT, getSubscribedChannels);

export default router;