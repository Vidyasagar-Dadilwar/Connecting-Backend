import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);

router.route("/get-playlists").get(verifyJWT, getUserPlaylists);

router.route("/get-playlist-by-id/:playlistId").get(verifyJWT, getPlaylistById);

router.route("/add-video/:playlistId/:videoId").put(verifyJWT, addVideoToPlaylist);

router.route("/remove-video/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist);

router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

router.route("/update-playlist/:playlistId").put(verifyJWT, updatePlaylist);

export default router;