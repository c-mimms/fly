// config/passport.js
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id: id } });
  done(null, user);
});

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const existingUser = await prisma.user.findUnique({ where: { googleId: profile.id } });

    console.log(profile);
    if (existingUser) {
      console.log(existingUser);
      //TODO populate any fields if the user updates their account
      done(null, existingUser);
    } else {
      //User email will be first verified email, or first email if exists
      const userEmail = (profile.emails && profile.emails.length > 0)
        ? profile.emails.find((email) => email.verified)?.value || profile.emails[0]?.value
        : null;

      const user = await prisma.user.create({
        data: {
          googleId: profile.id,
          username: profile.displayName,
          email: userEmail,
          // other fields...
        }
      });

      done(null, user);
    }
  })
);
