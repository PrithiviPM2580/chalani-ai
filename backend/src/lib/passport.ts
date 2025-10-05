import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '@/config/envValidation';
import { googleService } from '@/services/auth';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const googleId = profile.id;

        const user = await googleService({ googleId, email, displayName });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
