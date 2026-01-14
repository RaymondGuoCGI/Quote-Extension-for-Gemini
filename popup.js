document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggle-switch');
    const statusText = document.getElementById('status-text');

    chrome.storage.local.get(['extensionEnabled'], (result) => {
        const isEnabled = result.extensionEnabled !== false;
        toggleSwitch.checked = isEnabled;
        updateStatusText(isEnabled);
    });

    toggleSwitch.addEventListener('change', () => {
        const isEnabled = toggleSwitch.checked;
        chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
            updateStatusText(isEnabled);
        });
    });

    function updateStatusText(enabled) {
        statusText.innerText = enabled ? 'Enabled' : 'Disabled';
        statusText.style.color = enabled ? '#10a37f' : '#888';
    }
});
