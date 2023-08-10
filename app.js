const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeAndDbServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeAndDbServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT
          *
        FROM
          movie
    `;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `
        SELECT
          movie_id AS movieId,
          director_id AS directorId,
          movie_name AS movieName,
          lead_actor AS leadActor
        FROM
         movie
        WHERE
          movie_Id = ${movieId}; 
      `;
  const movie = await db.get(getMoviesQuery);
  console.log(movie);
  response.send(movie);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
       INSERT INTO
         movie(director_id,movie_name,lead_actor)
       VALUES
         (
             '${directorId}',
             '${movieName}',
             '${leadActor}'
         );  
    `;
  const movie = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
        UPDATE
          movie
        SET
          director_id = '${directorId}',
          movie_name = '${movieName}',
          lead_actor = '${leadActor}'
        WHERE
          movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteBookQuery = `
       DELETE FROM
         movie
       WHERE
         movie_id = ${movieId};
    `;
  await db.run(deleteBookQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT
          director_id AS directorId,
          director_name AS directorName
        FROM
          director
    `;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
       SELECT
         *
       FROM
        movie
       WHERE
         director_id = ${directorId};
    `;
  const movieArray = await db.all(getDirectorMovieQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
