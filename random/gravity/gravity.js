let canvas = document.getElementById('canvas');
let c = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let b = [
  {
    mass: 1.6e35,
    radius: 30,
    x: window.innerWidth / 2 + 200,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0.5,
    color: '#ff0000',
    history: []
  },
  {
    mass: 1.6e35,
    radius: 30,
    x: window.innerWidth / 2 - 100,
    y: window.innerHeight / 2 + 173.205,
    vx: -0.433,
    vy: -0.25,
    color: '#00ff00',
    history: []
  },
  {
    mass: 1.6e35,
    radius: 30,
    x: window.innerWidth / 2 - 100,
    y: window.innerHeight / 2 - 173.205,
    vx: 0.433,
    vy: -0.25,
    color: '#0000ff',
    history: []
  }
];

// 400 * sqrt(2) pixels = 1.5*10^8 km
// so 1 pixel = 265,165 km

const G = 6.6743e-11;
const keys = new Set();
let dx = 0, dy = 0;

let hz = 6000000;

document.addEventListener("keydown", (e) => {
  keys.add(e.key);
});

document.addEventListener("keyup", (e) => {
  keys.delete(e.key);
});

document.addEventListener("click", (e) => {
  b.push(
    {mass: 5e30, radius: 30, x: e.clientX, y: e.clientY, vx: 0, vy: 0, color: '#ff0000', history: []}
  );
});

// for (let i = 0; i < window.innerWidth; i += 100) {
//   for (let j = 0; j < window.innerHeight; j += 100) {
//     b.push(
//       {mass: 5e30, radius: 30, x: i + 50, y: j + 50, vx: 0, vy: 0, color: '#ff0000'}
//     );
//   }
// }

function animate() {
  dx = 0; dy = 0;
  if (keys.has("ArrowRight")) dx -= 2;
  if (keys.has("ArrowLeft")) dx += 2;
  if (keys.has("ArrowUp")) dy += 2;
  if (keys.has("ArrowDown")) dy -= 2;

  for (let i = 0; i < b.length; ++i) {
    b[i].x += dx;
    b[i].y += dy;
  }

  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = '#000';
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < b.length; ++i) {
    for (let j = i + 1; j < b.length; ++j) {
      let r = 265165 * Math.sqrt((b[i].x - b[j].x) * (b[i].x - b[j].x) + (b[i].y - b[j].y) * (b[i].y - b[j].y));
      let F = G * (b[i].mass / r) * (b[j].mass / r);
      let F_vec = [265165 * (b[i].x - b[j].x), 265165 * (b[i].y - b[j].y)];
      F_vec[0] /= r, F_vec[1] /= r;
      F_vec[0] *= F, F_vec[1] *= F;
      let a_ix = F_vec[0] / b[i].mass, a_iy = F_vec[1] / b[i].mass, a_jx = F_vec[0] / b[j].mass, a_jy = F_vec[1] / b[j].mass;
      b[i].vx -= 1 / hz * a_ix / 265165, b[j].vx += 1 / hz * a_jx / 265165;
      b[i].vy -= 1 / hz * a_iy / 265165, b[j].vy += 1 / hz * a_jy / 265165;
    }
  }
  for (let i = 0; i < b.length; ++i) {
    // update velocity + position
    b[i].x += b[i].vx;
    b[i].y += b[i].vy;

    // draw body
    c.beginPath();
    c.fillStyle = b[i].color;
    c.arc(b[i].x, b[i].y, b[i].radius, 0, 2 * Math.PI);
    c.fill();
  }

  requestAnimationFrame(animate);
}

animate();

