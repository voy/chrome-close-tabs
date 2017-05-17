import ContextMenu from './ContextMenu';

let contextMenu = new ContextMenu(chrome);
contextMenu.initialize();

chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'updateContextMenu') {
        contextMenu.initialize();
    }
});