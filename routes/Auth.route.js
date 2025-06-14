import express from "express";
import passport from "passport";
import {
  ForgotPassword,
  GoogleAuth,
  GoogleLogin,
  Login,
  Logout,
  Register,
  VerifyPassResetCode,
  ResetPassword,
} from "../controllers/Auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const AuthRoute = express.Router();

AuthRoute.post("/register", Register);
AuthRoute.post("/login", Login);
AuthRoute.post("/google-login", GoogleLogin);
AuthRoute.get("/logout", authenticate, Logout);
AuthRoute.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
AuthRoute.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  GoogleAuth
);
AuthRoute.post('/forgotPassword', ForgotPassword);
AuthRoute.post('/verifyResetCode', VerifyPassResetCode);
AuthRoute.put('/resetPassword', ResetPassword);


export default AuthRoute;
