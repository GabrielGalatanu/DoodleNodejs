var express = require('express');
var app = express();

var fs = require('fs');

var bodyParser = require('body-parser');

//cors
var cors = require('cors');
app.use(cors());

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded


var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://parola:parola@cluster0.le7wn.gcp.mongodb.net/doodle?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

var imageSchema = mongoose.Schema({
    name: String,
    storageID: String
});

var Image = mongoose.model("Image", imageSchema);

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


app.get('/image', (req, res) => {

    Image.find({}, function (err, images) {
        var imageMap = {};

        images.forEach(function (image, key) {
            var base64Data;
           
            try {
                const data = fs.readFileSync('public/' + image.storageID + '.txt', 'utf8')
                base64Data = data;;
              } catch (err) {
                console.error(err)
              }


            imageMap[key] = {image: image, imageBase64: base64Data};
        });

        res.send(imageMap);
      
    });



});


app.post('/image', (req, res) => {
   
    var number = getRandomInt(10000);
    var saveOk = false;

    while (saveOk == false) {
        if (fs.existsSync('public/' + number + '.' + "txt")) {

            number = getRandomInt(10000);

        } else {

            saveOk = true;

        }
    }

    fs.writeFileSync('public/' + number + '.' + 'txt', req.body[0].image.img);

    // var base64Data = req.body[0].image.img.replace(/^data:image\/png;base64,/, "");
    // require("fs").writeFile('public/' + number + '.' + 'png', base64Data, 'base64', function (err) {
    //     console.log(err);
    // });

    var newImage = new Image({
        name: req.body[0].image.name,
        storageID: number
    });

    newImage.save(function (err, Image) {

        if (err) {

            res.render('show_message', { message: "Database error", type: "error" });
        } else {

            res.send({status: 'Ok'});
        }
    });

});




app.listen(2999);