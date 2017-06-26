var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Datastore = require('nedb');
var db = new Datastore({
    filename: 'data/employees.db',
    autoload: true
});

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var PORT = 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
    console.log("A user connected.")
    socket.on('add', function (data) {
        io.emit('add', data);
    });
    socket.on('update', function (data) {
        io.emit('update', true);
    });
    socket.on('delete', function (data) {
        io.emit('delete', true);
    });
});

app.get('/', function (req, res) {
    res.render('index')
});

app.get('/api/employees', function (req, res) {
    db.find({}, function (err, docs) {
        if (err) {
            res.json({
                success: false,
                message: err
            });
        } else {
            res.json(docs);
        }
    })
});

app.post('/api/employees', function (req, res) {
    var employee = req.body;
    db.insert(employee, function (err, newDoc) {
        if (err) {
            res.json({
                success: false,
                message: err
            });
        } else {
            res.json({
                success: true,
                doc: newDoc
            });
        }
    });
});

app.put('/api/employees', function (req, res) {
    var employee = req.body;
    db.update({
        _id: employee._id
    }, employee, {}, function (err, numReplaced) {
        if (err) {
            res.json({
                success: false,
                message: err
            });
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.delete('/api/employees/:_id', function (req, res) {
    var _id = req.params._id;
    db.remove({
        _id: _id
    }, {}, function (err, numRemoved) {
        if (err) {
            res.json({
                success: false,
                message: err
            });
        } else {
            res.json({
                success: true
            });
        }
    });
});

http.listen(PORT, function () {
    console.log(`Server Started on Port ${PORT}....`);
})