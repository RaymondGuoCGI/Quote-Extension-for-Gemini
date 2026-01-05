document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggle-switch');
    const statusText = document.getElementById('status-text');

    // 1. 初始化：从存储中读取状态 (默认为 true)
    chrome.storage.local.get(['extensionEnabled'], (result) => {
        // 如果是 undefined，说明是第一次安装，默认开启
        const isEnabled = result.extensionEnabled !== false;
        toggleSwitch.checked = isEnabled;
        updateStatusText(isEnabled);
    });

    // 2. 监听开关变化
    toggleSwitch.addEventListener('change', () => {
        const isEnabled = toggleSwitch.checked;

        // 保存到 storage
        chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
            updateStatusText(isEnabled);
            // 可选：在这里可以给当前 tab 发消息，但在 content.js 里监听 storage 变化更简单
        });
    });

    function updateStatusText(enabled) {
        statusText.innerText = enabled ? "已开启" : "已禁用";
        statusText.style.color = enabled ? "#10a37f" : "#888";
    }
});