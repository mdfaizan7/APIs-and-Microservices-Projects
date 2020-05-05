// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

const getDate = (date) => {
  const DATE = date ? new Date(date) : new Date();
  const utc = DATE.toUTCString();
  const unix = date ? DATE.getTime() : Date.now();
  if (utc === "Invalid Date") {
    return { unix: null, utc, error: utc };
  } else {
    return { unix, utc };
  }
};

app.get("/api/timestamp/:date_string?", (request, response) => {
  const { date_string = "" } = request.params;
  if (date_string) {
    const VALID = date_string * 1;
    const DATE = Number.isNaN(VALID) ? getDate(date_string) : getDate(VALID);
    response.status(200);
    console.log(DATE);
    response.json(DATE);
  } else {
    const { originalUrl } = request;
    const { unix } = getDate();
    response.redirect(301, `${originalUrl}/${unix}`);
  }
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
