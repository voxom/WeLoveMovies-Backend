const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// /movies?is_showing=true lists the given movie
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

// Checks if the movie exists, sends error if not
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

// /:movieId reads the movie if it exists
async function read(req, res) {
  res.json({ data: res.locals.movie });
}

// /:movieId/theaters lists theaters for a given movie
async function listTheatersAndMovie(req, res) {
  const { movie } = res.locals;
  const data = await service.listTheatersAndMovie(movie.movie_id);
  res.json({ data });
}

// /:movieId/reviews lists reviews for a given movie
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
