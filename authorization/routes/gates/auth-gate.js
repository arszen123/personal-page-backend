module.exports = function(req, res, next) {
  req.session.app = [];
  const path = req.path;
  const isAuthenticated = typeof req.session.user !== 'undefined';
  const authRequiredRoutes = '/app/';
  const unAuthRequiredRoutes = [
    '/login',
    '/register',
  ];
  if (path.startsWith(authRequiredRoutes) && !isAuthenticated) {
    res.redirect('/login');
    return;
  }
  if (unAuthRequiredRoutes.includes(path) && isAuthenticated) {
    res.redirect('/');
    return;
  }
  return next();
};
