import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/tweets").post(verifyJWT, createTweet); // Route to create a new tweet

router.route("/tweets/user/:userId").get(getUserTweets); // Route to get tweets of a specific user

router.route("/tweets/:tweetId")
        .put(verifyJWT, updateTweet) // Route to update a tweet by ID
        .delete(verifyJWT, deleteTweet); // Route to delete a tweet by ID

export default router;