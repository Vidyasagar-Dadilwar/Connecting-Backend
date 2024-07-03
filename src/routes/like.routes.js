import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle-video-like/video/:videoId").put(verifyJWT, toggleVideoLike);

router.route("/toggle-comment-like/comment/:commentId").put(verifyJWT, toggleCommentLike);

router.route("/toggle-tweet-like/tweet/:tweetId").put(verifyJWT, toggleTweetLike);

router.route("/liked-videos").get(verifyJWT, getLikedVideos);

export default router;