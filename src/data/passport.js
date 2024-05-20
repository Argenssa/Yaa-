const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

passport.use(new SpotifyStrategy({
        clientID: "499d07bdc822451e976aa8e5daa7ae4c",
        clientSecret: "598673c29c77445aaf648a2f68473306",
        callbackURL: 'http://localhost:3000/auth/spotify/callback' // Измените на ваш URL обратного вызова
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
        // Сохраните accessToken, refreshToken и другие данные профиля в базе данных или в сессии
        return done(null, profile);
    }));

passport.serializeUser((user, done) => {
    // Сохраняем только идентификатор пользователя в сессии
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // По идентификатору пользователя находим его в базе данных
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = passport;
