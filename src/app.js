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

app.use("/api/v1/users", userRouter);

export  {app};