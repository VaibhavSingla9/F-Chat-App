import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import bcrypt from 'bcryptjs'


// Signup a new User
export const signup = async(req,res)=>{
    const {fullName , email , password, bio} = req.body

    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success:false, message:"Missing Details"})
        }
        
        const user = await User.findOne({email})

        if(user){
            return res.json({success:false, message:"Account already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , salt)

        const newUser = await User.create({fullName ,
            email,
            password: hashedPassword,
            bio
        })

        // create the token and for this we will create a seperate funciton in utils.js
        const token = generateToken(newUser._id)

        res.json({success:true , userData :newUser , token, message:"Account Created Successfull" })
    }catch(error){
        console.log(error.message)
        res.json({
            success: false,
            message:error.message
        })
    }
}

// controller to login a user
export const login= async(req , res)=>{
    try{
        const { email , password} = req.body

       //CHAT GPT 
    if (!email || !password) {
        console.log("no email or password")
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }



        const userData = await User.findOne({email})

         if (!userData) {
             console.log("no user")
      return res.json({
        success: false,
        message: "User not found",
      });
    }

        const isPasswordCorrect = await bcrypt.compare(password,userData.password)

        if(!isPasswordCorrect){
            return res.json({
                success: false,
                message:"Invalid Credentials"
            })
        }

        // create the token and for this we will create a seperate funciton in utils.js
        const token = generateToken(userData._id)

        //  userData :newUser 
        res.json({success:true , userData , token, message:"Login Successfull" })
    }catch(error){
         console.log(error.message)
        res.json({
            success: false,
            message:error.message
        })
    }
}

// controller ot check if the user is authenticated 
export const checkAuth = (req,res)=>{
    res.json({success: true ,
        user:req.user
    })
}

// function using that user can update their profile 

export const updateProfile = async(req,res)=>{
 try{
  const {profilePic , bio , fullName} = req.body
  const userId = req.user._id

  let updatedUser;

  if(!profilePic){
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio, fullName },
      { new:true }
    );
  }else{
    const upload = await cloudinary.uploader.upload(profilePic);

    updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: upload.secure_url, bio, fullName },
      { new:true }
    );
  }

  // ✅ SEND RESPONSE FOR BOTH CASES
  res.json({
    success:true,
    user:updatedUser
  });

 }catch(error){
  console.log(error.message);
  res.json({
    success:false,
    message:error.message
  });
 }
};



