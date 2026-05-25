//  MUSIC PLAYER — app.js

// ─── 1. PLAYLIST DATA ───
const songs = [
  {
    title: "Chill Vibes",
    artist: "Lo-Fi Beats",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Electric Dreams",
    artist: "Synthwave Studio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Morning Coffee",
    artist: "Acoustic Sessions",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "Night Drive",
    artist: "Retro Collective",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    title: "Sunset Boulevard",
    artist: "Jazz Ensemble",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  }
];

// ─── 2. ELEMENT REFERENCES ───
const audio          = document.getElementById('audio');
const vinyl          = document.getElementById('vinyl');
const songTitle      = document.getElementById('song-title');
const songArtist     = document.getElementById('song-artist');
const playBtn        = document.getElementById('play-btn');
const playIcon       = document.getElementById('play-icon');
const pauseIcon      = document.getElementById('pause-icon');
const prevBtn        = document.getElementById('prev-btn');
const nextBtn        = document.getElementById('next-btn');
const shuffleBtn     = document.getElementById('shuffle-btn');
const repeatBtn      = document.getElementById('repeat-btn');
const progressBar    = document.getElementById('progress-bar');
const currentTimeEl  = document.getElementById('current-time');
const durationEl     = document.getElementById('duration');
const volumeBar      = document.getElementById('volume-bar');
const volumeLabel    = document.getElementById('volume-label');
const autoplayToggle = document.getElementById('autoplay-toggle');
const playlistEl     = document.getElementById('playlist');

// ── 3. STATE ──
let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let isRepeat     = false;

// Store loaded durations so playlist can show 
const durations = new Array(songs.length).fill(null);

// ─── 4. LOAD SONG ───
function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  songTitle.textContent  = song.title;
  songArtist.textContent = song.artist;
  progressBar.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent    = durations[index] ? formatTime(durations[index]) : "0:00";
  highlightPlaylistItem(index);
}

// ─── 5. PLAY / PAUSE ───
function playSong() {
  isPlaying = true;
  audio.play();
  playIcon.style.display  = 'none';
  pauseIcon.style.display = 'block';
  vinyl.classList.add('playing');
}

function pauseSong() {
  isPlaying = false;
  audio.pause();
  playIcon.style.display  = 'block';
  pauseIcon.style.display = 'none';
  vinyl.classList.remove('playing');
}

playBtn.addEventListener('click', () => {
  isPlaying ? pauseSong() : playSong();
});

// ─── 6. NEXT / PREV ────
function nextSong() {
  if (isShuffle) {
    // Pick a random song 
    let r;
    do { r = Math.floor(Math.random() * songs.length); } while (r === currentIndex && songs.length > 1);
    currentIndex = r;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  playSong();
}

function prevSong() {
  // If more than 3 seconds in, restart current song instead
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

// ─── 7. SHUFFLE & REPEAT ────
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
});

// ─── 8. PROGRESS BAR ───
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  progressBar.max   = Math.floor(audio.duration);
  progressBar.value = Math.floor(audio.currentTime);
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent    = formatTime(audio.duration);
});

// Cache duration once metadata loads so playlist can show it

audio.addEventListener('loadedmetadata', () => {
  durations[currentIndex] = audio.duration;
  durationEl.textContent  = formatTime(audio.duration);

  // Update the playlist row duration label
  const items = playlistEl.querySelectorAll('li');
  if (items[currentIndex]) {
    items[currentIndex].querySelector('.track-duration').textContent = formatTime(audio.duration);
  }
});

progressBar.addEventListener('input', () => {
  audio.currentTime = progressBar.value;
});

// ─── 9. VOLUME ───
function setVolume(val) {
  audio.volume = val / 100;
  volumeLabel.textContent = val + '%';

  // Update the filled-track gradient via CSS variable
  volumeBar.style.setProperty('--vol', val + '%');
}

volumeBar.addEventListener('input', () => setVolume(volumeBar.value));
setVolume(80); // initial point

// ─── 10. SONG ENDED ───
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else if (autoplayToggle.checked) {
    nextSong();
  } else {
    pauseSong();
  }
});

// ─── 11. PLAYLIST ───
function buildPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="track-num">${index + 1}</span>
      <div class="track-info">
        <span class="track-title">${song.title}</span>
        <span class="track-artist">${song.artist}</span>
      </div>
      <span class="track-duration">--:--</span>
    `;
    li.addEventListener('click', () => {
      currentIndex = index;
      loadSong(currentIndex);
      playSong();
    });
    playlistEl.appendChild(li);
  });
}

function highlightPlaylistItem(index) {
  playlistEl.querySelectorAll('li').forEach((li, i) => {
    li.classList.toggle('active', i === index);
  });
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

buildPlaylist();
loadSong(0);
