import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;

  if(!isValidObjectId(channelId)){
    throw new ApiError(400, "Invalid channel id");
  }

  const totalVideos = await Video.countDocuments({ owner: channelId });
  const totalViews = await Video.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(channelId) } },
    { $group: { _id:null, totalViews: { $sum: "$views" } } }
  ]);

  const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
  const totalLikes = await Like.countDocuments({
     video: { $in: await Video.find({ owner: channelId }).distinct("_id") },
   });

   const stats = {
     totalVideos,
     totalViews: totalViews[0] ? totalViews[0].totalViews : 0,
     totalSubscribers,
     totalLikes
   };

   return res.status(200).json(
    new ApiResponse(
        200,
        stats,
        "Channel stats fetched successfully"
    )
   )
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;

  if(!isValidObjectId(channelId)){
    throw new ApiError(400, "Invalid channel id");
  }

  const videos = await Video.find({ owner:channelId });

  if (!videos.length) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res.status(200).json(
    new ApiResponse(
        200,
        videos,
        "Channel videos fetched successfully"
    )
  )
});

export { getChannelStats, getChannelVideos };