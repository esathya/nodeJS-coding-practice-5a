const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieNameDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get(`/movies/`, async (Request, response) => {
  const getMoviesArrayQuery = `
    SELECT * FROM movie;`;
  const moviesArray = await db.all(getMoviesArrayQuery);
  //console.log(moviesArray);
  response.send(moviesArray.map((name) => ({ movieName: name.movie_name })));
});

app.post("/movies/", async (Request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id,movie_name,lead_actor)
    VALUE (
        '${directorId}',
        '${movieName}',
        '${leadActor}',
    );`;
  const dbResponse = await db.run(addMovieQuery);
  //console.log(dbResponse);
  //const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const getMoviequery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMoviequery);
  response.send(convertMovieNameDbObjectToResponseObject(movie));
});

app.put(`/movies/:movieId/`, async (request, response) => {
  const { directorId, movieNmae, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
        UPDATE movie SET 
        director_id = ${directorId},
        movie_name = ${movieName},
        lead_actor = ${leadActor},
        WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete(`/movies/:movieId/`, async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get(`/directors/`, async (request, response) => {
  const getDirectorQuery = `
      SELECT * FROM  director;`;
  const directorArray = await db.get(getDirectorQuery);
  response.send(
    directorArray.map((director) =>
      convertDirectorDbObjectToResponseObject(director)
    )
  );
});

app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
      SELECT movie_name FROM movie WHERE director_id = '${directorId}';`;
  const movieArray = await db.get(getDirectorMoviesQuery);
  response.send(movieArray.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;
