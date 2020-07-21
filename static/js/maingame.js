// var color_to_hex_dict = {
//     "black": "#000000", "blue": "#0000ff", "brown": "#a52a2a", "gray": "#808080", "green": "#008000",   "hotpink": "#ff69b4" , "red": "#ff0000", "orange": "#ffa500", "white": "#ffffff", "yellow": "#ffff00",
// };
const hex_to_color_dict = {
    "#000000": "black", "#0000ff": "blue", "#a52a2a": "brown", "#808080": "gray", "#008000": "green", "#ff69b4": "hotpink", "#ff0000": "red", "#ffa500": "orange", "#ffffff": "white", "#ffff00": "yellow",
};



// run this function only after the window loads completely
window.addEventListener("load", () => {
    // variables
    //refrence for canvas
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    // drwaing state pen means drawing eraser means erasing
    let mode = "pen";
    // thickness of the brush
    let thickness = document.getElementById("slider").value;
    // colour of the brush
    let colour = $(this).attr("class");

    let username = document.getElementById("liveusername").innerHTML;
    localStorage.setItem('username', username);

    // fetching all the buttons
    let buttons = document.getElementsByTagName("button");
    buttons = [].slice.call(buttons);
    buttons.forEach(loopfunction);
    //looping through the buttons to give them colour and style
    function loopfunction(item) {
        item.style.backgroundColor = item.className;
        item.style.border = "none";
        if (item.id == mode || item.className == hex_to_color_dict[ctx.strokeStyle]) {
            item.style.border = "2px solid black";
        }
    }
    // change the thickness of brush acc to silder
    function change_thickness() {
        thickness = document.getElementById("slider").value;
        ctx.lineWidth = thickness;
    }
    // when any button is clicked run the function
    $("button").on("click", function () {
        if (Number(document.getElementById("time").innerText) > 0) {
            if ($(this).attr("id") == "eraser") {
                ctx.globalCompositeOperation = "destination-out";
                mode = "eraser";
            }
            else if ($(this).attr("id") == "pen") {
                ctx.globalCompositeOperation = "source-over";
                mode = "pen";
            }
            else if ($(this).attr("id") == "clear") {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            colour = $(this).attr("class")
            ctx.strokeStyle = colour;
            buttons.forEach(loopfunction);
            // giving border to selected item
            $(this).css("border", "2px solid black");
        }
    });
    let pageExitAjax = function () {
        $.ajax({
            type: 'POST',
            url: '/pageexit',
            data: {
                'username': username,
                'id': id,
                'csrfmiddlewaretoken': csrfmiddlewaretoken,
            },
            success: function () { }
        });
    }

    // EVENTS
    // change the value of slider on mouse scroll
    canvas.addEventListener("wheel", (e) => {
        document.getElementById("slider").value -= (e.wheelDelta / 180) * -5;
        change_thickness();
    });
    // change thickness if the slider val is changed
    document.getElementById("slider").addEventListener("mouseup", change_thickness);

    //does some stuffs after the user leavas the page
    $(window).on("unload", (e) => {
        if (confirm('Are you sure you want to leave?')) {
            pageExitAjax();
            alert('Yo will leave the page');
        }
    });

});
