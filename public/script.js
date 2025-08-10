// 当前路径
let currentPath = '/';
let fileData = { files: [] }; // 初始化为空，将从JSON加载

// DOM元素
const fileListElement = document.getElementById('fileList');
const currentPathElement = document.getElementById('currentPath');
const goUpButton = document.getElementById('goUp');
const refreshButton = document.getElementById('refresh');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadFileData().then(() => {
        renderFileList(currentPath);
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
        
        fileListElement.appendChild(fileItem);
    });
}

// 获取路径下的文件
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
    
    return currentLevel;
}

// 处理文件点击
function handleFileClick(file) {
    if (file.type === 'folder') {
        renderFileList(file.path);
    } else {
        openFile(file);
    }
}

// 打开文件
function openFile(file) {
    // 在实际应用中，这里会根据文件类型进行不同的处理
    // 例如：显示内容、下载文件、在新标签页打开等
    alert(`打开文件: ${file.path}\n\n这是一个演示，实际应用中会根据文件类型进行相应处理。`);
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
        'txt': '📝'
    };
    
    return icons[extension] || '📄';
}