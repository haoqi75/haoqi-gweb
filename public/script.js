function initRouter() {
    // 初始加载时检查哈希路由
    const hashPath = getPathFromHash();
    if (hashPath) {
        renderFileList(hashPath);
    }

    // 哈希变化时响应
    window.addEventListener('hashchange', () => {
        const hashPath = getPathFromHash();
        if (hashPath) {
            renderFileList(hashPath);
        }
    });
}

// 从哈希获取路径
function getPathFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#!/')) {
        return hash.substring(3) || '/';
    }
    return '/';
}

// 更新哈希路由
function updateHashPath(path) {
    // 处理根路径特殊情况
    if (path === '/') {
        window.location.hash = '#!/';
        return;
    }
    
    // 规范化路径：
    // 1. 替换连续斜杠为单个
    // 2. 移除开头和结尾的斜杠
    const normalizedPath = path.replace(/\/+/g, '/')
                              .replace(/^\//, '')
                              .replace(/\/$/, '');
    
    window.location.hash = `#!/${normalizedPath}`;
}

// 当前路径
let currentPath = '/';
let fileData = { files: [] };

// DOM元素
const fileListElement = document.getElementById('fileList');
const currentPathElement = document.getElementById('currentPath');
const goUpButton = document.getElementById('goUp');
const refreshButton = document.getElementById('refresh');

// 加载JSON文件数据
async function loadFileData() {
    try {
        const response = await fetch('files.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // 预处理.url文件（可选）
        fileData.files = data.files.map(file => {
            if (file.name.endsWith('.url')) {
                return {
                    ...file,
                    type: 'file',
                    icon: '🌐',
                    // 可以添加content字段存储文件内容（如果需要解析）
                };
            }
            return file;
        });
        
        return true;
    } catch (error) {
        console.error('加载文件数据失败:', error);
        fileListElement.innerHTML = `
            <div class="file-item error">
                无法加载文件列表: ${error.message}
                <br>请确认files.json文件存在且格式正确
            </div>
        `;
        return false;
    }
}

// 渲染文件列表
function renderFileList(path) {
    currentPath = path;
    currentPathElement.textContent = path;
    updateHashPath(path);
    
    const files = getFilesAtPath(path);
    fileListElement.innerHTML = '';
    
    if (files.length === 0) {
        fileListElement.innerHTML = '<div class="file-item">空文件夹</div>';
        return;
    }
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${file.type}`;
        
        const icon = document.createElement('span');
        icon.className = 'file-icon';
        icon.innerHTML = file.type === 'folder' ? '📁' : getFileIcon(file.name);
        
        const name = document.createElement('span');
        name.className = 'file-name';
        name.textContent = file.name;
        
        const size = document.createElement('span');
        size.className = 'file-size';
        size.textContent = file.size || '';
        
        fileItem.appendChild(icon);
        fileItem.appendChild(name);
        fileItem.appendChild(size);
        
        fileItem.addEventListener('click', () => handleFileClick(file));
        
        fileItem.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const extension = file.name.split('.').pop().toLowerCase();
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
    
    if (audioTypes.includes(extension)) {
        // 右键音乐文件：提供两个选项
        if (confirm(`"${file.name}"\n\n左键将在播放器中打开\n是否要直接下载？`)) {
            downloadFile(file);
        }
    } else if (file.type === 'file' && file.url) {
        window.open(file.url, '_blank');
    }
        });
        
        fileListElement.appendChild(fileItem);
    });
}

// 获取路径下的文件
function getFilesAtPath(path) {
    // 规范化输入路径
    const normalizedPath = path === '/' ? '' : path.replace(/\/+/g, '/')
                                                  .replace(/^\//, '')
                                                  .replace(/\/$/, '');
    
    // 处理根目录
    if (!normalizedPath) {
        return (fileData.files || []).map(item => ({
            ...item,
            path: item.name // 不再添加前导斜杠
        }));
    }
    
    // 处理子目录
    const pathParts = normalizedPath.split('/');
    let currentLevel = fileData.files || [];
    
    for (const part of pathParts) {
        const found = currentLevel.find(item => 
            item.name === part && item.type === 'folder'
        );
        if (found && found.children) {
            currentLevel = found.children;
        } else {
            return [];
        }
    }
    
    // 生成新路径（不再自动添加斜杠）
    return currentLevel.map(item => ({
        ...item,
        path: `${normalizedPath}/${item.name}`
    }));
}

// 处理文件点击
function handleFileClick(file) {
    if (file.type === 'folder') {
        // 直接使用文件路径，不再额外处理
        renderFileList(file.path);
    } else {
        openFile(file);
    }
}

// 打开文件
function openFile(file) {
    if (!file.url) {
        alert(`文件 ${file.name} 没有可访问的URL`);
        return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    
    // 特殊处理.url文件
    if (extension === 'url') {
        handleUrlFile(file);
        return;
    }
    
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac'];

    if (audioTypes.includes(extension)) {
        // 新：指向music目录下的播放器
        const encodedUrl = encodeURIComponent(file.url);
        window.open(`music/index.html?url=${encodedUrl}`, '_blank');
    }
    // 其他文件保持原有逻辑
    else if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'html', 'htm', 'txt', 'md'].includes(extension)) {
        window.open(file.url, '_blank');
    } else {
        downloadFile(file);
    }
}

// 返回上一级
function goUp() {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.length ? `/${pathParts.join('/')}` : '/';
    
    renderFileList(newPath);
}

// 刷新
function refresh() {
    loadFileData().then((success) => {
        if (success) {
            renderFileList(currentPath);
        }
    });
}

// 获取文件图标
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄', 'doc': '📄', 'docx': '📄',
        'xls': '📊', 'xlsx': '📊', 'ppt': '📊', 'pptx': '📊',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
        'html': '🌐', 'htm': '🌐', 'js': '📜', 'css': '🎨',
        'json': '🔣', 'md': '📝', 'txt': '📝', 'url': '🌐',
        'mp3': '🎵'
    };
    return icons[extension] || '📄';
}

// 增强版路径消毒函数
function sanitizePath(path) {
    return path
        .replace(/[^a-zA-Z0-9\/\-_.]/g, '')  // 允许点和中划线
        .replace(/\/+/g, '/')                 // 合并连续斜杠
        .replace(/^\/|\/$/g, '')              // 去除首尾斜杠
        || '/';                               // 空路径返回根
}

// 新增URL文件处理函数
function handleUrlFile(file) {
    if (file.content) {
        // 如果文件包含[InternetShortcut]内容
        const urlMatch = file.content.match(/URL=(.+)/i);
        if (urlMatch && urlMatch[1]) {
            window.open(urlMatch[1], '_blank');
            return;
        }
    }
    
    // 默认行为：直接打开文件链接
    window.open(file.url, '_blank');
}

// 初始化应用
async function initializeApp() {
    const loaded = await loadFileData();
    if (loaded) {
        initRouter();
        goUpButton.addEventListener('click', goUp);
        refreshButton.addEventListener('click', refresh);
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', initializeApp);