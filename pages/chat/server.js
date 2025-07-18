const joinRoomSection = document.getElementById('joinRoomSection');
const usernameMessage = document.getElementById('usernameMessage');
const chatSection = document.getElementById('chatSection');
const chatMessagesWrapper = document.getElementById('chatMessagesWrapper');
const settingsContainerInChat = document.getElementById('settingsContainerInChat');
const joinRoomForm = document.getElementById('joinRoomForm');
const roomNameInput = document.getElementById('roomNameInput');
const joinRoomButton = document.getElementById('joinRoomButton');
const chatMessages = document.getElementById('chatMessages');
const chatInputForm = document.getElementById('chatInputForm');
const messageInput = document.getElementById('messageInput');
const roomTitle = document.getElementById('roomTitle');
const currentUsernameDisplay = document.getElementById('currentUsernameDisplay');
const changeUsernameForm = document.getElementById('changeUsernameForm');
const newUsernameInput = document.getElementById('newUsernameInput');
const logoutButton = document.getElementById('logoutButton');

const navHome = document.getElementById('navHome');
const navSettings = document.getElementById('navSettings');
const navChat = document.getElementById('navChat');
const tabChat = document.getElementById('tabChat');
const tabSettings = document.getElementById('tabSettings');

let currentRoom = '';
let username = '';

const socket = io('http://localhost:3000');

const USED_USERNAMES = {};

function saveUsername(name) {
    username = name;
    localStorage.setItem('username', name);
    USED_USERNAMES[name] = true;
    localStorage.setItem('usedUsernames', JSON.stringify(USED_USERNAMES));
    currentUsernameDisplay.textContent = username;
    updateJoinRoomUI();
}

function loadUsername() {
    const savedUsername = localStorage.getItem('username');
    const savedUsedUsernames = localStorage.getItem('usedUsernames');
    if (savedUsedUsernames) {
        Object.assign(USED_USERNAMES, JSON.parse(savedUsedUsernames));
    }

    if (savedUsername) {
        username = savedUsername;
        USED_USERNAMES[username] = true;
        currentUsernameDisplay.textContent = username;
        showMainSection('joinRoomSection');
        updateJoinRoomUI();
    } else {
        showMainSection('joinRoomSection');
        updateJoinRoomUI();
    }
}

function updateJoinRoomUI() {
    if (username) {
        roomNameInput.placeholder = 'Enter room code';
        joinRoomButton.textContent = 'Join Room';
        roomNameInput.type = 'text';
    } else {
        roomNameInput.placeholder = 'Enter your username';
        joinRoomButton.textContent = 'Set Username';
        roomNameInput.type = 'text';
    }
}

function appendMessage(senderUsername, messageText, isSelf) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (isSelf) {
        messageElement.classList.add('self');
    } else {
        messageElement.classList.add('other');
    }

    if (senderUsername === 'System') {
        messageElement.classList.add('system');
        messageElement.textContent = messageText;
    } else {
        const usernameSpan = document.createElement('span');
        usernameSpan.classList.add('username');
        usernameSpan.textContent = senderUsername;

        const textSpan = document.createElement('span');
        textSpan.classList.add('text');
        textSpan.textContent = messageText;

        messageElement.appendChild(usernameSpan);
        messageElement.appendChild(textSpan);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showMainSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    const navItems = document.querySelectorAll('.leftnavbar .navitem');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    if (sectionId === 'joinRoomSection') {
        navHome.classList.add('active');
    } else if (sectionId === 'chatSection') {
        if (settingsContainerInChat.classList.contains('active')) {
            navSettings.classList.add('active');
        } else {
            navChat.classList.add('active');
        }
    }
}

