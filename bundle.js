var n = 6,
    width = 2000,
    height = 1000,
    running = false,
    G = 1,
    t, loc, v, mass, rad, name, alpha = 0,
    beta = 0,
    trace, traceMax = 100,
    now = 0;
var ctx = id("canvas").getContext("2d");

var drag = false,
    xstart, ystart, astart, bstart;
id("canvas").addEventListener("mousedown", event => {
    drag = true;
    xstart = event.clientX;
    ystart = event.clientY;
    astart = alpha;
    bstart = beta;
});
id("canvas").addEventListener("mousemove", event => { if (drag) getMousePos(event); });
id("canvas").addEventListener("mouseup", () => { drag = false; });

function getMousePos(event) {
    alpha = astart + (event.clientX - xstart) / 500.0;
    beta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, bstart + (event.clientY - ystart) / 500.0));
    console.log("x:" + event.clientX + ",y:" + event.clientY);
}

function clear() {
    ctx.clearRect(0, 0, width, height);
}

function line(p, q, rot) {
    var pr = p.rotate(rot),
        qr = q.rotate(rot);
    ctx.moveTo(pr.x + width / 2, pr.y + height / 2);
    ctx.lineTo(qr.x + width / 2, qr.y + height / 2);
    ctx.stroke();
}

function circle(p, r, rot) {
    var pr = p.rotate(rot);
    ctx.beginPath();
    ctx.arc(pr.x + width / 2, pr.y + height / 2, r, 0, Math.PI * 2);
    ctx.stroke();
}

function text(x, y, t, size = 40) {
    ctx.font = size + "px 'Consolas'";
    ctx.fillText(t, x + width / 2, y + height / 2);
}

class Vector {
    constructor(x, y, z) {
        this.x = (typeof x == "undefined" ? 0 : x);
        this.y = (typeof y == "undefined" ? 0 : y);
        this.z = (typeof z == "undefined" ? 0 : z);
    }
    add(q) {
        return typeof q == "number" ? vec(this.x + q, this.y + q, this.z + q) :
            vec(this.x + q.x, this.y + q.y, this.z + q.z);
    }
    min(q) { return this.add(q.dot(-1)); }
    dot(q) {
        return typeof q == "number" ? vec(this.x * q, this.y * q, this.z * q) :
            vec(this.x * q.x, this.y * q.y, this.z * q.z);
    }
    dis2(q) { return (this.x - q.x) ** 2 + (this.y - q.y) ** 2 + (this.z - q.z) ** 2; }
    rotate(r) { return vec(sum(this.dot(r.x)), -sum(this.dot(r.y)), sum(this.dot(r.z))); }
}

function sum(p) { return p.x + p.y + p.z; }
class RotVec {
    constructor(p, q) {
        this.a = (typeof a == "undefined" ? 0 : a);
        this.b = (typeof b == "undefined" ? 0 : b);
        this.x = vec(Math.sin(p), -Math.cos(p), 0);
        this.y = vec(-Math.sin(q) * Math.cos(p), -Math.sin(q) * Math.sin(p), Math.cos(q));
        this.z = vec(Math.cos(q) * Math.cos(p), Math.cos(q) * Math.sin(p), Math.sin(q));
    }
}

function vec(x, y, z) { return new Vector(x, y, z); }

function id(x) { return document.getElementById(x); }

function get(x, i) { return typeof i == "undefined" ? id(x).value : ~~id(i + x).value; }

function init() {
    loc = [], v = [], mass = [], rad = [], trace = [];
    for (var i = 1; i <= n; i++) {
        loc.push(vec(get("lx", i), get("ly", i), get("lz", i)));
        v.push(vec(get("vx", i), get("vy", i), get("vz", i)));
        mass.push(get("mass", i));
        rad.push(get("radius", i));
    }
    for (var j = 0; j < traceMax; j++) {
        trace[j] = [loc[0], loc[1], loc[2], loc[3], loc[4], loc[5]];
    }
}

function start() {
    if (id('start').innerText == "RUN") {
        id('start').innerText = "STOP";
        running = true;
    } else {
        id('start').innerText = "RUN";
        running = false;
        init();
    }
}

