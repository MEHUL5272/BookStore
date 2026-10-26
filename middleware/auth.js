
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user?.role === "admin") {
    return next();
  }

  return res.status(403).send("Access denied: Admin only");
}

module.exports = { isLoggedIn, isAdmin };
