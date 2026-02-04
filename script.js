const root = document.documentElement;
const body = document.body;

const themeSelect = document.getElementById('themeSelect');

const soundToggle = document.getElementById('soundToggle');
const fireAudio = document.getElementById('fireAudio');

const timerMinutesEl = document.getElementById('timerMinutes');
const timerSecondsEl = document.getElementById('timerSeconds');
const timerStartBtn = document.getElementById('timerStart');
const timerPauseBtn = document.getElementById('timerPause');
const timerResetBtn = document.getElementById('timerReset');
const modeButtons = document.querySelectorAll('.timerModes button[data-mode]');
const timerModeLabel = document.getElementById('timerModeLabel');

const statStreakEl = document.getElementById('statStreak');
const statTodayEl = document.getElementById('statToday');
const statTotalEl = document.getElementById('statTotal');

const nowPlayingEmojiEl = document.getElementById('nowPlayingEmoji');
const nowPlayingLabelEl = document.getElementById('nowPlayingLabel');

let timerDuration = 25 * 60;
let timerRemaining = timerDuration;
let timerInterval = null;
let timerRunning = false;
let currentMode = 'pomodoro';

let focusStreak = 0;
let todayMinutes = 0;
let totalMinutes = 0;

function updateStats() {
  if (statStreakEl) statStreakEl.textContent = String(focusStreak);
  if (statTodayEl) statTodayEl.textContent = String(todayMinutes);
  if (statTotalEl) statTotalEl.textContent = (totalMinutes / 60).toFixed(1);
}

function applyTheme(theme) {
  body.dataset.theme = theme;
}

if (themeSelect) {
  applyTheme(themeSelect.value);
  themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value);
  });
}

if (soundToggle && fireAudio) {
  fireAudio.volume = 0.6;

  soundToggle.addEventListener('click', async () => {
    const isPlaying = soundToggle.getAttribute('aria-pressed') === 'true';
    try {
      if (!isPlaying) {
        await fireAudio.play();
        soundToggle.setAttribute('aria-pressed', 'true');
        if (nowPlayingEmojiEl && nowPlayingLabelEl) {
          nowPlayingEmojiEl.textContent = '🔥';
          nowPlayingLabelEl.textContent = 'Fireplace';
        }
      } else {
        fireAudio.pause();
        soundToggle.setAttribute('aria-pressed', 'false');
        if (nowPlayingEmojiEl && nowPlayingLabelEl) {
          nowPlayingEmojiEl.textContent = '🔥';
          nowPlayingLabelEl.textContent = 'Fireplace';
        }
      }
    } catch (err) {
      console.warn('Unable to play audio:', err);
    }
  });
}

function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerMinutesEl.textContent = String(mins).padStart(2, '0');
  timerSecondsEl.textContent = String(secs).padStart(2, '0');
}

function setMode(mode, minutes) {
  currentMode = mode;
  timerDuration = minutes * 60;
  timerRemaining = timerDuration;
  updateTimerDisplay(timerRemaining);

  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  if (!timerRunning) {
    timerPauseBtn.disabled = true;
    timerResetBtn.disabled = true;
  }
  if (timerModeLabel) {
    if (mode === 'pomodoro') timerModeLabel.textContent = 'Pomodoro';
    else if (mode === 'deep') timerModeLabel.textContent = 'Deep work';
    else if (mode === 'break') timerModeLabel.textContent = 'Break';
    else timerModeLabel.textContent = '';
  }
}

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode || 'pomodoro';
    const minutes = Number(btn.dataset.duration || '25');
    if (!Number.isNaN(minutes)) {
      stopTimer();
      setMode(mode, minutes);
    }
  });
});

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStartBtn.disabled = true;
  timerPauseBtn.disabled = false;
  timerResetBtn.disabled = false;

  body.classList.add('focus-mode');

  const startTime = Date.now();
  const target = startTime + timerRemaining * 1000;

  timerInterval = setInterval(() => {
    const now = Date.now();
    timerRemaining = Math.max(0, Math.round((target - now) / 1000));
    updateTimerDisplay(timerRemaining);

    if (timerRemaining <= 0) {
      stopTimer(false);
      const sessionMinutes = Math.round(timerDuration / 60);
      if (currentMode !== 'break' && sessionMinutes > 0) {
        focusStreak += 1;
        todayMinutes += sessionMinutes;
        totalMinutes += sessionMinutes;
        updateStats();
      }

      body.classList.add('timer-finished');
      setTimeout(() => {
        body.classList.remove('timer-finished');
      }, 800);
    }
  }, 250);
}

function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  timerStartBtn.disabled = false;
  timerPauseBtn.disabled = true;
  clearInterval(timerInterval);
  
  body.classList.remove('focus-mode');
}

function stopTimer(reset = true) {
  timerRunning = false;
  clearInterval(timerInterval);
  timerStartBtn.disabled = false;
  timerPauseBtn.disabled = true;
  
  body.classList.remove('focus-mode');
  
  if (reset) {
    timerRemaining = timerDuration;
    updateTimerDisplay(timerRemaining);
    timerResetBtn.disabled = true;
  }
}

function resetTimer() {
  stopTimer(true);
}

if (timerStartBtn && timerPauseBtn && timerResetBtn) {
  timerStartBtn.addEventListener('click', () => {
    startTimer();
  });
  timerPauseBtn.addEventListener('click', () => {
    pauseTimer();
  });
  timerResetBtn.addEventListener('click', () => {
    resetTimer();
  });
}

updateTimerDisplay(timerRemaining);
setMode('pomodoro', 25);
updateStats();