import User from "../models/User.js";
import jwt from 'jsonwebtoken'
// Middleware to protect route
export const protectRoute = async(req,res,next)=>{

    try{
        const token = req.headers.token ||  req.headers.authorization;

         if (!token) {
      return res.json({
        success: false,
        message: "No token provided",
      });
    }

        const decoded =jwt.verify(token , process.env.JWT_SECRET)

        const user = await User.findById(decoded.id || decoded.userId).select("-password");

        if(!user){
            return res.json({success:false ,
                message:"User not found"
            })
        }

        // with this we can access the user in the controller function
        req.user= user;
        next();
    }catch(error){
        console.log(error.message);
         return res.json({success:false ,
                message:error.message
            })
    }

}