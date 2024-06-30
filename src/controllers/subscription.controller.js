import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (!subscription) {
    // Subscribe
    await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscribed successfully"));
  } else {
    // Unsubscribe
    await subscription.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);

  if (!channel || channel._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to view this channel's subscribers");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "name email");

  return res.status(200).json(
    new ApiResponse(
      200,
      subscribers,
      "Subscribers fetched successfully"
    )
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if(!isValidObjectId(subscriberId)){
    throw new ApiError(400, "Invalid subscriber id");
  }

  const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "name description");

  return res.status(200).json(
    new ApiResponse(
        200,
        channels,
        "Channel list fetched successfully"
    )
  )
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };