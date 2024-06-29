import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// user needs to be logged in 
const createTweet = asyncHandler(async (req, res) => {
  try {
    //TODO: create tweet
    const { content } = req.body;
  
    if(!content){
      throw new ApiError(400, "Content is required for tweet");
    }
  
    const tweet = await Tweet.create({
      owner: req.user._id,
      content
    })
  
    const createdTweet = await Tweet.findById(tweet._id);
  
    if(!createdTweet){
      throw new ApiError(400, "Tweet not created");
    }
  
    return res.status(200).json(
      new ApiResponse(
          200,
          createTweet,
          "Tweet created successfully",
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to create tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    // TODO: get user tweets
    const { userId } = req.params;
  
    // Check if userId is valid
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
  
    // Find tweets by user
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });
  
    return res.status(200).json(
      new ApiResponse(
          200,
          tweets,
          "Tweets of user fetched successfully",
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to fetch tweet of the user");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;
  
    // Check if tweetId is valid
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }
  
    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);
  
    // Check if the tweet exists
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
  
    // Check if the logged-in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this tweet");
    }
  
    // Update tweet content
    tweet.content = content || tweet.content;
  
    // Save the updated tweet
    await tweet.save();
  
    return res.status(200).json(
      new ApiResponse(
          200,
          tweet,
          "Tweet updated successfully",
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to update tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  await tweet.remove();

  res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };