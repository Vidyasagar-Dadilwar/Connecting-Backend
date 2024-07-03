import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Video id is incorrect");
  }

  const video = await Video.findById(videoId);

  if(!video){
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({video: videoId, likedBy: req.user._id});

  if(existingLike){
    await existingLike.remove();
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video successfully unliked"
        )
    )
  }
  else{
    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    const newLike = await Like.findById(like._id);

    if(!newLike){
        throw new ApiError(500, "Unable to like video");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            like,
            "Video successfully liked"
        )
    )
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Invalid Comment id ");
  }

  const comment = await Comment.findById(commentId);

  if(!comment){
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({comment: commentId, likedBy: req.user._id});

  if(existingLike){
    await existingLike.remove();
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment successfully unliked"
        )
    )
  }
  else{
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });

    const newLike = await Like.findById(like._id);

    if(!newLike){
        throw new ApiError(500, "Unable to like comment");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            like,
            "Comment successfully liked"
        )
    )
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id ");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet successfully unliked"));
  } else {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    const newLike = await Like.findById(like._id);

    if (!newLike) {
      throw new ApiError(500, "Unable to like tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, like, "Tweet successfully liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.find({likedBy: userId, video: { $exists: true }, }).populate("video");

  if(!likedVideos || likedVideos.length === 0){
    return res.status(200).json(new ApiResponse(200, [], "No liked videos found"));
  }

  const videos = likedVideos.map((like) => like.video);

  return res.status(200).json(
    new ApiResponse(
        200,
        videos,
        "Successfully retrieved liked videos"
    )
  )
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };