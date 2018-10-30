const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000
const { Pool } = require("pg");

const PGUSER = "postgres";
const PGDATABASE = "feh1";

//app settings
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));//support parsing of application/x-www-form-urlencoded post data 
app.use(express.static(__dirname + '/public'));

//database config
var config = {
    user: PGUSER,
    database: PGDATABASE,
    max: 10,
    idelTimeoutMillis: 30000
}

const pool = new Pool(config);//local

//just for Heroku deployment
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     //ssl: true
// });

app.get("/", async(req, res) =>{
    try{
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM cd3_data");
        const results = { 'results':(result) ? result.rows : null};
        //res.send(results)
        console.log(result.rows)
        res.render(
            "index", {catchments: result.rows});
        client.release();
    } catch (err){
        console.log(err);
        res.send("Error " + err);
    }
})

app.get("/catchments/:stationnum", async(req, res) =>{
    var st = req.params.stationnum;
    const q = {
        text:'SELECT * FROM amaxdata WHERE stationnum = $1 ORDER BY mon_date ASC;',
        values: [st]
    }
    try{
        const client = await pool.connect()
        const result = await client.query(q);
        const results = { 'results':(result) ? result.rows : null};
        var station = result.rows;
        var stnum = result.rows[0].stationnum;
        res.render('show', {station: station, stnum: stnum})
    } catch(err){
        console.log(err);
        res.send("Error " + err);
    }      
    })

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))