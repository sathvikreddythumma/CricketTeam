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
//API 1
app.get("/players/", async (request, response) => {
  const getBookQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getBookQuery);
  const ans = (playersArray) => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    };
  };
  response.send(playersArray.map((each) => ans(each)));
});
//API 2
app.use(express.json());
app.post("/players/", async (request, response) => {
  const plaDetails = request.body;
  const { playerName, jerseyNumber, role } = plaDetails;
  const addPlyDetails = `insert into cricket_team
  (player_name,jersey_number,role)
  values
  ('${playerName}',
   '${jerseyNumber}',
   '${role}');`;
  const playersArray = await db.run(addPlyDetails);
  const player_id = playersArray.lastID;
  {
    player_id: player_id;
  }

  response.send(playersArray);
});
//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPly = `SELECT * FROM cricket_team where player_id='${playerId}';`;
  const plaArray = await db.get(getPly);
  response.send(plaArray);
});
//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const plaDetails = request.body;
  const { playerName, jerseyNumber, role } = plaDetails;
  const upPlyDetails = `UPDATE  cricket_team SET
 
  player_name='${playerName}',
   jersey_number='${jerseyNumber}',
   role='${role}'
    WHERE
      player_id = '${playerId}';`;
  const playersArray = await db.run(upPlyDetails);
  const ans = (playersArray) => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    };
  };
  response.send(playersArray);
});
//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPly = `DELETE FROM cricket_team where player_id= ${playerId};`;
  const plaArray = await db.run(getPly);
  response.send("Player Removed");
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