function run() {
    if (running) update();
    render();
    // alpha = (alpha + 2 * Math.PI) % (2 * Math.PI);
    // beta = (beta + Math.PI) % Math.PI;
    t = requestAnimationFrame(run);
}

function update() {
    var p = -1;
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            if (i == j) continue;
            var dis = loc[i].dis2(loc[j]) ** (-0.5 + p / 2),
                ij = loc[i].min(loc[j]).dot(G * dis);
            v[i] = v[i].min(ij.dot(mass[j]));
            v[j] = v[j].min(ij.dot(-mass[i]));
            // console.log(dis, ij);
        }
        loc[i] = loc[i].add(v[i]);
    }
    // console.log(loc, v, mass, rad, t);
}

function drawRecBox(p, q, rot, az = 0) {
    //line(vec(p.x + az * (p.x < 0 ? -1 : 1), p.y, p.z), vec(q.x, p.y, p.z), rot);
    //line(vec(p.x, p.y - az * (p.y < 0 ? -1 : 1), p.z), vec(p.x, q.y, p.z), rot);
    line(vec(p.x, p.y, p.z - az * (p.z < 0 ? -1 : 1)), vec(p.x, p.y, q.z), rot);
    //line(vec(p.x, q.y, p.z), vec(p.x, q.y, q.z), rot);
    //line(vec(p.x, q.y, p.z), vec(q.x, q.y, p.z), rot);
    line(vec(p.x, p.y, q.z), vec(p.x, q.y, q.z), rot);
    line(vec(p.x, p.y, q.z), vec(q.x, p.y, q.z), rot);
    //line(vec(q.x, p.y, p.z), vec(q.x, q.y, p.z), rot);
    //line(vec(q.x, p.y, p.z), vec(q.x, p.y, q.z), rot);
    //line(vec(p.x, q.y, q.z), vec(q.x, q.y, q.z), rot);
    //line(vec(q.x, p.y, q.z), vec(q.x, q.y, q.z), rot);
    //line(vec(q.x, q.y, p.z), vec(q.x, q.y, q.z), rot);
}

var camera = vec(0, 0, 0);

function render() {
    clear();
    var vis = new RotVec(alpha, beta);
    text(vec().rotate(vis).x - 100, -height / 2 + 60, "3D Engine Test");
    if (t % 2 == 0 && running)
        trace[(++now) % traceMax] = [...loc];
    for (var i = 0; i < n; i++) {
        if (get("radius", i + 1) < 0) {
            clear();
            text(vec().rotate(vis).x - 50, vec().rotate(vis).y, "Radius of a ball can't be negative");
            text(vec().rotate(vis).x - 600, vec().rotate(vis).y - 50, "Are you kidding me?");
            text(vec().rotate(vis).x - 400, vec().rotate(vis).y + 300, "===== Press F5 to restart =====");
        }
        circle(loc[i].min(camera), get("radius", i + 1), vis);
        text(loc[i].min(camera).rotate(vis).x, loc[i].min(camera).rotate(vis).y - rad[i] - 10, id((i + 1) + "name").value);
        // drawRecBox(loc[i], vec(), vis, rad[i]);
        for (var j = 1; j < traceMax; j++) {
            line(trace[(j + now) % traceMax][i].min(camera), trace[(j + now + 1) % traceMax][i].min(camera), vis);
        }
    }

    if (true || !running) {
        var x0 = vec(1e3, 0, 0).rotate(vis),
            y0 = vec(0, 1e3, 0).rotate(vis),
            z0 = vec(0, 0, 400).rotate(vis);
        line(vec(1e3, 0, 0), vec(-1e3, 0, 0), vis);
        line(vec(0, 1e3, 0), vec(0, -1e3, 0), vis);
        line(vec(0, 0, 1e3), vec(0, 0, -1e3), vis);
        text(x0.x, x0.y, "x");
        text(y0.x, y0.y, "y");
        text(z0.x, z0.y, "z");
    }
}

init();
run();