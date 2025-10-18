// Parse URL ?name=friend1
const params = new URLSearchParams(window.location.search);
const nameParam = (params.get("name") || "friend1").toLowerCase();

// Theme presets (graduation-friendly)
const themes = [
  { name: "royal", bg: "linear-gradient(135deg,#0f0f0f,#1f1b24)", txt: "#fff", accent:"#ffd700", font: "'Georgia', serif" },
  { name: "pastel", bg: "linear-gradient(135deg,#f8d7ff,#d7f1ff)", txt: "#1a1a1a", accent:"#ff69b4", font: "'Segoe UI', system-ui" },
  { name: "ocean", bg: "linear-gradient(135deg,#00111f,#00334e)", txt:"#e8f9ff", accent:"#00ffea", font:"'Trebuchet MS', sans-serif" },
  { name: "forest", bg: "linear-gradient(135deg,#0c2612,#1a4d2e)", txt:"#eaffea", accent:"#7fff00", font:"'Verdana', sans-serif" },
  { name: "classic", bg: "linear-gradient(135deg,#111,#333)", txt:"#fff", accent:"#c0c0c0", font:"'Times New Roman', serif" }
];

function applyTheme(theme) {
  document.body.style.background = theme.bg;
  document.body.style.color = theme.txt;
  document.body.style.fontFamily = theme.font;
  const btn = document.getElementById('surpriseBtn');
  if (btn) {
    btn.style.background = theme.accent;
    btn.style.color = "#111";
    btn.style.boxShadow = `0 6px 18px ${theme.accent}55`;
  }
}

function randomTheme() {
  return themes[Math.floor(Math.random()*themes.length)];
}

function startConfetti(duration=5000) {
  const end = Date.now() + duration;
  (function frame() {
    confetti({particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }});
    confetti({particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }});
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function startStageFlash(duration=3000) {
  let t=0;
  const colors = ['#ff0000ff','#ff0000ff','#ff0000ff','#ff0000ff','#ff0000ff'];
  const id = setInterval(()=>{
    document.body.style.background = `linear-gradient(135deg, ${colors[t%colors.length]}, #111)`;
    t++;
  }, 140);
  setTimeout(()=>{
    clearInterval(id);
    applyTheme(currentTheme);
  }, duration);
}

let currentTheme = randomTheme();
applyTheme(currentTheme);

// Load friend data
fetch('friends.json').then(r=>r.json()).then(all=>{
  const friend = all.find(f => (f.name || "").toLowerCase() === nameParam) || all[0];
  document.getElementById('friend-name').textContent = friend.display_name ? `${friend.display_name}` : friend.name;
  document.getElementById('message').textContent = friend.message || "ขอแสดงความยินดีกับความสำเร็จครั้งนี้ 🎓";

  const pc = document.getElementById('photo-container');
  pc.innerHTML = "";
  friend.photos.forEach(src=>{
    const img = document.createElement('img');
    img.src = src;
    img.loading = "lazy";
    pc.appendChild(img);
  });

  if (friend.theme && friend.theme !== "random") {
    const t = themes.find(x=>x.name===friend.theme);
    if (t) {
      currentTheme = t;
      applyTheme(t);
    }
  }
});

const clap = document.getElementById('clapSound');
const music = document.getElementById('celebrationMusic');
const btn = document.getElementById('surpriseBtn');
let celebrationStarted = false;

function fadeInMusic(audio, seconds=3.5, target=0.45) {
  audio.volume = 0.0;
  audio.play().catch(()=>{});
  const steps = 35;
  let i = 0;
  const step = target/steps;
  const iv = setInterval(()=>{
    i++;
    audio.volume = Math.min(target, i*step);
    if (i>=steps) clearInterval(iv);
  }, (seconds*1000)/steps);
}

function showShareButtons() {
  const shareDiv = document.createElement('div');
  shareDiv.className = 'share-container';
  shareDiv.innerHTML = `
    <p class="share-text">แชร์ความยินดีนี้ให้เพื่อนๆ 🎉</p>
    <button class="share-btn line">LINE</button>
    <button class="share-btn ig">Instagram</button>
    <button class="share-btn copy">คัดลอกลิงก์</button>
  `;
  document.getElementById('card').appendChild(shareDiv);

  // LINE share
  shareDiv.querySelector('.line').addEventListener('click', () => {
    const msg = encodeURIComponent(`🎓 ฉันได้รับการ์ดวันรับปริญญาสุดพิเศษ! ดูได้ที่ ${window.location.href}`);
    window.open(`https://line.me/R/msg/text/?${msg}`, '_blank');
  });

  // Instagram (fallback)
  shareDiv.querySelector('.ig').addEventListener('click', () => {
    window.open(`https://www.instagram.com/`, '_blank');
  });

  // Copy link
  shareDiv.querySelector('.copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('คัดลอกลิงก์แล้ว ✅');
    } catch (e) {
      const temp = document.createElement('input');
      temp.value = window.location.href;
      document.body.appendChild(temp);
      temp.select(); document.execCommand('copy');
      temp.remove();
      alert('คัดลอกลิงก์แล้ว ✅');
    }
  });
}

// 🎓 Falling graduation caps animation
const canvas = document.createElement("canvas");
canvas.id = "snowCanvas";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

let capW, capH;
function resizeCaps() {
  capW = canvas.width = window.innerWidth;
  capH = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCaps);
resizeCaps();

const caps = [];
const capEmoji = "🎓";
for (let i = 0; i < 40; i++) {
  caps.push({
    x: Math.random() * capW,
    y: Math.random() * capH,
    size: 24 + Math.random() * 20,
    speed: 0.5 + Math.random() * 1.5,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
  });
}

