const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started successfully");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getBookQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getBookQuery);
  //  response.send(booksArray);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.use(express.json());
app.post("/players/", async (request, response) => {
  const plaDetails = request.body;
  const { player_name, jersey_number, role } = plaDetails;
  const addPlyDetails = `insert into cricket_team
  (player_name,jersey_number,role)
  values
  ('${player_name}',
   '${jersey_number}',
   '${role}');`;
  const dbRes = await db.run(addPlyDetails);
  const player_id = dbRes.lastID;
  response.send({ player_id: player_id });
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPly = `SELECT * FROM cricket_team where player_id='${playerId}';`;
  const plaArray = await db.get(getPly);
  response.send(plaArray);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const plaDetails = request.body;
  const { player_name, jersey_number, role } = plaDetails;
  const upPlyDetails = `UPDATE  cricket_team SET
 
  player_name='${player_name}',
   jersey_number='${jersey_number}',
   role='${role}'
    WHERE
      player_id = ${playerId};`;
  const plaArray = await db.run(upPlyDetails);
  response.send(plaArray);
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPly = `DELETE FROM cricket_team where player_id= ${playerId};`;
  const plaArray = await db.run(getPly);
  response.send(plaArray);
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

module.exports = app;
