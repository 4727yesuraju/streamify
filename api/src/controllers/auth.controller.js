import User from "../models/User.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;
  try {
    if (!email || !password || !fullName)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists, please try with different one.",
      });
    }
    const idx = Math.floor(Math.random() * 100) + 1; //generate num between 1-100
    const randomAvatar = `https://avatar-placeholder.iran.liara.run/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (err) {
      console.log("Error creating Stream user : ", err);
    }

    generateTokenAndSetCookie({ id: newUser._id, res });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid email or password" });
    generateTokenAndSetCookie({ id: user._id, res });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ message: "Internal server Error" });
  }
}
export async function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout Successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "leanringLanguage",
          !location && "Location",
        ].filter(Boolean),
      });
    }

    let updatedUser = null;
    try {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          ...req.body,
          isOnboarded: true,
        },
        { new: true }
      );

      console.log(
        `Stream User updated after onboarding for ${updatedUser?.fullName}`
      );
    } catch (error) {
      console.log(
        `Error updating Stream user during onboarding : `,
        error?.message
      );
    }

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    //update userinfo in streamer

    await upsertStreamUser({
      id: updatedUser?._id?.toString(),
      name: updatedUser?.fullName,
      image: updatedUser?.profilePic || " ",
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error : ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
