(function(){
  const audio = document.getElementById('audio');
  const btnPlay = document.getElementById('btn-play');
  const btnRewind = document.getElementById('btn-rewind');
  const btnForward = document.getElementById('btn-forward');
  const btnLoop = document.getElementById('btn-loop');
  const btnMute = document.getElementById('btn-mute');
  const progress = document.getElementById('progress');
  const progressWrap = document.getElementById('progress-wrap');
  const currentEl = document.getElementById('current');
  const durationEl = document.getElementById('duration');
  const volume = document.getElementById('volume');
  const urlInput = document.getElementById('url-input');
  const btnLoad = document.getElementById('btn-load');
  const titleEl = document.getElementById('title');
  const artistEl = document.getElementById('artist');
  const coverEl = document.getElementById('cover');

  function fmt(t){
    if (isNaN(t) || !isFinite(t)) return '0:00';
    const mm = Math.floor(t/60);
    const ss = Math.floor(t%60).toString().padStart(2,'0');
    return `${mm}:${ss}`;
  }

  function getUrlParam(){
    try{
      const qp = new URLSearchParams(location.search);
      const u = qp.get('url');
      return u ? decodeURIComponent(u) : null;
    }catch(e){return null}
  }

  function setSource(src){
    if(!src) return;
    audio.src = src;
    audio.load();
    titleEl.textContent = (src.split('/').pop() || src).slice(0,40);
    artistEl.textContent = '通过 URL 加载';
  }

  const paramUrl = getUrlParam();
  if(paramUrl){
    urlInput.value = paramUrl;
    setSource(paramUrl);
  }

  btnPlay.addEventListener('click', ()=>{
    if(audio.paused) audio.play().catch(err=>console.warn(err));
    else audio.pause();
  });

  btnRewind.addEventListener('click', ()=>{ audio.currentTime = Math.max(0, audio.currentTime - 10); });
  btnForward.addEventListener('click', ()=>{ audio.currentTime = Math.min(audio.duration||0, audio.currentTime + 10); });
  btnLoop.addEventListener('click', ()=>{ audio.loop = !audio.loop; btnLoop.style.opacity = audio.loop ? '1' : '0.6'; });
  btnMute.addEventListener('click', ()=>{ audio.muted = !audio.muted; btnMute.textContent = audio.muted ? '🔇' : '🔈'; });

  volume.addEventListener('input',(e)=>{ audio.volume = parseFloat(e.target.value); });

  btnLoad.addEventListener('click', ()=>{
    const u = urlInput.value.trim();
    if(!u) return alert('请输入有效的音乐文件 URL');
    try{ new URL(u); }catch(e){ return alert('无效的 URL'); }
    const newUrl = new URL(location.href);
    newUrl.searchParams.set('url', encodeURIComponent(u));
    history.replaceState({},'',newUrl);
    setSource(u);
  });

  audio.addEventListener('timeupdate', ()=>{
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    progress.style.width = pct + '%';
    currentEl.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', ()=>{
    durationEl.textContent = fmt(audio.duration);
    if(!isFinite(audio.duration)) durationEl.textContent = '未知';
  });

  audio.addEventListener('play', ()=>{ btnPlay.textContent = '❚❚'; });
  audio.addEventListener('pause', ()=>{ btnPlay.textContent = '▶'; });
  audio.addEventListener('ended', ()=>{ btnPlay.textContent = '▶'; });

  progressWrap.addEventListener('click', (e)=>{
    const rect = progressWrap.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * (audio.duration || 0);
  });

  coverEl.addEventListener('dragover', (e)=>{ e.preventDefault(); coverEl.style.opacity=0.9; });
  coverEl.addEventListener('dragleave', (e)=>{ coverEl.style.opacity=1; });
  coverEl.addEventListener('drop', (e)=>{
    e.preventDefault(); coverEl.style.opacity=1;
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f){
      const url = URL.createObjectURL(f);
      urlInput.value = '';
      setSource(url);
      titleEl.textContent = f.name;
      artistEl.textContent = '本地文件';
    }
  });

  audio.addEventListener('error', (e)=>{
    console.error('音频加载错误', e);
    artistEl.textContent = '加载失败，请检查 URL 或 CORS 设置';
  });

  if(paramUrl){
    audio.play().catch(()=>{});
  }
})();