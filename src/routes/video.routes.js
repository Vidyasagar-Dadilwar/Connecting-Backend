import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller";

const router = Router();

router.route("/get-all-videos").get(getAllVideos);

router.route("/publish-video").post(verifyJWT, upload.single("videoFile"), publishAVideo);

router.route("/videoId/:videoId").get(getVideoById);

router.route("/videoId/:videoId").put(verifyJWT, updateVideo);

router.route("/videoId/:videoId").delete(verifyJWT, deleteVideo);

router.route("/videos/:videoId/toggle-publish").put(verifyJWT, togglePublishStatus);

export default router;