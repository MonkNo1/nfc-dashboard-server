import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserProfile from '../models/UserProfile.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserProfile.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await UserProfile.findOne({ googleId: profile.id });

        if (user) {
          // Update user's Google profile info
          user.email = profile.emails[0].value;
          user.name = profile.displayName;
          user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Create new user if doesn't exist
        user = await UserProfile.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value,
          isOwner: true // This user can edit their profile
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport; 