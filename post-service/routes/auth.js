// routes/auth.js
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/login', (req, res) => {
  res.redirect('/auth/google');
});

router.get('/google', (req, res) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'] ,
  })(req,res);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    if (req.query.state !== undefined) {
      res.redirect(req.query.state);
    } else {
      res.redirect('/');
    }
});

router.get('/google/:state', (req, res) => {
  const { state } = req.params;
  const redirectUrl = decodeURIComponent(state);
  passport.authenticate('google', {
    scope: ['profile', 'email'] ,
    state: redirectUrl
  })(req,res);
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
