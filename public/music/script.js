// 获取URL参数
const urlParams = new URLSearchParams(window.location.search);
const audioUrl = decodeURIComponent(urlParams.get('url') || '');

// 设置播放器
const player = document.getElementById('player');
const nowPlaying = document.getElementById('nowPlaying');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const volumeControl = document.getElementById('volumeControl');

if (audioUrl) {
    player.src = audioUrl;
    nowPlaying.textContent = decodeURIComponent(audioUrl.split('/').pop()) || '当前曲目';

    player.addEventListener('error', () => {
        nowPlaying.textContent = '播放失败: ' + (player.error?.message || '未知错误');
    });
} else {
    nowPlaying.textContent = '未指定音频文件';
}

// 播放/暂停
playPauseBtn.addEventListener('click', () => {
    if (player.paused) {
        player.play();
        playPauseBtn.textContent = '❚❚';  // 播放时切换为暂停图标
    } else {
        player.pause();
        playPauseBtn.textContent = '▶';   // 暂停时切换为播放图标
    }
});

// 后退 10秒
rewindBtn.addEventListener('click', () => {
    player.currentTime = Math.max(0, player.currentTime - 10);
});

// 前进 10秒
forwardBtn.addEventListener('click', () => {
    player.currentTime = Math.min(player.duration || 0, player.currentTime + 10);
});

// 进度条
player.addEventListener('timeupdate', () => {
    const percent = (player.currentTime / player.duration) * 100;
    progress.style.width = percent + '%';
});

progressBar.addEventListener('click', (e) => {
    const percent = (e.offsetX / progressBar.offsetWidth);
    player.currentTime = percent * player.duration;
});

// 音量调节
volumeControl.addEventListener('input', () => {
    player.volume = volumeControl.value;
});
