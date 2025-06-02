// backend/config/passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Jika user ditemukan via googleId, pastikan avatar mungkin perlu diupdate
            const googleAvatar =
              (profile.photos &&
                profile.photos[0] &&
                profile.photos[0].value) ||
              null;
            if (googleAvatar && user.avatar !== googleAvatar) {
              user.avatar = googleAvatar;
              // tidak perlu save di sini jika tidak ada perubahan signifikan lain,
              // atau jika Anda ingin selalu update avatar saat login via Google
            }
            // lastName juga bisa diupdate jika perlu, tapi hati-hati menimpa data yang diinput manual
            // user.lastName = profile.name.familyName || user.lastName || "";
            await user.save(); // Simpan jika ada perubahan
            return done(null, user);
          } else {
            const emailFromProfile =
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null;
            if (!emailFromProfile) {
              return done(
                new Error("Email tidak diterima dari profil Google."),
                null
              );
            }

            user = await User.findOne({ email: emailFromProfile });
            if (user) {
              user.googleId = profile.id;
              user.avatar =
                (profile.photos &&
                  profile.photos[0] &&
                  profile.photos[0].value) ||
                user.avatar ||
                null;
              if (!user.firstName && profile.name.givenName)
                user.firstName = profile.name.givenName;
              if (!user.lastName && profile.name.familyName)
                user.lastName = profile.name.familyName;
              await user.save();
              return done(null, user);
            } else {
              const newUser = new User({
                googleId: profile.id,
                firstName: profile.name.givenName || "User",
                lastName: profile.name.familyName || "",
                email: emailFromProfile,
                avatar:
                  (profile.photos &&
                    profile.photos[0] &&
                    profile.photos[0].value) ||
                  null,
                hasPassword: false,
              });
              await newUser.save();
              return done(null, newUser);
            }
          }
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
} else {
  console.warn(
    "PERINGATAN: GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak diset di .env. Strategi Google OAuth tidak akan aktif."
  );
}
