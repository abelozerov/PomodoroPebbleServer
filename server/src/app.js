/**
 * Created by alexeybelozerov on 08/12/14.
 */

var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();

app.use(express.static(__dirname + '/public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

var constants = {
    workIntervalLength: 1500/60, // seconds,
    restIntervalLength: 300/60 // seconds
}

var currentTimer = {
    timestampStarted: null,
    timestampPaused: null,
    type: "work", // "work" or "rest"
    state: "stopped", // "stopped" or "progress" or "paused". "stopped" is default
    pomodoroCounter: 1
};

app.get('/', function (req, res) {
    res.render("index");
});

app.get('/timer', function (req, res) {
    res.send(currentTimer)
});

app.post('/timer/start', function (req, res) {
    switch(currentTimer.state) {
        case "stopped":
            currentTimer.timestampStarted = _getCurrentTimestamp();
            currentTimer.state = "progress";
            break;
        case "paused":
            currentTimer.timestampStarted = _getCurrentTimestamp() - (currentTimer.timestampPaused - currentTimer.timestampStarted);
            currentTimer.timestampPaused = null;
            currentTimer.state = "progress";
            break;
        case "progress":
        default:
            break;
    }
    res.send(currentTimer)
});

app.post('/timer/pause', function (req, res) {
    switch(currentTimer.state) {
        case "progress":
            currentTimer.timestampPaused = _getCurrentTimestamp();
            currentTimer.state = "paused";
            break;
        case "paused":
        case "stopped":
        default:
            break;
    }

    res.send(currentTimer)
});

app.post('/timer/stop', function (req, res) {
    switch(currentTimer.state) {
        case "progress":
        case "paused":
            currentTimer.timestampStarted = null;
            currentTimer.timestampPaused = null;
            currentTimer.type = "work";
            currentTimer.state = "stopped";
            break;
        case "stopped":
        default:
            break;
    }

    res.send(currentTimer)
});

function _getCurrentTimestamp() {
    return Math.floor(new Date() / 1000);
        /// 60; // for testing 1 second = 1 min, time boost x60
}

function _timestampToDate(unixTime) {
    return new Date(unixTime);
}

setInterval(function() {

    switch (currentTimer.state) {
        case "progress":
            var timeInterval = _timestampToDate(_getCurrentTimestamp() - currentTimer.timestampStarted);

            if(currentTimer.type == "work" && timeInterval >= constants.workIntervalLength - 1) {
                currentTimer.type = "rest";
                currentTimer.timestampStarted = _getCurrentTimestamp() - timeInterval + constants.workIntervalLength;
            } else if(currentTimer.type == "rest" && timeInterval >= constants.restIntervalLength - 1) {
                currentTimer.pomodoroCounter++;
                if(currentTimer.pomodoroCounter > 99)
                    currentTimer.pomodoroCounter = 1;
                currentTimer.type = "work";
                currentTimer.timestampStarted = _getCurrentTimestamp() - timeInterval + constants.restIntervalLength;
            }
            break;
        case "paused":
        case "stopped":
        default:
            break;
    }

}, 50);

var server = app.listen(app.get('port'), function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Pomodoro-beaver app listening at http://%s:%s', host, port)

});