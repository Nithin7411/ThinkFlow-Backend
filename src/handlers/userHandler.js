const { StatusCodes } = require("http-status-codes");

const getDashboard = async (req, res) => {
  try {
    const data = await req.app.locals.db.getDashboard(req.session.userId);
    res.json(data);
  } catch (e) {
  console.error("DASHBOARD ERROR:", e.message);
  res.status(500).json({ error: "Dashboard failed" });
}

};

const getUserStories = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const drafts = await req.app.locals.db.getUserDrafts(userId);
    const published = await req.app.locals.db.getUserPublishedStories(userId);

    res.json({
      drafts: drafts || [],
      published: published || [],
    });
  } catch (err) {
    console.error("USER STORIES ERROR:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to load stories" });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await req.app.locals.db.getUserDetails(userId);
    const stories = await req.app.locals.db.getUserPublishedStories(userId);

    res.json({
      ...user,
      stories: stories || [],
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: "No user found" });
  }
};

const follow = async (req, res) => {
  try {
    const followerId = req.session.userId;
    const { authorId } = req.body;

    if (!authorId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "authorId required" });
    }

    await req.app.locals.db.followAuthor(followerId, authorId);

    res.json({ status: "Following" });
  } catch (err) {
    console.error("FOLLOW ERROR:", err);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: err.message || "Follow failed" });
  }
};

const unFollow = async (req, res) => {
  try {
    const followerId = req.session.userId;
    const { authorId } = req.body;

    if (!authorId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "authorId required" });
    }

    await req.app.locals.db.unFollowAuthor(followerId, authorId);

    res.json({ status: "Unfollowed" });
  } catch (err) {
    console.error("UNFOLLOW ERROR:", err);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: err.message || "Unfollow failed" });
  }
};


const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ status: "Logged out" });
  });
};

module.exports = {
  getDashboard,
  getUserStories,
  getProfile,
  follow,
  unFollow,
  logout,
};
