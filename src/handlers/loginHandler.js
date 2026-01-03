const { request } = require("../util/request");
const { StatusCodes } = require("http-status-codes");
const { getDetailsOptions, getTokenOptions } = require("../util/options");
const { handleFailureWithMessage } = require("./commonHandler");

const fetchToken = (req, res) => {
  const query = `client_id=${req.app.locals.CLIENT_ID}&client_secret=${req.app.locals.CLIENT_SECRET}&code=${req.query.code}`;
  return request(getTokenOptions(query)).then(r => r.access_token);
};

const fetchUserDetails = (_, res, token) => {
  return request(getDetailsOptions(token)).then(
    ({ id, login, name, avatar_url }) => ({
      id,
      name: name || login,
      avatar_url,
    })
  );
};

const storeUserDetails = async (req, res, userData) => {
  if (req.session.userId) return userData;
  await req.app.locals.db.addUser(userData);
  return userData;
};

const updateSessionWithUserDetails = (req, _, userData) => {
  req.session.userId = userData.id; 
  req.session.username = userData.name;
  req.session.avatar_url = userData.avatar_url;
};

const handleLogin = (req, res) => {
  fetchToken(req, res)
    .then(token => fetchUserDetails(req, res, token))
    .then(user => storeUserDetails(req, res, user))
    .then(user => updateSessionWithUserDetails(req, res, user))
    .then(() => res.redirect(req.app.locals.FRONT_END_URL));
};

const handlerIsLoggedIn = (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json({ isLoggedIn: false });
  }

  res.json({
    isLoggedIn: true,
    user: {
      id: req.session.userId,
      name: req.session.username,
      avatar_url: req.session.avatar_url,
    },
  });
};




module.exports = {
  handleLogin,
  handlerIsLoggedIn,
};
