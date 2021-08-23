
'use strict';

let activeVidscreen, activeProgram, feature, keysPressed, mouseDown, liveEdit, newCodeTime = 0, autoStart = 1, hasStarted = 0, hasError = 0;
const canvasContext = canvas_main.getContext('2d');

// wrapper for cryptovoxels vidscreen
class VidScreen
{
	constructor()
    {
        this.screenWidth = this.screenHeight = 64;
        this.screen = new Uint8Array(this.screenWidth*this.screenHeight * 3);
        this.callbacks = [];
    }

    on(name, callback) { this.callbacks[name] = callback; }
	callback(name, data) 
	{
        if (liveEdit)
        {
    		try { this.callbacks[name]?.(data); }
	    	catch (e) { showError(e); }
        }
        else
            this.callbacks[name]?.(data);
	}
}

const vidscreenInit = ()=>
{
    // init vidscreen
    activeVidscreen = feature = new VidScreen();
	canvas_main.width = activeVidscreen.screenWidth;
	canvas_main.height = activeVidscreen.screenHeight;
    hasStarted = hasError = 0;

	// input
	keysPressed = [];
    mouseDown   = [];
	onblur      = e=> keysPressed = [];
	onkeydown   = e=> keysPressed[e.keyCode] = 1;
	//onkeyup     = e=> keysPressed[e.keyCode] = 0;
    canvas_main.onmousedown   = e=> mouseDown[e.button] = 1;
    canvas_main.onmouseup     = e=> mouseDown[e.button] = 0;
    canvas_main.oncontextmenu = e=> false;

	// start event
	canvas_main.onclick =e=>
	{
		if (!hasStarted)
		{
			hasStarted = 1;
			activeVidscreen.callback('start');
		}
	}
}

vidscreenInit();

setInterval( ()=>
{
    if (!--newCodeTime && input_autoReload.checked)
        reload();

    if (hasError || !activeVidscreen)
		return;

    // call start event
	if (!hasStarted)
    {
        if (autoStart)
	        canvas_main.onclick();
        else
            return;
    }

	// process input 
	const keys = [];
	if (keysPressed[39] || keysPressed[68]) keys.right = 1;
	if (keysPressed[37] || keysPressed[65]) keys.left = 1;
	if (keysPressed[38] || keysPressed[87]) keys.up = 1;
	if (keysPressed[40] || keysPressed[83]) keys.down = 1;
	if (keysPressed[32] || keysPressed[65] || mouseDown[0]) keys.a = 1;
	if (keysPressed[17] || keysPressed[83] || mouseDown[2]) keys.b = 1;

	// clear keys pressed
	keysPressed = [];

	// keys event
	Object.keys(keys).length && activeVidscreen.callback('keys', {keys});

	// frame event
	activeVidscreen.callback('frame');

	// copy to canvas
	canvas_main.width |= 0;
	const width = activeVidscreen.screenWidth;
	const screen = activeVidscreen.screen;
	for (let k = width*width; k--;)
	{
		canvasContext.fillStyle = `rgb(${screen[k*3+0]||0},${screen[k*3+1]||0},${screen[k*3+2]||0})`
		canvasContext.fillRect(k%width, k/width|0, 1, 1);
	}
}, 33); // 30 fps update