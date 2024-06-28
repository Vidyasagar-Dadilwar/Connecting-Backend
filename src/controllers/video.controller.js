import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    if (!query) {
      throw new ApiError(400, "query parameter is missing");
    }
    if (!sortBy) {
      throw new ApiError(400, "sortBy parameter is missing");
    }
    if (!sortType) {
      throw new ApiError(400, "sortType parameter is missing");
    }
    if (!userId) {
      throw new ApiError(400, "userId parameter is missing");
    }
  
    
   const sortOrder = sortType === "asc" ? 1 : -1;
  
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      httpOnly: true,
      secure: true,
    };
  
    const video = await Video.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $match: {
          owner: mongoose.Types.ObjectId(userId),
        },
      },
      {
          $sort: { [sortBy]: sortOrder },
      },
    ], options);
  
  
  
  //   // Build the aggregation pipeline
  //   const pipeline = [];
  
  //   // Match stage to filter documents
  //     pipeline.push({
  //       $match: {
  //         $or: [
  //           { title: { $regex: query, $options: "i" } },
  //           { description: { $regex: query, $options: "i" } },
  //         ],
  //       },
  //     });
    
  //     pipeline.push({
  //       $match: {
  //         owner: mongoose.Types.ObjectId(userId),
  //       },
  //     });
  
  //   // Sort stage
  //   const sortOrder = sortType === "asc" ? 1 : -1;
  //   pipeline.push({
  //     $sort: { [sortBy]: sortOrder },
  //   });
  
    
  
  //   const video = await Video.aggregatePaginate(
  //     Video.aggregate(pipeline),
  //     options
  //   );
  
    return res.status(200).json(
      new ApiResponse(
          200,
          video,
          "Video retrived successfully"
      )
    )
  } catch (error) {
    throw new ApiError(500, error.messsage || "Something wrong while getting all videos");
  }
});

// middleware to verify user is logged in 
const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
  //   const videoFile = req.file;
  
      const videoLocalPath = req.file?.videoFile[0]?.path
      if(!videoLocalPath){
      throw new ApiError(400, "No video file uploaded");
      }
  
      const videoFile = await uploadOnCloudinary(videoLocalPath);
  
      const newVideo = await Video.create({
          videoFile: videoFile.url,
          title,
          description,
          thumbnail: videoFile.secure_url,
          duration: videoFile.duration,
          owner: req.user._id,
      });
  
      const createdVideo = await Video.findOneById(newVideo._id);
  
      return res.status(200).json(
          new ApiResponse(
              200,
              createdVideo,
              "Video created successfully"
          )
      )
  } catch (error) {
    throw new ApiError(
      500,
      error.messsage || "Something wrong while publishing a video"
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    //TODO: get video by id
      if(!videoId){
          throw new ApiError(400, "Video id is required");
      }
      const video = await Video.findOneById(videoId);
      if(!video){
          throw new ApiError(404, "Video not found");
      }
      return res.status(200).json(
          new ApiResponse(
              200,
              video,
              "Video found successfully"
          )
      )
  } catch (error) {
    throw new ApiError(
      500,
      error.messsage || "Something wrong while getting video by id"
    );
  }
});

// user should be logged in 
const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if(!videoId){
      throw new ApiError(400, "Video id required for updating video");
    }
    //TODO: update video details like title, description, thumbnail
    const {title, description, thumbnail} = req.body;
    if(!isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid videoId");
    }
    
    if(!title && !description && !thumbnail){
      throw new ApiError(400, "Title, description and thumbnail are required");
    }
  
    const video = await Video.findOneById(videoId);
    if(video.owner.toString() !== req.user._id.toString()){
      throw new ApiError(400, "Your are not authorised to update this video");
    }
  
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
          $set:{
            title:title,
            description:description,
            thumbnail: thumbnail
          }
      }, {new:true}
    )
  
    return res.status(200).json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video details updated successfully"
      )
    )
  } catch (error) {
    throw new ApiError(
      500,
      error.messsage || "Something wrong while updating video details"
    );
  }
});

// user should be logged in 
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
      
    const video = await Video.findOneById(videoId);
  
    if(!video){
      throw new ApiError(400, "Video not found");
    }
  
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Your are not authorised to delete this video");
    }
  
    await Video.findByIdAndDelete(videoId);
  
    return res.status(200).json(
      new ApiResponse(
          200,
          null,
          "Video deleted successfully"
      )
    )
  } catch (error) {
    throw new ApiError(
      500,
      error.messsage || "Something wrong while deleting the video"
    );
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
  
    if(!isValidObjectId(videoId)){
      throw new ApiError(400, "Invalid video id for toggle status");
    }
  
    const video = await Video.findById(videoId);
  
    if(!video){
      throw new ApiError(400, "Video not found");
    }
  
    if(video.owner.toString() !== req.user._id.toString()){
      throw new ApiError(403, "You are not authorised to toggle publish status of this video")
    }
  
    video.isPublished = !video.isPublished;
  
    await video.save();
  
    return res.status(200).json(
      new ApiResponse(
          200,
          video.isPublished,
          "Video publish status toggled successfully"
      )
    )
  } catch (error) {
    throw new ApiError(
      500,
      error.messsage || "Something wrong while toggleing the status of video"
    );
  }

});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
