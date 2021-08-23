///////////////////////////////////////////////////////////////////////////////
// A collection of tools for Cryptovoxels VidScreens by Frank Force [MIT]

const clamp       = (v, max=1, min=0)=> v < min ? min : v > max ? max : v;
const percent     = (v, a, b)=>         b-a ? clamp((v-a) / (b-a)) : 0;
const lerp        = (p, a, b)=>         a + clamp(p) * (b-a);
const clearScreen = (v=0)=>             feature.screen.fill(v);
const seededRand  = (seed, max=1)=>     Math.sin(seed)**2 * 1e9 % 1 * max;

let drawColor = [255, 255, 255, 1];
const setDrawColorRGBA = (r=0, g=0, b=0, a=1)=> drawColor = [r, g, b, a];
const setDrawColorHSLA = (h=0, s=1, l=.5, a=1)=>
{
    let r, g, b;
    if (s)
    {
        const f = (p, q, t)=>
        {
            t = ((t%1)+1)%1;
            return t < 1/6 ? p+(q-p)*6*t :
                t < 1/2 ? q :
                t < 2/3 ? p+(q-p)*(2/3-t)*6 : 
                p;
        }

        const q = l < .5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
        r = f(p, q, h + 1/3);
        g = f(p, q, h);
        b = f(p, q, h - 1/3);
    }
    else
        r = g = b = l;

    setDrawColorRGBA(r*255, g*255, b*255, a);
}

const drawPixel = (x, y)=>
{
    const a = drawColor[3];
    if (a <= 0 || x < 0 || x >= feature.screenWidth || y < 0 || y >= feature.screenHeight)
        return;

    const i = 3*((x|0) + (y|0)*feature.screenWidth);
    if (a == 1)
    {
        feature.screen[i+0] = drawColor[0]|0;
        feature.screen[i+1] = drawColor[1]|0;
        feature.screen[i+2] = drawColor[2]|0;
        return;
    }

    // draw pixel with alpha
    const r = feature.screen[i+0] || 0;
    const g = feature.screen[i+1] || 0;
    const b = feature.screen[i+2] || 0;
    feature.screen[i+0] = lerp(a, r, drawColor[0], 255)|0;
    feature.screen[i+1] = lerp(a, g, drawColor[1], 255)|0;
    feature.screen[i+2] = lerp(a, b, drawColor[2], 255)|0;
}

const drawRect = (x, y, w, h)=>
{
    for (let i = x; i < x + w; ++i)
    for (let j = y; j < y + h; ++j)
        drawPixel(i,j);
}

const drawRectOutline = (x, y, w, h)=>
{
    for (let i = x; i < x + w; ++i)
        drawPixel(i,y), drawPixel(i,y+h-1);
    for (let i = y; i < y + h; ++i)
        drawPixel(x,i), drawPixel(x+w-1,i);
}

const drawNumber = (n,x,y)=>
{
    n = (n|0)+'';
    for (const j of n)
    {
        for (let i=7;i--;)
            '{O<7w?'.charCodeAt(j)&2**i&&drawRect(i>4|i<3?x:x+5,y+(i%2?1:i?5:9)-1,i>2?2:7,i>2?5:1);
        x += 9;
    }
}