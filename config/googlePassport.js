import  passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User  from '../models/user.model.js';
import bcryptjs from "bcryptjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ email: profile.emails[0].value });

        if (user) return done(null, user);
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hashSync(password)
        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: hashedPassword, 
          avatar: profile.photos[0].value,
        });
        
        return done(null, newUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
