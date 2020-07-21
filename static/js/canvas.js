
function canvasImageCapture() {
    var canvasImage = canvas.toDataURL();
    canvasDataPusher(canvasImage);
}
let canvasDataPusher = function (image) {
    $.ajax({
        url: '/canvasData',
        type: 'POST',
        data: {
            'image': image,
            'id': id,
            'csrfmiddlewaretoken': csrfmiddlewaretoken,
        },
        success: function () {
        }
    });
}
//running the function only after the window is completely loaded
window.addEventListener("load", () => {
    //refrence for canvas
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    //resizing canvas
    canvas.height = 570;
    canvas.width = 650;
    // for finding the position of canvas
    const rect = canvas.getBoundingClientRect();

    //variables
    let painting = false;
    let offset_left = rect.left - window.scrollX;
    let offset_top = rect.top - window.scrollY;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    painter = true;

    function scroll() {
        offset_left = rect.left - window.scrollX;
        offset_top = rect.top - window.scrollY;
    }

    function startPosition(e) {
        painting = true;
        draw(e);
    }
    function finishPosition() {
        canvasImageCapture();
        painting = false;
        ctx.beginPath();
    }
    function draw(e) {
        if (!painting || Number(document.getElementById("time").innerText) < 1 || !painter) return;
        ctx.lineTo(e.clientX - offset_left, e.clientY - offset_top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - offset_left, e.clientY - offset_top);
    }
    $("#canvas").hover(function () {
        $("body").css('overflow-y', 'hidden');
    });

    $("#canvas").mouseleave(function () {
        $("body").css('overflow', 'scroll');
    });


    //event manager
    canvas.addEventListener("mousedown", startPosition)
    canvas.addEventListener("touchstart", startPosition)
    window.addEventListener("mouseup", finishPosition)
    window.addEventListener("touchend", finishPosition)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("touchmove", draw)
    window.addEventListener("scroll", scroll);
});
