document.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
        chrome.runtime.sendMessage({ type: 'updateContextMenu'});
    }
}, true);
