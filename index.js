// .ENV
require("dotenv").config();
const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => {
  res.send('Server Online!')
})

app.listen(port, () => {
  console.log(`Server online!`)
})

// Code
const fs = require('fs');
const revolt = require('revolt.js');
const client = new revolt.Client();

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
        console.log(` playing ${song} by ${artist}`);
        const text = `🎵playing ${song} by ${artist}`;
        client.users.edit({
          status: {
            text: text
          }
        });
        return `playing ${song} by ${artist}`;
      }

    }
  }
  request(options, callback);
}, 180000);}

const username = "CodeMuciz";
const api_key = "3a9a5967901f6294fa3e4fdc8198ed2f";

spotify(username, api_key);



client.on('ready', () => {
  console.log(`${client.user.username} Bot has started`)




});
client.loginBot(process.env.token);
