import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"


const app = express();

// setting cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// allowing to access json data
app.use(express.json({limit: "16kb"}));
// allowing to access data from url
app.use(express.urlencoded({extended: true}));
// allowing public assets
app.use(express.static("public"));
// allowing CRUD on cookies
app.use(cookieParser());



// Importing router 
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"

app.use("/api/v1/users", userRouter);

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/subscription", subscriptionRouter);

export  {app};