function drawCaps() {
  ctx.clearRect(0, 0, capW, capH);
  ctx.font = "28px serif";
  for (const c of caps) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.font = `${c.size}px serif`;
    ctx.fillText(capEmoji, 0, 0);
    ctx.restore();

    c.y += c.speed;
    c.rot += c.rotSpeed;
    if (c.y > capH + 50) {
      c.y = -50;
      c.x = Math.random() * capW;
    }
  }
  requestAnimationFrame(drawCaps);
}
drawCaps();

canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.zIndex = -1;
canvas.style.pointerEvents = "none";
canvas.style.opacity = 0.9;

// // ===== Realistic Spotlight =====
// const spotlightCanvas = document.getElementById("spotlightCanvas");
// const spCtx = spotlightCanvas.getContext("2d");
// let spotW = window.innerWidth, spotH = window.innerHeight;
// spotlightCanvas.width = spotW; spotlightCanvas.height = spotH;

// window.addEventListener("resize", () => {
//   spotW = window.innerWidth; spotH = window.innerHeight;
//   spotlightCanvas.width = spotW; spotlightCanvas.height = spotH;
// });

// let spotlights = [];
// function createSpotlights() {
//   spotlights = [];
//   for (let i = 0; i < 3; i++) {
//     spotlights.push({
//       x: (i + 0.3) * (spotW / 3),
//       width: 150 + Math.random() * 80,
//       height: spotH / 2, // ครึ่งจอ
//       angle: Math.random() * Math.PI / 6 - Math.PI / 12,
//       sparkle: Math.random(),
//       color: `hsla(${Math.random()*40 + 40},100%,75%,0.3)`
//     });
//   }
// }
// createSpotlights();

// function drawSpotlights() {
//   spCtx.clearRect(0, 0, spotW, spotH);
//   for (let s of spotlights) {
//     spCtx.save();
//     spCtx.translate(s.x, spotH);
//     spCtx.rotate(s.angle + Math.sin(Date.now()/2000 + s.x)*0.1);
//     const grad = spCtx.createLinearGradient(0,0,0,-s.height);
//     grad.addColorStop(0, s.color);
//     grad.addColorStop(0.5, "rgba(255,255,255,0.1)");
//     grad.addColorStop(1, "transparent");
//     spCtx.fillStyle = grad;
//     spCtx.beginPath();
//     spCtx.moveTo(-s.width/2, 0);
//     spCtx.lineTo(s.width/2, 0);
//     spCtx.lineTo(0, -s.height);
//     spCtx.closePath();
//     spCtx.fill();
//     spCtx.restore();

//     // ✨ ระยิบระยับ
//     const sparkleX = s.x + Math.sin(Date.now()/100+s.x)*40;
//     const sparkleY = spotH - s.height/2 + Math.cos(Date.now()/500+s.x)*30;
//     spCtx.beginPath();
//     spCtx.fillStyle = `hsla(${Math.random()*360},100%,80%,0.6)`;
//     spCtx.arc(sparkleX, sparkleY, Math.random()*3+1, 0, Math.PI*2);
//     spCtx.fill();
//   }
//   requestAnimationFrame(drawSpotlights);
// }
// ===== Fireworks Setup =====
let spotW = window.innerWidth;
let spotH = window.innerHeight;

// ===== Realistic Fireworks =====
const fireworksCanvas = document.createElement("canvas");
fireworksCanvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:4;";
document.body.appendChild(fireworksCanvas);
const fctx = fireworksCanvas.getContext("2d");
fireworksCanvas.width = spotW; fireworksCanvas.height = spotH;

window.addEventListener("resize", ()=> {
  spotW = window.innerWidth;
  spotH = window.innerHeight;
  fireworksCanvas.width = spotW;
  fireworksCanvas.height = spotH;
});


function firework() {
  const boomSound = new Audio("assets/sounds/firework.mp3");
  boomSound.volume = 0.3;
  boomSound.play().catch(()=>{});

  const x = Math.random() * spotW;
  const baseY = spotH - 80;
  const color = `hsl(${Math.random()*360},100%,65%)`;
  const particles = [];

  for (let i=0;i<70;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*5+2;
    particles.push({
      x,
      y: baseY,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - (Math.random()*6+3),
      alpha: 1,
      color,
      radius: Math.random()*2+1,
    });
  }

  function animate(){
    fctx.clearRect(0,0,spotW,spotH);
    for (let p of particles){
      p.x+=p.vx;
      p.y+=p.vy;
      p.vy+=0.05;   // แรงโน้มถ่วง
      p.alpha -= 0.015; // fade ออก
      fctx.beginPath();
      fctx.fillStyle=`${p.color.replace('hsl','hsla').replace(')',`,${p.alpha})`)}`;
      fctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
      fctx.fill();
    }
    if (particles.some(p=>p.alpha>0)) requestAnimationFrame(animate);
  }
  animate();
}
// ===== Button behavior =====
let fireworkInterval = null;

btn.addEventListener('click', () => {
  if (!celebrationStarted) {
    celebrationStarted = true;

    // ครั้งแรก: เล่นเสียง ปล่อย confetti ฉลอง
    startConfetti(4000);
    startStageFlash(4000);
    clap.currentTime = 0;
    clap.play();
    fadeInMusic(music, 3.5, 0.4);

    btn.textContent = "🎉 Enjoy the Moment!";
    showShareButtons();
  } else {
    // ครั้งต่อไป: ยิงพลุ + confetti พร้อมกัน
    startConfetti(3000);
    firework();

    // ยิงต่อเนื่อง (3 วิ)
    if (!fireworkInterval) {
      fireworkInterval = setInterval(() => {
        firework();
        startConfetti(1500);
      }, 1200);
      setTimeout(() => {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
      }, 4000);
    }
  }
});

