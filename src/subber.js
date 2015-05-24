var p = require('path');
var fs = require('fs');
var omdb = require('omdb');
var walk = require('walkdir');
var yifysubs = require('yifysubs');
var download = require('download');

var subber = (function(){
  var subber = subber || [];

  subber.fetchSubtitles = function(imdbId, moviefilename) {
    console.log("Searching for English subtitles...");
    yifysubs.searchSubtitles('english', imdbId, function(result){
      if (result['english']) {
        console.log("English subtitles found. Downloading...");
        new download({mode: '755', extract: true})
          .get(result['english']['url'])
          .rename(function(path) {
            path.basename = moviefilename + '.EN';
          })
          .dest('.')
          .run(function (err, files) {
            if (err) {
              return console.error(err);
            }
            console.log('Subtitles downloaded successfully');
          })
      } else {
        console.log("English subtitles for the movie not found.");
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
      subber.fetchSubtitles(movies[0].imdb, moviefilename);
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
