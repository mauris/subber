#!/usr/bin/env node
var p = require('path');
var fs = require('fs');
var omdb = require('omdb');
var walk = require('walkdir');
var yifysubs = require('yifysubs');
var download = require('download');

var languages = {
  "ZH": {
    "user": "Chinese",
    "index": "chinese",
    "code": "ZH"
  },
  "DA": {
    "user": "Danish",
    "index": "danish",
    "code": "DA"
  },
  "EN": {
    "user": "English",
    "index": "english",
    "code": "EN"
  },
  "ES": {
    "user": "Spanish",
    "index": "spanish",
    "code": "ES"
  },
  "JA": {
    "user": "Japanese",
    "index": "japanese",
    "code": "JA"
  },
  "KO": {
    "user": "Korean",
    "index": "korean",
    "code": "KO"
  }
}

var subber = (function(){
  var subber = subber || [];

  subber.fetchSubtitles = function(imdbId, moviefilename, language) {
    console.log("Searching for " + language.user + " subtitles...");
    yifysubs.searchSubtitles(language.index, imdbId, function(result){
      if (result[language.index]) {
        console.log(language.user + " subtitles found. Downloading...");
        new download({mode: '755', extract: true})
          .get(result[language.index]['url'])
          .rename(function(path) {
            path.basename = moviefilename + '.' + language.code;
          })
          .dest('.')
          .run(function (err, files) {
            if (err) {
              return console.error(err);
            }
            console.log(language.user + ' subtitles downloaded successfully');
          })
      } else {
        console.log(language.user + " subtitles for the movie not found.");
      }
    });
  }

  subber.queryMovieId = function(name) {
    var moviefilename = name;
    name = name.match(/^(.*)\.\d{4}/)[1].replace('.', ' ');
    console.log("Loading IMDB ID of", name);

    omdb.search(name, function(err, movies) {
      if (err) {
        return console.error(err);
      }
      if (movies.length < 1) {
        return console.log('No movies were found for ' + name);
      }

      console.log('Movie ID Found:', movies[0].imdb);
      subber.fetchSubtitles(movies[0].imdb, moviefilename, languages['EN']);
    });
  }

  subber.findMovieFile = function(){
    console.log("Finding movie file...");
    walk('./', function(path, stat){
      if (p.extname(path) === '.mp4') {
        console.log("Movie", p.basename(path), "is found.");
        subber.queryMovieId(p.basename(path));
        this.end();
      }
    });
  }

  subber.findMovieFile();
  return subber;
})();
