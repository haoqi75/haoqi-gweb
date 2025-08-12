const urlParams = new URLSearchParams(window.location.search);
const audioUrl = decodeURIComponent(urlParams.get('url') || '');

const player = document.getElementById('player');
const nowPlaying = document.getElementById('nowPlaying');
const playPause = document.getElementById('playPause');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const seekBar = document.getElementById('seekBar');
const speedControl = document.getElementById('speedControl');
const volumeControl = document.getElementById('volumeControl');

if (audioUrl) {
    player.src = audioUrl;
    nowPlaying.textContent = decodeURIComponent(audioUrl.split('/').pop() || '当前曲目');
} else {
    nowPlaying.textContent = '未指定音频文件';
}

playPause.addEventListener('click', () => {
    if (player.paused) {
        player.play();
        playPause.textContent = '⏸';
    } else {
        player.pause();
        playPause.textContent = '▶';
    }
});

player.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(player.duration);
    seekBar.max = player.duration;
});

player.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(player.currentTime);
    seekBar.value = player.currentTime;
});

seekBar.addEventListener('input', () => {
    player.currentTime = seekBar.value;
});

speedControl.addEventListener('change', () => {
    player.playbackRate = parseFloat(speedControl.value);
});

volumeControl.addEventListener('input', () => {
    player.volume = volumeControl.value;
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}
