var speed=1000;
inp_aspeed.addEventListener("change", vis_speed);
function vis_speed() {
    var array_speed = inp_aspeed.value;
    switch(array_speed) {
        case 'verySlow': 
            speed = 1;
            break;
        case 'slow': 
            speed = 10;
            break;
        case 'normal': 
            speed = 100;
            break;
        case 'fast': 
            speed = 1000;
            break;
        case 'veryFast': 
            speed = 10000;
            break;
        default: 
            speed = 100;
    }
    delay_time=10000/(Math.floor(array_size/10)*speed);       
}
var delay_time=10000/(Math.floor(array_size/10)*speed);      

var c_delay=0;//This is updated ov every div change so that visualization is visible.

function div_update(cont,height,color) {
    window.setTimeout(function(){
        cont.style=" margin:0% " + margin_size + "%; width:" + (100/array_size-(2*margin_size)) + "%; height:" + height + "%; background-color:" + color + ";";
        cont.innerHTML = `<div style="display: flex; justify-content: center; height: 100%;">
                <span style="margin: 4px; font-size: 0.6rem;">${height}</span>    </div>`;
    },c_delay+=delay_time);
}

function enable_buttons() {
    window.setTimeout(function() {
        for(var i=0;i<butts_algos.length;i++) {
            butts_algos[i].classList=[];
            butts_algos[i].classList.add("butt_unselected");
            butts_algos[i].disabled=false;
            inp_as.disabled=false;
            inp_gen.disabled=false;
            inp_aspeed.disabled=false;
        }
    },c_delay+=delay_time);
}

