// .ENV
require("dotenv").config();
const express = require('express')
const app = express()
const port = 8080
var XMLHttpRequest = require('xhr2');
app.get('/', (req, res) => {
  res.send('The Status will update after every 30 second , no instant update is visible, so just listen the song')
})

app.listen(port, () => {
  console.log(`Server online!`)
})

// Code
const fs = require('fs');
const revolt = require('revolt.js');
const client = new revolt.Client();
thetoken = process.env.user_token;
function spotify(username, api_key) {
  var request = require("request");
  const fs = require("fs"); //If you get any sort of error when first running, try type 'npm install fs' into your terminal
  var headers = {
    Accept: "application/json",
  };
  var options = {
    url: `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${api_key}&format=json&limit=1`,
    headers: headers,
  };
  setInterval(() => {
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        let student = JSON.parse(body);

        var recent = student.recenttracks;
        var track = recent.track;
        var one = track[0];

        const lastSong = student.recenttracks.track?.[0];

        if (!lastSong || !lastSong["@attr"]?.nowplaying) {
          // console.log("Not playing anything");
          return "Not playing anything";
        }
        else {
          const artist = `${lastSong.artist["#text"]}`;
          const song = `${lastSong.name}`;
          console.log(`playing ${song} by ${artist}`);
          // const text = `🎵playing ${song} by ${artist}`;
          // client.users.edit({
          //   status: {
          //     text: text
          //   }
          // });
          thestatus = `🎵playing ${song} by ${artist}`
          function request(lareq, laurl, lathing, after) {
            laurl = "https://api.revolt.chat" + laurl
            var statusreq = new XMLHttpRequest();
            statusreq.open(lareq, laurl, true);
            if (thetoken !== undefined) {
              statusreq.setRequestHeader("x-session-token", thetoken);
            }
            statusreq.setRequestHeader("Accept", "*/*");
            statusreq.setRequestHeader("Content-Type", "application/json");

            statusreq.onreadystatechange = function() {
              if (statusreq.readyState === 4) {
                status = statusreq.status;
                resp = statusreq.responseText;
                console.log(lareq + ": " + laurl + ", got " + statusreq.status);
                if (typeof after == "function") {
                  after(status, resp);
                }
              }
            };
            if (lathing == null) {
              statusreq.send();
            }
            else {
              statusreq.send(lathing);
            }
          }

          request("PATCH", "/users/@me", '{"status":{"text":"' + thestatus + '"}}');
          return `playing ${song} by ${artist}`;
        }

      }
    }
    request(options, callback);
  }, 30000);
}

const username = `${process.env.spotify_username}`;
const api_key = `${process.env.api_key}`;

spotify(username, api_key);