function showChatSubSection(subSectionId) {
    const subSections = document.querySelectorAll('.chat-sub-section');
    subSections.forEach(subSection => {
        subSection.classList.remove('active');
    });
    document.getElementById(subSectionId).classList.add('active');

    const chatTabs = document.querySelectorAll('.chat-tab');
    chatTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    if (subSectionId === 'chatMessagesWrapper') {
        tabChat.classList.add('active');
        navChat.classList.add('active');
        navSettings.classList.remove('active');
    } else if (subSectionId === 'settingsContainerInChat') {
        tabSettings.classList.add('active');
        navSettings.classList.add('active');
        navChat.classList.remove('active');
    }
}

function displayUsernameMessage(message, type = 'info') {
    usernameMessage.textContent = message;
    usernameMessage.style.color = type === 'error' ? '#ff6666' : '#ffcc00';
    setTimeout(() => {
        usernameMessage.textContent = '';
    }, 3000);
}

socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
    appendMessage('System', 'Disconnected from chat server. Attempting to reconnect...', false);
});

socket.on('roomJoined', (data) => {
    currentRoom = data.roomName;
    roomTitle.innerHTML = `Room: ${currentRoom} <i class="bi bi-chat"></i>`;
    showMainSection('chatSection');
    showChatSubSection('chatMessagesWrapper');
    chatMessages.innerHTML = '';
    appendMessage('System', `You have joined room: ${currentRoom}`, false);
});

socket.on('message', (data) => {
    appendMessage(data.username, data.message, data.username === username);
});

joinRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputValue = roomNameInput.value.trim();

    if (!username) {
        if (inputValue && !USED_USERNAMES[inputValue]) {
            saveUsername(inputValue);
            displayUsernameMessage('Username set successfully! Now enter a room code.', 'info');
            roomNameInput.value = '';
        } else if (USED_USERNAMES[inputValue]) {
            displayUsernameMessage('Name not available.', 'error');
        } else {
            displayUsernameMessage('Please enter a username.', 'error');
        }
    } else {
        const roomCode = inputValue;
        if (roomCode) {
            socket.emit('joinRoom', { roomName: roomCode, username });
            roomNameInput.value = '';
        } else {
            alert('Please enter a room code.');
        }
    }
});

chatInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message && currentRoom && username) {
        socket.emit('sendMessage', { roomName: currentRoom, message, username });
        messageInput.value = '';
    }
});

changeUsernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = newUsernameInput.value.trim();
    if (newName && newName !== username) {
        if (!USED_USERNAMES[newName]) {
            if (username && USED_USERNAMES[username]) {
                delete USED_USERNAMES[username];
            }
            saveUsername(newName);
            alert('Username updated successfully!');
            newUsernameInput.value = '';
            showChatSubSection('chatMessagesWrapper');
        } else {
            alert('This username is already taken.');
        }
    } else if (newName === username) {
        alert('This is already your current username.');
    } else {
        alert('Please enter a valid username.');
    }
});

logoutButton.addEventListener('click', () => {
    if (username) {
        delete USED_USERNAMES[username];
        localStorage.setItem('usedUsernames', JSON.stringify(USED_USERNAMES));
    }
    localStorage.removeItem('username');
    username = '';
    currentRoom = '';
    showMainSection('joinRoomSection');
    updateJoinRoomUI();
    displayUsernameMessage('You have been logged out.', 'info');
});

navSettings.addEventListener('click', (e) => {
    e.preventDefault();
    if (username) {
        showMainSection('chatSection');
        showChatSubSection('settingsContainerInChat');
    } else {
        displayUsernameMessage('Please set your username first to access settings.', 'error');
        showMainSection('joinRoomSection');
    }
});

navChat.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentRoom && username) {
        showMainSection('chatSection');
        showChatSubSection('chatMessagesWrapper');
    } else if (username) {
        alert('Please join a room first to access the chat.');
        showMainSection('joinRoomSection');
    } else {
        displayUsernameMessage('Please set your username first.', 'error');
        showMainSection('joinRoomSection');
    }
});

tabChat.addEventListener('click', () => {
    showChatSubSection('chatMessagesWrapper');
});

tabSettings.addEventListener('click', () => {
    showChatSubSection('settingsContainerInChat');
});

loadUsername();
