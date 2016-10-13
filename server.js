var fs = require('fs');
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var cloudinary = require('cloudinary');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/myproject';

var log = require('./log');
var config = require('./config');

cloudinary.config({
  cloud_name: config.cloudinary_cloud,
  api_key: config.cloudinary_key,
  api_secret: config.cloudinary_secret,
});

MongoClient.connect(url, function(err, db) {
	console.log("Connected successfully to server");
	startApp(db);
});

var startApp = (db) => {
	var images = db.collection('images');
	var upload = multer({ dest: 'uploads/' })
	var app = express();
	app.use(bodyParser.json());
	app.post('/upload', upload.single('file'), function(req, res) {
		console.log(".................",req.body.tags);
		console.log(".................",req.body.location);

		cloudinary.uploader.upload(req.file.path, function(result) {
			var image = {
				cloudinary_response: result,
				location: req.body.location,
				tags: req.body.tags,
			}

			// Save some stuff
			images.insertOne(image,(result)=>{
				console.log(result);
			});

			fs.unlink(req.file.path,(err)=>{
				res.status(200).json({success: true});
			})
		},{tags:['love','hate']});
	})

	app.listen(3000, function () {
		console.log('Listening on port 3000!');
	});
};
