import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    trim: true,
    index: true, // helps for optimised searching
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true, // helps for optimised searching
  },
  avatar:{
    type: String, // Since this will be url of the cloud image
    required: true
  },
  coverImage:{
    type: String,
  },
  watchHistory: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }
  ],
  password:{
    type: String,
    required: [true, "Password is required"]
  },
  refreshToken: {
    type: String,
  }
},{timestamps: true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hashSync(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
}

export const User = mongoose.model("User", userSchema);