const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const busboy = require('connect-busboy');

const port = 3000;

var dirFile = path.join(__dirname, 'public', 'file.txt');
var jsonFile = path.join(__dirname, 'public', 'count.json');

app.set('view engine', 'ejs');
app.use(busboy());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(dirFile);
});
app.get('/download', function(req, res) {
  res.download(dirFile);
});

app.get('/upload', function(req, res) {
  res.render('index');
});

app.post('/saveuplodedfiles', function(req, res) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function(filename, file, filename) {
    console.log('Uploading: ' + filename);
    fstream = fs.createWriteStream(path.join(__dirname, 'public', filename));
    file.pipe(fstream);
    fstream.on('close', function() {
      res.redirect('/');
    });
  });
});

app.post('/', function(req, res) {
  let count = JSON.parse(fs.readFileSync(jsonFile)).counter;
  count += 1;
  fs.writeFileSync(jsonFile, JSON.stringify({ counter: count }));
  console.log(count);

  let data = `${fs.readFileSync(dirFile)} \n ${req.body.data}`;

  fs.writeFile(dirFile, data, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
  var myReadStream = fs.createReadStream(dirFile, 'utf8');
  var myWriteStream = fs.createWriteStream(dirFile);
  myReadStream.on('data', chunk => {
    console.log('new chunk', chunk);
    myWriteStream.write(chunk);
  });

  console.log(req.body.data);
  res.send('hello');
});

app.get('/count', function(req, res) {
  let count = JSON.parse(fs.readFileSync(jsonFile)).counter.toString();
  res.send(count);
});

app.listen(port, function() {
  console.log('Server is running at port: ', port);
});
