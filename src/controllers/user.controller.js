import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>{ 
  // This function takes userid and generate access and refresh tokens. Then save refresh token to db so that we does not have to chk password agn and agn. Then it returns accesssToken and refreshToken
  try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // console.log({ accessToken, refreshToken });
    return {accessToken, refreshToken};
  }
  catch(error){
    throw new ApiError(500, "Something went wrong when generating access or refresh tokens");
  }
}

const registerUser = asyncHandler( async (req,res) =>{
  // Taking data from user
  const { fullName, username, email, password } = req.body;
  // console.log("Email: ",email);

  // Validating all fields are not empty
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Checking if the user already exists in the db
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with provided email or username already exists"
    );
  }

  // Uploading avatar and coverImage to get local path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path;
  }


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Export this on cloudinary using the method cloudinary.js in utils
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Creating user object
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Removing password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"    // - indicates that fields are not included
  );
  
  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // Returning response
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
})

const loginUser = asyncHandler(async (req,res) =>{
    // req body -> data
    // username or email login
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email, username,password} = req.body;
    if(!email && !username){
      throw new ApiError(400,"Email or Username is required");
    }
    const user = await User.findOne({
      $or: [{username},{email}]
    })

    if(!user){
      throw new ApiError(404,"User does not exists");
    }

    const isPasswordValid = user.isPasswordCorrect(password);
    if(!isPasswordValid){
      throw new ApiError(401,"Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Sending cookies
    const option = {
      httpOnly: true,
      secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
      )
    )
})

const logoutUser = asyncHandler( async(req, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  // clear the cookies
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
  .clearCookie("accessToken", option)
  .clearCookie("refreshToken", option)
  .json(
    new ApiResponse(
      200,
      {},
      "User logged out successfully"
    )
  )
})

const refreshAccessToken = asyncHandler( async(req,res) =>{
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
    if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized access");
    }
  
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used");
    }
  
    const option = {
      httpOnly: true,
      secure: true,
    };
  
    // New Refresh token is provided and saved in db by generateAccessAndRefreshTokens function
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user?._id);
  
    // Updating the cookies
    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", newRefreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          accessToken, refreshToken: newRefreshToken
        },
        "Access Token refreshed"
      )
    )
  } catch (error) {
    new ApiError(401, error?.message ||  "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler( async(req,res) =>{
  try {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
      throw new ApiError(400, "Invalid old password");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Password changed successfully"
      )
    )
  } catch (error) {
    new ApiError(401, error?.message || "Password change failed");
  }
})


const getCurrentUser = asyncHandler( async(req,res) =>{
  return res.status(200).json(
    new ApiResponse(
      200,
      res.user,
      "Current user fetched successfully"
    )
  )
})

const updateAccountDetails = asyncHandler( async(req, res)=>{
  try {
    const {fullName, email} = req.body;
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
        $set:{
          fullName:fullName,
          email:email
        }
        }, {new:true}
      ).select("-password");
      
    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "Account details updated successfully"
      )
    )
  } catch (error) {
    new ApiError(401, "Account Updation Failed");
  }
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
      throw new ApiError(401, "Avatar file missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
      throw new ApiError(401, "Error while uploading avatar no cloudinary");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User Avatar updated successfully"));
  } catch (error) {
    new ApiError(401, "Avatar Updation Failed");
  }
});

const updateUserCoverImage = asyncHandler( async(req, res) =>{
  try {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
      throw new ApiError(400, "Cover Image file is missing");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
      throw new ApiError(400, "Error while uploading cover image to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          coverImage: coverImage.url
        }
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "Cover image updated successfully"
      )
    );
  } catch (error) {
    new ApiError(401,error?.message || "Failed to update cover image");
  }
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};