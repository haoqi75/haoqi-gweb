// 获取URL参数
const urlParams = new URLSearchParams(window.location.search);
const audioUrl = decodeURIComponent(urlParams.get('url') || '');

// 设置播放器
const player = document.getElementById('player');
const nowPlaying = document.getElementById('nowPlaying');

if (audioUrl) {
    player.src = audioUrl;
    nowPlaying.textContent = decodeURIComponent(audioUrl.split('/').pop()) || '当前曲目';
    
    player.addEventListener('error', () => {
        nowPlaying.textContent = '播放失败，请检查链接';
    });
} else {
    nowPlaying.textContent = '未指定音频文件';
}