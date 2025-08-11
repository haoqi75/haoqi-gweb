// 获取URL参数
const urlParams = new URLSearchParams(window.location.search);
const audioUrl = decodeURIComponent(urlParams.get('url') || '');

// 设置播放器
const player = document.getElementById('player');
const nowPlaying = document.getElementById('nowPlaying');
const speedControl = document.getElementById('speedControl');
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

// 播放速度调整
speedControl.addEventListener('change', () => {
    player.playbackRate = parseFloat(speedControl.value);
});

// 音量调节
volumeControl.addEventListener('input', () => {
    player.volume = parseFloat(volumeControl.value);
});
