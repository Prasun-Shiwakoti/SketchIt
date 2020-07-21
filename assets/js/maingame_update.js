// THIS FILE IS RESPONSIBLE TO DO LIVE UPDATE IN maingame.html

let element = '';
let onceAlert = true;
let canvasImage = new Image();
window.addEventListener("load", () => {
    // variables
    const inbox = document.getElementById("guess_input");
    const liveUser = document.getElementById('liveusername').innerHTML;
    const canvasDrawingArea = document.getElementById("canvas");
    const ctx = canvasDrawingArea.getContext('2d');

    function non_leaders_update() {
        $('.non_leaders_list').load(location.href + ' .non_leaders', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
    }
    setInterval(non_leaders_update, 3000);

    function chat_update() {
        $('.show_chat').load(location.href + ' .actual_chat', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
        setTimeout(function () {
            var lastChat = document.getElementsByClassName('actual_chat')[0];
            try {
                if (lastChat.classList[1] == 'system_chat') {
                    document.getElementById('guess_input').disabled = false;
                }
                if (lastChat.classList[1] == 'right_guess') {
                    if (lastChat.innerText.split(' ')[0] == liveUser) {
                        document.getElementById('guess_input').disabled = true;
                    }
                    leaders_update();
                }
            }
            catch (exception) { }
        }, 300)
    }
    setInterval(chat_update, 500);

    function leaders_update() {
        $('.leadersList').load(location.href + ' .leaders', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
    }
    function update_all() {
        time_update();
        var currentTime = document.getElementById('time').innerText;
        if (Number(currentTime) > 87 || Number(currentTime) < 3) {
            blankWord_update();
            painter_update();
            round_update();
        }
    }
    setInterval(update_all, 1000);

    function time_update() {
        $('#time').load(location.href + ' timeholder', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
        if (Number(document.getElementById("time").innerText) < 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvasImageCapture();
            if (Number(($('.rounds')[0].innerText).split(' ')[1]) == 5) {
                var winner = document.getElementsByClassName('leaders')[0].innerText;
                winner = winner.split(':')[0];
                if (onceAlert) {
                    alert(`GAME HAS FINISHED! ${winner} has won the game.`);
                    onceAlert = false;
                }
            }
        }
    }
    function blankWord_update() {

        $('.blank_word').load(location.href + ' .blank_word b', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });

    }
    function painter_update() {
        $('#currentArtist').load(location.href + ' #currentArtist b', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
        currentArtist = document.getElementById('currentArtist').innerText;
        painter = (document.getElementById('liveusername').innerHTML == currentArtist || currentArtist == ' ');
    }
    function round_update() {
        $('.rounds').load(location.href + ' .rounds roundholder', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
    }
    function canvas_update() {
        if (liveUser != document.getElementById('currentArtist').innerText && document.getElementById('currentArtist').innerText != ' ') {
            $('#imgcode').load(location.href + ' #imgcode', { 'userToVerify': liveUser, 'csrfmiddlewaretoken': csrfmiddlewaretoken });
            var imgCode = document.getElementById('imgcode').innerText;
            canvasImage.src = imgCode;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvasImage, 0, 0);
        }
    }
    setInterval(canvas_update, 100);

    let answercheck = function (guess, id, chatter) {
        $.ajax({
            type: 'POST',
            url: '/answercheck',
            data: {
                'id': id,
                'username': chatter,
                'guess': guess,
                'csrfmiddlewaretoken': csrfmiddlewaretoken,
            },
            success: function () { },
        });
    }
    let guess = document.getElementById("guess_input").value;
    inbox.onkeypress = function (e) {
        if (e.keyCode == 13) {
            guess = document.getElementById("guess_input").value;
            if (guess.length > 0) {
                document.getElementById("guess_input").value = "";
                answercheck(guess, id, liveUser);
            }
        }
    };
});

