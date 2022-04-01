const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { is_showing } = req.query;
  let data;
  if (is_showing === "true") {
    data = await service.listMoviesShowing();
  } else {
    data = await service.list();
  }

  res.json({ data });
}

async function movieExists(req, res, next) {
  const { movieId } = req.params;
  const movie = await service.read(Number(movieId));
  if (movie) {
    res.locals.movie = movie;
    return next();
  }
  next({
    status: 404,
    message: "Movie cannot be found.",
  });
}

async function read(req, res) {
  res.json({ data: res.locals.movie });
}

async function listTheatersAndMovie(req, res) {
  const { movie } = res.locals;
  const data = await service.listTheatersAndMovie(movie.movie_id);
  res.json({ data });
}

async function listReviewsAndMovie(req, res) {
  const { movie } = res.locals;
  const data = await service.listReviewsAndMovie(movie.movie_id);
  res.json({ data });
}
module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(movieExists), asyncErrorBoundary(read)],
  listTheatersAndMovie: [
    asyncErrorBoundary(movieExists),
    asyncErrorBoundary(listTheatersAndMovie),
  ],
  listReviewsAndMovie: [
    asyncErrorBoundary(movieExists),
    asyncErrorBoundary(listReviewsAndMovie),
  ],
};
