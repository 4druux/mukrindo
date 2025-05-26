// backend/config/passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/userModel"); // Pastikan path ini benar

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

// Strategi Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback", // Path relatif terhadap base URL backend Anda
        proxy: true, // Penting jika aplikasi di belakang proxy seperti Vercel/Heroku
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          } else {
            // Cek jika email sudah ada (mungkin dari registrasi manual atau OAuth lain)
            const emailFromProfile =
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null;
            if (!emailFromProfile) {
              // Jika Google tidak memberikan email, ini masalah.
              // Anda bisa mengarahkan pengguna untuk menambahkan email ke akun Google mereka
              // atau menolak autentikasi.
              return done(
                new Error("Email tidak diterima dari profil Google."),
                null
              );
            }

            user = await User.findOne({ email: emailFromProfile });
            if (user) {
              // Email sudah ada, tautkan akun Google ini
              user.googleId = profile.id;
              // Anda bisa memilih untuk update nama jika berbeda, atau tidak
              // user.firstName = profile.name.givenName || user.firstName;
              // user.lastName = profile.name.familyName || user.lastName;
              await user.save();
              return done(null, user);
            } else {
              // Buat pengguna baru
              const newUser = new User({
                googleId: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName || "", // Handle jika familyName tidak ada
                email: emailFromProfile,
                // role default 'user'
                // password tidak diset untuk pengguna OAuth
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
