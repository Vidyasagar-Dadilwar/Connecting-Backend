import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid video id");
  }

  const comments = await Comment.find({ video: videoId })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select("-object -video");

  if(comments.length===0 || !comments){
    throw new ApiError(404, "No comments found");
  }

  return res.status(200).json(
    new ApiResponse(
        200,
        comments,
        `Successfully retrieved ${comments.length} comments for video ${videoId}`
    )
  )
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if(!content){
    throw new ApiError(400, "Content is required");
  }

  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid video id");
  }

  const newComment = await Comment.create({
    content,
    video: videoId,
    object: req.user._id
  })

  const comment = await Comment.findById(newComment._id).select(" -video -object ");

  if(!comment){
    throw new ApiError(400, "Comment not added");
  }

  return res.status(200).json(
    new ApiResponse(
        200,
        comment,
        "Comment added successfully"
    )
  )
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Comment id is required");
  }

  if(!content){
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.findById(commentId);

  if(!comment){
    throw new ApiError(400, "Comment not found");
  }

  if (comment.object.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not authorized to update this comment");
  }

  comment.content = content;

  await comment.save();

  return res.status(200).json(
    new ApiResponse(
        200,
        comment,
        "Comment updated successfully"
    )
  )
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment id is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (comment.object.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not authorized to delete this comment");
  }

  await comment.remove();

  return res.status(200).json(
    new ApiResponse(
        200,
        {},
        "Comment deleted successfully"
    )
  )
});

export { getVideoComments, addComment, updateComment, deleteComment };