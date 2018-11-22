const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const request = require('request-promise');
const fs = require('fs');
var mp3Duration = require('mp3-duration');
var compression = require('compression')
var app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(compression({
  level: 9
}));

var podcastRoot = '/home/files/';

app.post('/updatePosition', (req, res) => {
  var elapsed = req.body.elapsed;
  var code = req.body.name;
  var parts = code.split('|');
  var podcastName = parts[0];
  var episodeName = parts[1];



  podcastFolder = podcastName.replace(/[^a-z0-9/-]/gi, '_');
  episodeName = episodeName.replace(/[^a-z0-9/-]/gi, '_');

  var path = podcastRoot + podcastFolder + '/' + episodeName + '.episodeMeta';


  try {
    var data = fs.readFileSync(path);



    var episodeMeta = JSON.parse(data);


    episodeMeta.elapsed = elapsed;

    //For long audiobooks, set complete threshold at either 5 minutes or 10%
    var threshold = 300;
    if (0.1 * episodeMeta.length < 300)
      threshold = 0.1 * episodeMeta.length;

    console.log("threshold = " + threshold);
    console.log("elapsed = " + elapsed);


    if (episodeMeta.elapsed > episodeMeta.length - threshold) {
      episodeMeta.completed = true;
      console.log("Setting completed");
    } else if (elapsed == 0)
      episodeMeta.completed = false;

    fs.writeFileSync(path, JSON.stringify(episodeMeta));
    res.status(200).send();
  } catch {
    res.status(500).send();
  }

});

app.post('/episodeCompletedStatus', (req, res) => {

  var code = req.body.name;
  var parts = code.split('|');
  var podcastName = parts[0];
  var episodeName = parts[1];


  podcastFolder = podcastName.replace(/[^a-z0-9/-]/gi, '_');
  episodeName = episodeName.replace(/[^a-z0-9/-]/gi, '_');


  try {
    var path = podcastRoot + podcastFolder + '/' + episodeName + '.episodeMeta';

    var episodeMeta = fs.readFileSync(path);
    var episode = JSON.parse(episodeMeta);

    episode.completed = req.body.completed;

    fs.writeFileSync(path, JSON.stringify(episode))

    res.status(200).send();
  } catch (e) {

    res.status(500).send();
  }
});

app.get('/episodeAudio', (req, res) => {
  var code = req.query.name;
  var parts = code.split('|');
  var podcastName = parts[0];
  var episodeName = parts[1];




  podcastFolder = podcastName.replace(/[^a-z0-9/-]/gi, '_');
  episodeName = episodeName.replace(/[^a-z0-9/-]/gi, '_');

  if (episodeName === "undefined")
    res.send(500);

  var path = podcastRoot + podcastFolder + '/' + episodeName + '.mp3';


  var data = fs.readFileSync(path);

  var range = req.headers.range;
  var parts = range.replace(/bytes=/, "").split("-");
  var partialstart = parts[0];
  var partialend = parts[1];
  var start = parseInt(partialstart, 10);
  var end = partialend ? parseInt(partialend, 10) : data.length;
  var chunksize = (end - start);

  if (start == 0 && end == data.length) {

    res.writeHead(200, {
      "Content-Type": "audio/mp3",
      "Accept-Ranges": "bytes",
      "Content-Length": data.length,
      "Content-Range": "bytes 0 -" + (data.length - 1) + "/" + data.length,
    });
    fs.createReadStream(path).pipe(res);
  } else {
    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + (end - 1) + "/" + data.length,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mp3"
    });
    res.end(data.slice(start, end));
  }
  //res.end(data);
  //res.status(200).send(data);

})

app.get('/podcastInfo', (req, res) => {
  var podcastFolder = podcastRoot + req.query.name;
  podcastFolder = podcastFolder.replace(/[^a-z0-9/-]/gi, '_');
  var toRet = {};
  toRet.episodes = [];
  try {
    var podcastMeta = fs.readFileSync(podcastFolder + '/.podcastMeta');
    var podcast = JSON.parse(podcastMeta);
    toRet.podcast = podcast;

    var files = fs.readdirSync(podcastFolder);
    for (var i = 0; i < files.length; i++) {
      var filename = podcastFolder + '/' + files[i];
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {

      } else if (filename.indexOf('.episodeMeta') >= 0) {
        var episodeMeta = fs.readFileSync(filename);
        var episode = JSON.parse(episodeMeta);
        toRet.episodes.push(episode);
      }
    }




    res.status(200).send(JSON.stringify(toRet));
  } catch (e) {

    res.status(500).send();
  }
})


app.get('/listPodcasts', (req, res) => {
  var folders = fs.readdirSync(podcastRoot);

  var toRet = {};
  toRet.podcasts = [];
  folders.forEach(folder => {
    var podcastFolder = podcastRoot + folder;

    try {
      var podcastMeta = fs.readFileSync(podcastFolder + '/.podcastMeta');
      var podcast = JSON.parse(podcastMeta);
      toRet.podcasts.push(podcast);
    } catch (e) {

    }
  });

  res.status(200).send(JSON.stringify(toRet));
})


