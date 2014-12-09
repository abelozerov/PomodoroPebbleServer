/**
 * Created by alexeybelozerov on 09/12/14.
 */

$(function() {

    var constants = {
        workIntervalLength: 1500/60, // seconds,
        restIntervalLength: 300/60 // seconds
    }

    $(".pb-btn-start").on("click", function() {
        sendTimerMessage("start");
        $(".pb-btn-start").hide();
        $(".pb-btn-pause").show();
        $(".pb-btn-stop").show();
    });
    $(".pb-btn-pause").on("click", function() {
        sendTimerMessage("pause");
        $(".pb-btn-start").show();
        $(".pb-btn-pause").hide();
        $(".pb-btn-stop").show();
    });
    $(".pb-btn-stop").on("click", function() {
        sendTimerMessage("stop");
        $(".pb-btn-start").show();
        $(".pb-btn-pause").hide();
        $(".pb-btn-stop").hide();
    });

    setInterval(function() {
        $.get("timer", function(data, txtStatus, xhr) {
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

        } else if(timerState.state == "paused") {

            if (timerState.timestampStarted && timerState.timestampPaused) {
                elapsed = interval - (timerState.timestampPaused - timerState.timestampStarted);
            }

        }

        if(elapsed) {
            minutes = Math.floor(elapsed / 60);
            seconds = elapsed % 60;
        }
        $(".pb-clock-minutes").text(minutes);
        $(".pb-clock-seconds").text(seconds);
    }

    function _getCurrentTimestamp() {
        return Math.floor(new Date() / 1000);
    }

})