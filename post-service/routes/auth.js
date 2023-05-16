// routes/auth.js
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/login', (req, res) => {
  res.redirect('/auth/google');
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.end()
  }
});

export { router };
