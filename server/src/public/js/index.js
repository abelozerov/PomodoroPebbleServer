/**
 * Created by alexeybelozerov on 09/12/14.
 */

$(function() {

    console.log("Date: " + (new Date().getTime() / 1000));

    var constants = {
        workIntervalLength: 1500/60, // seconds,
        restIntervalLength: 300/60 // seconds
    }

    $(".pb-btn-start").on("click", function() {
        sendTimerMessage("start");
        _renderInProgressView();
    });
    $(".pb-btn-pause").on("click", function() {
        sendTimerMessage("pause");
        _renderPausedView();
    });
    $(".pb-btn-stop").on("click", function() {
        sendTimerMessage("stop");
        _renderStoppedView();
    });

    setInterval(function() {
        $.get("timer", function(data, txtStatus, xhr) {
            console.log("Received from server: " + JSON.stringify(data));
            onTimerStateReceived(data);
        })
    }, 100);

    function sendTimerMessage(message) {
        $.post("timer/" + message, function(data, txtStatus, xhr) {
            onTimerStateReceived(data);
        })
    }

    function onTimerStateReceived(timerState) {

        var interval = 0;
        if (timerState.type == 'work') {
            interval = constants.workIntervalLength;
            $(".pb-app").removeClass("pb-app-state-rest");
        } else if (timerState.type == "rest") {
            interval = constants.restIntervalLength;
            $(".pb-app").addClass("pb-app-state-rest");
        }
        var minutes = Math.floor(interval / 60);
        var seconds = interval % 60;
        var elapsed = 0;

        if(timerState.state == "progress") {

            if (timerState.timestampStarted) {
                elapsed = (timerState.timestampStarted + interval) - _getCurrentTimestamp();
            }
            _renderInProgressView();

        } else if(timerState.state == "paused") {

            if (timerState.timestampStarted && timerState.timestampPaused) {
                elapsed = interval - (timerState.timestampPaused - timerState.timestampStarted);
            }
            _renderPausedView();

        } else if(timerState.state == "stopped") {

            _renderStoppedView();
            
        }

        if(elapsed) {
            if(timerState.type == 'work' && elapsed > constants.workIntervalLength
            || timerState.type == 'rest' && elapsed > constants.restIntervalLength)
                elapsed--;

            minutes = Math.floor(elapsed / 60);
            seconds = elapsed % 60;

            if(minutes<0)
                minutes=0;
            if(seconds<0)
                seconds=0;
        } else {
            if(timerState.state != "stopped")
                minutes = seconds = 0;
        }
        $(".pb-clock-minutes").text(minutes);
        $(".pb-clock-seconds").text(seconds);
        $(".pb-pomodoro-counter").text(timerState.pomodoroCounter);
    }

    function _getCurrentTimestamp() {
        return Math.floor(new Date() / 1000);
    }

    function _renderInProgressView() {
        $(".pb-btn-start").hide();
        $(".pb-btn-pause").show();
        $(".pb-btn-stop").show();
    }

    function _renderPausedView() {
        $(".pb-btn-start").show();
        $(".pb-btn-pause").hide();
        $(".pb-btn-stop").show();
    }

    function _renderStoppedView() {
        $(".pb-btn-start").show();
        $(".pb-btn-pause").hide();
        $(".pb-btn-stop").hide();
    }

})