const jwt = require('jsonwebtoken');
const config = require('config');
const dotenv = require('dotenv');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization').replace('Bearer ', '');
//console.log("TOKEN:" + token);
  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  //console.log('jwtSecret' + config.get('jwtSecret'));
  //console.log('JWT_SECRET' + process.env.JWT_SECRET);
  // Verify token
  try {
    const decoded = jwt.verify(token,  process.env.JWT_SECRET);
    //console.log("DECODED");
    //console.log(decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
