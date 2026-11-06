const state = {
  coins: Number(localStorage.getItem("coin-pusher-coins") || 30),
  score: 0,
  highScore: Number(localStorage.getItem("coin-pusher-high-score") || 0),
  lane: 0,
  sound: true,
};

const coinField = document.querySelector("#coin-field");
const dropCoins = document.querySelector("#drop-coins");
const coinCount = document.querySelector("#coin-count");
const score = document.querySelector("#score");
const highScore = document.querySelector("#high-score");
const dropButton = document.querySelector("#drop-button");
const pusher = document.querySelector(".pusher");
const message = document.querySelector("#message");
const statusText = document.querySelector("#status-text");
const prizeDisplay = document.querySelector("#prize-display");
let dropTimer;
let autoPushTimer;

function render() {
  coinCount.textContent = state.coins;
  score.textContent = state.score;
  highScore.textContent = state.highScore;
  dropButton.disabled = state.coins <= 0;
  statusText.textContent = state.coins > 0 ? "READY • TAP TO PLAY" : "OUT OF COINS • RESET GAME";
  prizeDisplay.textContent = Math.random() < 0.1 ? "×10" : "+2";
}

function showMessage(text) {
  message.textContent = text;
  message.classList.add("show");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => message.classList.remove("show"), 1300);
}

function addCoin(lane) {
  const coin = document.createElement("i");
  coin.className = "coin";
  coin.textContent = "¥";
  const laneX = [16, 47, 76][lane];
  coin.style.left = `${laneX + (Math.random() * 8 - 4)}%`;
  coin.style.top = `${18 + Math.random() * 62}%`;
  coin.style.setProperty("--depth", `${Math.random() * 0.6 + 0.7}`);
  coin.style.setProperty("--tilt", `${Math.random() * 16 - 8}deg`);
  coinField.appendChild(coin);
  if (coinField.children.length > 28) coinField.firstElementChild.remove();
}

function collectCoin() {
  const coin = document.createElement("span");
  coin.className = "drop-coin";
  coin.textContent = "¥";
  coin.style.left = `${10 + Math.random() * 80}%`;
  dropCoins.appendChild(coin);
  setTimeout(() => coin.remove(), 750);
}

function autoPush() {
  pusher.classList.add("auto-push");
  document.querySelector(".machine").classList.add("shake");
  clearTimeout(autoPushTimer);
  autoPushTimer = setTimeout(() => {
    pusher.classList.remove("auto-push");
    document.querySelector(".machine").classList.remove("shake");
  }, 520);
}

function drop() {
  if (state.coins <= 0) {
    showMessage("コインがありません！");
    return;
  }

  state.coins -= 1;
  addCoin(state.lane);
  dropButton.classList.add("firing");
  clearTimeout(dropTimer);
  dropTimer = setTimeout(() => dropButton.classList.remove("firing"), 420);
  pusher.classList.add("push");
  document.querySelector(".machine").classList.add("shake");
  setTimeout(() => {
    pusher.classList.remove("push");
    document.querySelector(".machine").classList.remove("shake");
  }, 450);

  const lucky = Math.random() < 0.18;
  if (lucky) {
    const reward = Math.random() < 0.12 ? 10 : 2;
    state.coins += reward;
    state.score += reward * 10;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem("coin-pusher-high-score", state.highScore);
    }
    for (let i = 0; i < reward; i += 1) setTimeout(collectCoin, i * 55);
    showMessage(reward === 10 ? "JACKPOT！+10コイン" : `コインゲット！+${reward}`);
  } else {
    state.score += 1;
  }
  localStorage.setItem("coin-pusher-coins", state.coins);
  render();
}

document.querySelectorAll(".lane-dot").forEach((button) => {
  button.addEventListener("click", () => {
    state.lane = Number(button.dataset.lane);
    document.querySelectorAll(".lane-dot").forEach((dot) => dot.classList.toggle("active", dot === button));
  });
});

dropButton.addEventListener("click", drop);
setInterval(autoPush, 2400);
setTimeout(autoPush, 900);
document.querySelector("#reset-button").addEventListener("click", () => {
  state.coins = 30;
  state.score = 0;
  coinField.innerHTML = "";
  dropCoins.innerHTML = "";
  localStorage.setItem("coin-pusher-coins", state.coins);
  showMessage("ゲームをリセットしました");
  render();
});
document.querySelector("#sound-toggle").addEventListener("click", (event) => {
  state.sound = !state.sound;
  event.currentTarget.textContent = state.sound ? "🔊" : "🔇";
});

render();
