const { StatusCodes } = require("http-status-codes");

const hasFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(
      (field) => !(field in req.body)   // ✅ FIX
    );

    if (missingFields.length === 0) return next();

    res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        error: "Required fields not present in request body",
        missingFields,
      });
  };
};

const hasQueryParams = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(
      (field) => !(field in req.query)  // ✅ FIX
    );

    if (missingFields.length === 0) return next();

    res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        error: "Required query params not present",
        missingFields,
      });
  };
};

const hasPathParams = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(
      (field) => !(field in req.params) // ✅ FIX
    );

    if (missingFields.length === 0) return next();

    res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        error: "Required path params not present",
        missingFields,
      });
  };
};

const allowAuthorized = (req, res, next) => {
  if (req.session && req.session.userId) {   // ✅ FIX
    return next();
  }

  res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ error: "unauthorized" });
};

const search = (req, res) => {
  req.app.locals.db
    .search(req.query.keyword, req.session.userId) // ✅ FIX
    .then(({ authorBased, tagBased, contentBased }) => {
      res.json({
        authorBased: parseStoriesContent(authorBased),
        tagBased: parseStoriesContent(tagBased),
        contentBased: parseStoriesContent(contentBased),
      });
    })
    .catch(handleFailure(res, StatusCodes.BAD_REQUEST));
};

const handleFailure = (res, statusCode) => {
  return (error) => {
    console.error(error);
    res.status(statusCode).json(error);
  };
};

const handleFailureWithMessage = (res, statusCode, error) => {
  return (e) => {
    console.error(e);
    res.status(statusCode).json({ error });
  };
};

const parseStoriesContent = (stories) => {
  return stories.map((story) => {
    story.content = JSON.parse(story.content);
    return story;
  });
};

module.exports = {
  hasFields,
  hasQueryParams,
  hasPathParams,
  allowAuthorized,
  search,
  handleFailure,
  handleFailureWithMessage,
  parseStoriesContent,
};
