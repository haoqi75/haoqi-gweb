// 当前路径
let currentPath = '/';
let fileData = { files: [] };

function initRouter() {
    // 初始加载时检查哈希路由
    window.addEventListener('load', () => {
        const hashPath = getPathFromHash();
        if (hashPath) {
            renderFileList(hashPath);
        }
    });

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
    const normalizedPath = path === '/' ? '' : path;
    window.location.hash = `#!/${normalizedPath}`;
}

// 修改原有的 renderFileList 函数
function renderFileList(path) {
    currentPath = path;
    currentPathElement.textContent = path;
    updateHashPath(path); // 添加这行来更新URL

// DOM元素
const fileListElement = document.getElementById('fileList');
const currentPathElement = document.getElementById('currentPath');
const goUpButton = document.getElementById('goUp');
const refreshButton = document.getElementById('refresh');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('DOMContentLoaded', () => {
    initRouter(); // 添加这行
    loadFileData().then(() => {
        const initialPath = getPathFromHash();
        renderFileList(initialPath);
    }).catch(error => {
        console.error('加载文件数据失败:', error);
        fileListElement.innerHTML = '<div class="file-item error">无法加载文件列表</div>';
    });
    
    // 事件监听
    goUpButton.addEventListener('click', goUp);
    refreshButton.addEventListener('click', refresh);
});

// 加载JSON文件数据
async function loadFileData() {
    try {
        const response = await fetch('files.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fileData = await response.json();
    } catch (error) {
        throw error;
    }
}

// 渲染文件列表
function renderFileList(path) {
    currentPath = path;
    currentPathElement.textContent = path;
    
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
        
        // 右键菜单 - 在新标签页打开
        fileItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (file.type === 'file' && file.url) {
                window.open(file.url, '_blank');
            }
        });
        
        fileListElement.appendChild(fileItem);
    });
}

// 获取路径下的文件
// 修改后的获取路径下文件函数
function getFilesAtPath(path) {
    if (path === '/') {
        return fileData.files;
    }
    
    const pathParts = path.split('/').filter(part => part !== '');
    let currentLevel = fileData.files;
    
    for (const part of pathParts) {
        const found = currentLevel.find(item => item.name === part && item.type === 'folder');
        if (found && found.children) {
            currentLevel = found.children;
        } else {
            return [];
        }
    }
    
    // 为返回的文件动态添加path属性
    return currentLevel.map(item => {
        const itemWithPath = {...item};
        itemWithPath.path = `${path}${path.endsWith('/') ? '' : '/'}${item.name}`;
        return itemWithPath;
    });
}

// 处理文件点击
function handleFileClick(file) {
    if (file.type === 'folder') {
        renderFileList(file.path);
    } else {
        openFile(file);
    }
}

// 打开文件 - 实际实现
function openFile(file) {
    if (!file.url) {
        alert(`文件 ${file.name} 没有可访问的URL`);
        return;
    }
    
    // 根据文件类型处理
    const extension = file.name.split('.').pop().toLowerCase();
    
    // 可以直接在浏览器中打开的文件类型
    const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'html', 'htm', 'txt', 'md'];
    
    if (viewableTypes.includes(extension)) {
        // 直接在新标签页打开
        window.open(file.url, '_blank');
    } else {
        // 其他类型文件尝试下载
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// 返回上一级
function goUp() {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(part => part !== '');
    pathParts.pop();
    const newPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
    
    renderFileList(newPath);
}

// 刷新
function refresh() {
    loadFileData().then(() => {
        renderFileList(currentPath);
    }).catch(error => {
        console.error('刷新文件数据失败:', error);
        fileListElement.innerHTML = '<div class="file-item error">刷新失败</div>';
    });
}

// 获取文件图标
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const icons = {
        'pdf': '📄',
        'doc': '📄',
        'docx': '📄',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '📊',
        'pptx': '📊',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'html': '🌐',
        'htm': '🌐',
        'js': '📜',
        'css': '🎨',
        'json': '🔣',
        'md': '📝',
        'txt': '📝',
        'mp3': '🎵'
    };
    
    return icons[extension] || '📄';
}