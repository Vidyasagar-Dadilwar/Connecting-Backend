import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

// user need to be logged in 
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  //TODO: create playlist
  const existingPlayList = await Playlist.findOne({name: name, description: description});

  if(existingPlayList){
    throw new ApiError(400, "Playlist with name and description already exists");
  }

  const newPlayList = await Playlist.create({
    name,
    description,
    videos: [],
    owner: req.user._id
  })

  const createdPlayList = await Playlist.findById(newPlayList._id);

  if (!createdPlayList) {
    throw new ApiError(400, "Playlist creation failed");
  }

  return res.status(200).json(
    new ApiResponse(
        201,
        createdPlayList,
        "Playlist created successfully"
    )
  )
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const playlists = await Playlist.find({ owner: userId });

  if (!playlists || playlists.length === 0) {
    throw new ApiError(404, "No playlists found");
  }

  return res.status(200).json(
    new ApiResponse(
        200, 
        playlists, 
        "Playlists fetched successfully"
    ));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if(!isValidObjectId(playlistId)){
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);

  if(!playlist){
    throw new ApiError(404, "Playlist does not exists");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view this playlist");
  }

  return res.status(200).json(
    new ApiResponse(
        200,
        playlist,
        "Playlist fetched successfully by playlistId"
    )
  )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if(!isValidObjectId(playlistId)){
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findById(playlistId);

  if(!playlist){
    throw new ApiError(404, "Playlist does not exists");
  }

  if(playlist.owner.toString() !== req.user._id.toString()){
    throw new ApiError(400, "You are not authorised to add video to playlist");
  }

  const video = await Video.findById(videoId);

  if(!video){
    throw new ApiError(404, "Video to add in playlist does not exists");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res.status(200).json(
    new ApiResponse(
        200,
        playlist,
        "Video added to playlist successfully"
    )
  )
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist does not exists");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not authorised to add video to playlist");
  }

  const videoIndex = playlist.videos.indexOf(videoId);

  if(videoIndex === -1){
    throw new ApiError(404, "Video to remove from playlist does not exists");
  }

  playlist.videos.splice(videoIndex,1);

  return res.status(200).json(
    new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully"
    )
  )
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if(!isValidObjectId(playlistId)){
    throw new ApiError(400, "Invalid playlistId for deletePlaylist");
  }

  const playlist = await Playlist.findById(playlistId);

  if(!playlist){
    throw new ApiError(404, "Playlist does not exists to be deleted");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200).json(
    new ApiResponse(
        200,
        {},
        "Playlist deleted successfully"
    )
  )
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if(!isValidObjectId(playlistId)){
    throw new ApiError(400, "Invalid playlistId to update");
  }

  const playlist = await Playlist.findById(playlistId);

  if(!playlist){
    throw new ApiError(404, "Playlist does not exists to be updated");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

 if(name){
     playlist.name = name;
 }
 if(description){
     playlist.description = description;
 }

  await playlist.save();

  return res.status(200).json(
    new ApiResponse(
        200,
        playlist,
        "Playlist updated successfully"
    )
  )
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};