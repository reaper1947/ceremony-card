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

function startConfetti(duration=3000) {
  const end = Date.now() + duration;
  (function frame() {
    confetti({particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }});
    confetti({particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }});
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function startStageFlash(duration=3000) {
  let t=0;
  const colors = ['#FFD700','#00FFEA','#FF69B4','#7FFF00','#FFFFFF'];
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

  // Instagram (fallback opens IG)
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

btn.addEventListener('click', ()=>{
  btn.disabled = true; // prevent re-click
  btn.style.transform = "scale(0.98)";
  btn.textContent = "🎉 Enjoy the moment!";

  clap.currentTime = 0;
  clap.volume = 1.0;
  clap.play().catch(()=>{});

  startConfetti(3800);
  startStageFlash(3800);

  setTimeout(()=>{ fadeInMusic(music, 3.5, 0.4); }, 900);
  setTimeout(showShareButtons, 5000);
});
