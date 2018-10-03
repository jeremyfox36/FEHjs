const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const pg = require("pg");
const format = require("pg-format");
const plotly = require("plotly")("jeremyfox36", "riRDfe6P2b2qczPHl2We");

const PGUSER = "postgres";
const PGDATABASE = "feh1";

//app settings
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));//support parsing of application/x-www-form-urlencoded post data 

//database config
var config = {
    user: PGUSER,
    database: PGDATABASE,
    max: 10,
    idelTimeoutMillis: 30000
}

var pool = new pg.Pool(config);
var myClient;

pool.connect(function(err, client, done){
    if(err){
        console.log(err)
    }else{
        app.listen(3000, function(){
            console.log("listening on port 3000");
            })
    }
    
    app.get("/catchments", function(req, res){
    myClient = client;
    var q = format('SELECT * FROM cd3_data;');
        myClient.query(q, function test(err, result){
            if(err){
                console.log(err);
            }else{
                var catchments = result.rows;
                //console.log(tables);
                res.render(
                    'index', {catchments: catchments}
                )
            }
        })
    })
    //catchments end

    app.get("/catchments/:stationnum", function(req, res){
        myClient = client;
        let st = req.params.stationnum;
        let q = {
            text:'SELECT * FROM amaxdata WHERE stationnum = $1 ORDER BY mon_date ASC;',
            values: [st]
        }
        myClient.query(q, function amax(err, result){
            if(err){
                console.log(err)
            }else{
                var station = result.rows;
                var stnum = result.rows[0].stationnum;
                //stolen code
                var flow = [];
                var dates = [];
                var data = [];
                var chartSetup = {}
                station.forEach(function(val){
                    flow.push(val["flow"]);
                    dates.push(val["mon_date"]);           
                })
                chartSetup = {
                    x: dates,
                    y: flow,
                    type: "scatter"
                }
                data.push(chartSetup);
                var graphOptions = {filename: "date-axes", fileopt: "overwrite"};
                plotly.plot(data, graphOptions, function (err, msg) {
                    console.log(msg["url"]);
                });
                res.render('show', {station: station, stnum: stnum})
                // console.log(q)
                // console.log(st);
            }
        })
    })
    //catchments/:stationnum end
})