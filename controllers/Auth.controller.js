import { handleError } from "../helpers/handleError.js";
import { sendEmail } from "../helpers/sendEmail.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
export const Register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const checkuser = await User.findOne({ email });
    if (checkuser) {
      // user already registered
      next(handleError(409, "User already registered."));
    }

    const hashedPassword = bcryptjs.hashSync(password);
    // register user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      next(handleError(404, "Invalid login credentials."));
    }
    const hashedPassword = user.password;
    const comparePassword = await bcryptjs.compare(password, hashedPassword);
    if (!comparePassword) {
      next(handleError(404, "Invalid login credentials."));
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      user: newUser,
      message: "Login successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const GoogleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar: avatarUrl } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      const password = Math.random().toString();
      const hashedPassword = bcryptjs.hashSync(password, 10);

      const result = await cloudinary.uploader.upload(avatarUrl, {
        folder: "avatars",
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
      });

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        avatar: result.secure_url,
        publicId: result.public_id,
      });

      user = await newUser.save();
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    const newUserObj = user.toObject({ getters: true });
    delete newUserObj.password;

    res.status(200).json({
      success: true,
      user: newUserObj,
      message: "Login successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const Logout = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const GoogleAuth = async (req, res, next) => {
  const user = req.user;
  try {
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET
    );
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    const newUser = user.toObject({ getters: true });
    delete newUser.password;

    res.redirect(`${process.env.FRONTEND_URL}`);
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const ForgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new handleError(404, `There is no user with that email ${req.body.email}`)
    );
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Verification Code</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f8f8;">
                <table style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px 20px;" width="100%" cellspacing="0" cellpadding="0" align="center">
                <tbody>
                <tr>
                <td align="left"><img src="https://res.cloudinary.com/da6g3kxg3/image/upload/v1748225578/A_4_i59lgx.png" alt="EASYTRANS Logo" width="90" /></td>
                <td align="right">
                <a style="margin: 0 8px; text-decoration: none;" href="https://www.linkedin.com/in/abdessamade-moussaif-859079350/">
                    <img src="https://img.icons8.com/?size=100&id=8808&format=png&color=000000" alt="Facebook" width="20" />
                </a>
                <a style="margin: 0 8px; text-decoration: none;" href="https://x.com/Abdssamade97267">
                    <img src="https://img.icons8.com/?size=100&amp;id=phOKFKYpe00C&amp;format=png&amp;color=000000" alt="Twitter" width="20" />
                </a>
                <a style="margin: 0 8px; text-decoration: none;" href="https://github.com/abdessamademoussaif">
                    <img src="https://img.icons8.com/?size=100&amp;id=16318&amp;format=png&amp;color=000000" alt="Apple" width="20" />
                </a>
                </td>
                </tr>
                <tr>
                <td style="padding-top: 30px;" colspan="2">
                <p style="font-size: 16px; color: #333;">Hi ${user.name},</p>
                <p style="font-size: 16px; color: #333;">This is your one time verification code.</p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f2f2f2; text-align: center; border-radius: 8px;"><span style="font-size: 36px; letter-spacing: 12px; font-weight: bold; color: #333;">${resetCode}</span></div>
                <p style="font-size: 14px; color: #666;">This code is only active for the <span style="font-weight: bold;">next 10 minutes</span>. Once the code expires you will have to resubmit a request for a code.</p>
                </td>
                </tr>
                <tr>
                <td style="padding-top: 40px;" colspan="2" align="center"><img src="https://res.cloudinary.com/da6g3kxg3/image/upload/v1748225578/mini-logo_bwh7fj.png" alt="EASYTRANS Footer Logo" width="60" /></td>
                </tr>
                </tbody>
                </table>
            </body>
        </html>
`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new handleError(500, "There is an error in sending email"));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

export const VerifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new handleError("Reset code invalid or expired"));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

export const ResetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new handleError(404, `There is no user with email ${req.body.email}`)
    );
  }

  if (!user.passwordResetVerified) {
    return next(new handleError(400, "Reset code not verified"));
  }

  const hashedPassword = bcryptjs.hashSync(req.body.newPassword);

  user.password = hashedPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar: user.avatar,
    },
    process.env.JWT_SECRET
  );
  res.status(200).json({ data: user, token });
});