function procItemsNoOverwrite(items, path) {
  var item = items.pop();

  if (item == undefined) {
    return;
  }

  item.title = unescape(item.title);

  var episodeMeta = {};
  episodeMeta.name = item.title;
  episodeMeta.url = item.enclosure.link;
  episodeMeta.desc = item.description;
  episodeMeta.thumb = item.image;
  episodeMeta.date = item.pubDate;
  episodeMeta.completed = false;

  var ep = episodeMeta.name.replace(/[^a-z0-9/-]/gi, '_');

  var eMetaPath = path + '/' + ep + '.episodeMeta';

  //console.log(episodeMeta.url);

  //Only DL if meta is inexistant
  if (episodeMeta.url != undefined && !fs.existsSync(eMetaPath)) {

    var stream = request(episodeMeta.url).pipe(fs.createWriteStream(path + '/' + ep + '.mp3'));
    stream.on('finish', function() {

      mp3Duration(path + '/' + ep + '.mp3', function(err, duration) {

        episodeMeta.length = duration;
        if (!fs.existsSync(eMetaPath)) //Dont overwrite meta
          fs.writeFileSync(eMetaPath, JSON.stringify(episodeMeta))
      });

      procItemsNoOverwrite(items, path);

    });
  } else {
    procItemsNoOverwrite(items, path);
  }
}

function procItems(items, path) {
  var item = items.pop();

  if (item == undefined) {
    return;
  }

  item.title = unescape(item.title);

  var episodeMeta = {};
  episodeMeta.name = item.title;
  episodeMeta.url = item.enclosure.link;
  episodeMeta.desc = item.description;
  episodeMeta.thumb = item.image;
  episodeMeta.date = item.pubDate;
  episodeMeta.completed = false;

  var ep = episodeMeta.name.replace(/[^a-z0-9/-]/gi, '_');

  var eMetaPath = path + '/' + ep + '.episodeMeta';

  //console.log(episodeMeta.url);

  if (episodeMeta.url != undefined) {
    var stream = request(episodeMeta.url).pipe(fs.createWriteStream(path + '/' + ep + '.mp3'));
    stream.on('finish', function() {

      mp3Duration(path + '/' + ep + '.mp3', function(err, duration) {

        episodeMeta.length = duration;
        if (!fs.existsSync(eMetaPath)) //Dont overwrite meta
          fs.writeFileSync(eMetaPath, JSON.stringify(episodeMeta))
      });

      procItems(items, path);

    });
  } else {
    procItems(items, path);
  }
}

app.post('/updatePodcast', (req, res) => {
  var url = req.body.url;

  request(url).then(body => {
    var rss = JSON.parse(body);
    var podcastInfo = rss.feed;
    var podcastMeta = {};
    podcastMeta.name = podcastInfo.title;
    var path = podcastRoot + podcastMeta.name;

    path = path.replace(/[^a-z0-9/-]/gi, '_');

    try {
      try {
        fs.mkdirSync(path);
      } catch (err) {}

      fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);

      var pMetaPath = path + '/.podcastMeta';

      procItemsNoOverwrite(rss.items, path);

      res.status(200).send();

    } catch (err) {
      res.status(500).send();
      console.error('no access!' + err);
    }
  });

})

app.post('/downloadPodcast', (req, res) => {
  var url = req.body.url;

  request(url).then(body => {
    var rss = JSON.parse(body);
    var podcastInfo = rss.feed;
    podcastInfo.description = podcastInfo.description.replace(/<\/?(?!a|br)\w+>/gi, "");
    var podcastMeta = {};
    podcastMeta.name = podcastInfo.title;
    podcastMeta.url = podcastInfo.url;
    podcastMeta.homepage = podcastInfo.link;
    podcastMeta.desc = podcastInfo.description;
    podcastMeta.thumb = podcastInfo.image;



    var path = podcastRoot + podcastMeta.name;

    path = path.replace(/[^a-z0-9/-]/gi, '_');

    try {
      try {
        fs.mkdirSync(path);
      } catch (err) {}

      fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);

      var pMetaPath = path + '/.podcastMeta';

      fs.writeFileSync(pMetaPath, JSON.stringify(podcastMeta))

      procItems(rss.items, path);

      res.status(200).send();

    } catch (err) {
      res.status(500).send();
      console.error('no access!' + err);
    }



  });

})

app.post('/updatePodcastMetadata', (req, res) => {
  var name = req.body.name;
  var podcastFolder = name.replace(/[^a-z0-9/-]/gi, '_');

  try {
    var path = podcastRoot + podcastFolder + '/' + '.podcastMeta';
    var podcastMeta = fs.readFileSync(path);
    var podcast = JSON.parse(podcastMeta);
    var newPodcast = req.body.podcast;

    //Safe replace
    podcastMeta.name = newPodcast.name;
    podcastMeta.desc = newPodcast.desc;
    podcastMeta.thumb = newPodcast.thumb;

    fs.writeFileSync(path, req.body.podcast)

    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.listen(3000, () => console.log('Audiobook backend running, recomend running using nodemon wrapped in a service'))