// content.js - Quote Extension v2.3 (Invisible Wall Fix)

// ==================== 全局变量 ====================
let currentQuoteText = null;
let quoteCard = null;
let isExtensionEnabled = true;

// 保存最近的引文和正文，用于格式化
let pendingQuote = null;
let pendingBody = null;

// ==================== 0. 初始化与状态同步 ====================
chrome.storage.local.get(['extensionEnabled'], (result) => {
    isExtensionEnabled = result.extensionEnabled !== false;
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.extensionEnabled) {
        isExtensionEnabled = changes.extensionEnabled.newValue;
        if (!isExtensionEnabled) {
            triggerBtn.style.display = "none";
            removeCard();
        }
    }
});

// ==================== 1. 初始化 Quote 按钮 ====================
const triggerBtn = document.createElement("button");
triggerBtn.id = "ai-quote-trigger-btn";
triggerBtn.innerHTML = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 17H9L11 13V7H5V13H8L6 17ZM14 17H17L19 13V7H13V13H16L14 17Z" />
  </svg>
  <span>Quote</span>
`;
document.body.appendChild(triggerBtn);

document.addEventListener("selectionchange", () => {
    if (!isExtensionEnabled) return;
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        triggerBtn.style.display = "none";
    }
});

document.addEventListener("mouseup", (e) => {
    if (!isExtensionEnabled) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text || e.target.closest("#ai-quote-trigger-btn") || e.target.closest("#ai-quote-card")) return;
    if (e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    triggerBtn.style.top = `${rect.bottom + window.scrollY + 8}px`;
    triggerBtn.style.left = `${rect.right + window.scrollX}px`;
    triggerBtn.style.display = "flex";
});

// ==================== 2. 核心：点击 Quote ====================
triggerBtn.addEventListener("click", async (e) => {
    if (!isExtensionEnabled) return;
    e.preventDefault();
    e.stopPropagation();

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text) return;

    const inputBox = findInputBox();

    if (inputBox) {
        createAndShowCard(text, inputBox);
        currentQuoteText = text;
    } else {
        // 剪贴板逻辑：也加上隐形墙，保证粘贴到 Notion/Obsidian 等地方格式也完美
        const formattedMarkdown = processQuoteText(text) + "\n\u200B\n";
        await copyToClipboard(formattedMarkdown);
        showToast("已复制引用内容 (Markdown)");
    }

    selection.removeAllRanges();
    triggerBtn.style.display = "none";
});

// ---------- 格式化引用的核心函数 ----------
function processQuoteText(rawText) {
    // 使用Unicode方框字符创建视觉边框
    const lines = rawText.split('\n');
    const boxedLines = lines.map(line => `│ ${line}`).join('\n');
    return `┌── 引用 ──────────────────────────────
${boxedLines}
└${'\u2500'.repeat(40)}`;
}

function processBodyText(rawText) {
    return `\n💬 ${rawText}`;
}

// ---------- 智能寻找输入框 ----------
function findInputBox() {
    const aiSelectors = '#prompt-textarea, [contenteditable="true"][data-id], textarea[placeholder*="Ask"], textarea[placeholder*="Message"]';
    let input = document.querySelector(aiSelectors);
    if (input) return input;

    const candidates = document.querySelectorAll('textarea, div[contenteditable="true"]');
    let bestCandidate = null;
    let maxArea = 0;

    candidates.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 20 && el.offsetParent !== null) {
            const area = rect.width * rect.height;
            if (area > maxArea) {
                maxArea = area;
                bestCandidate = el;
            }
        }
    });
    return bestCandidate;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy', err);
    }
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #333; color: #fff; padding: 8px 16px; borderRadius: 4px;
        fontSize: 12px; zIndex: 10000; boxShadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ==================== 3. 卡片逻辑 ====================
function createAndShowCard(text, inputBox) {
    removeCard();

    let container = inputBox.parentElement;
    if (window.location.hostname.includes("chatgpt.com") || window.location.hostname.includes("claude.ai")) {
        const form = inputBox.closest("form");
        if (form) container = form;
    }

    if (container === document.body) {
        const formatted = processQuoteText(text) + "\n\u200B\n";
        copyToClipboard(formatted);
        showToast("已复制 (无法定位输入框)");
        return;
    }

    quoteCard = document.createElement("div");
    quoteCard.id = "ai-quote-card";

    // 移除引文中的空行
    const cleanedText = text.split('\n').filter(line => line.trim().length > 0).join('\n');

    quoteCard.innerHTML = `
        <div id="ai-quote-text">${escapeHtml(cleanedText)}</div>
        <button id="ai-quote-close">✕</button>
    `;

    container.insertBefore(quoteCard, container.firstChild);
    inputBox.scrollIntoView({ behavior: "smooth", block: "center" });

    // 自动聚焦到输入框
    setTimeout(() => {
        inputBox.focus();
        // 如果是 contenteditable 元素,将光标移到末尾
        if (inputBox.isContentEditable) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(inputBox);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, 100);

    quoteCard.querySelector("#ai-quote-close").addEventListener("click", () => {
        removeCard();
        currentQuoteText = null;

        // 卡片关闭时，立即格式化最新的消息
        if (pendingQuote && pendingBody) {
            setTimeout(() => {
                formatLatestMessage();
            }, 100); // 短暂延迟确保消息已渲染
        }
    });
}

function removeCard() {
    if (quoteCard) {
        quoteCard.remove();
        quoteCard = null;
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ==================== 4. 发送拦截 (Enter) ====================
document.addEventListener("keydown", (e) => {
    if (!isExtensionEnabled) return;

    if (e.key === "Enter" && !e.shiftKey && currentQuoteText) {
        const inputBox = findInputBox();
        if (!inputBox) return;

        let userQuestion = (inputBox.value || inputBox.innerText || "").trim();

        const formattedQuote = processQuoteText(currentQuoteText);
        const formattedBody = processBodyText(userQuestion);

        // 保存引文和正文，用于发送后格式化
        pendingQuote = currentQuoteText;
        pendingBody = userQuestion;

        // 发送纯净的内容
        const finalContent = `${formattedQuote}

${formattedBody}`;
        setNativeValue(inputBox, finalContent);

        // 清空输入框并移除卡片
        setTimeout(() => {
            setNativeValue(inputBox, "");
            removeCard();
            currentQuoteText = null;

            // 发送后立即格式化（延迟确保消息已渲染）
            setTimeout(() => {
                formatLatestMessage();
            }, 500);
        }, 50);
    }
}, true);

function setNativeValue(element, value) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }
    } else {
        element.innerText = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

// 格式化最新的用户消息
function formatLatestMessage() {
    if (!pendingQuote || !pendingBody) {
        console.log('[Quote Extension] No pending quote/body to format');
        return;
    }

    console.log('[Quote Extension] 开始格式化最新消息');
    console.log('[Quote Extension] 引文:', pendingQuote.substring(0, 50) + '...');
    console.log('[Quote Extension] 正文:', pendingBody);

    // 查找最新的用户消息 - 寻找包含 ASCII 框的消息
    const allMessages = document.querySelectorAll('*');
    let latestMessage = null;

    // 从后往前查找包含 ASCII 框格式的元素
    for (let i = allMessages.length - 1; i >= 0; i--) {
        const el = allMessages[i];
        if (el.dataset && el.dataset.formatted) continue;

        const text = el.innerText || el.textContent || '';

        // 检查是否包含 ASCII 框特征（发送后的格式）
        const hasAsciiBox = text.includes('┌── 引用') && text.includes('└');
        const hasBodyMarker = text.includes('💬');

        // 或者直接检查是否包含原始引文内容（作为备选）
        const hasQuoteContent = text.includes(pendingQuote.substring(0, 30));

        if ((hasAsciiBox || hasQuoteContent) && text.length > 10) {
            // 确保不是script、style等
            const tagName = el.tagName.toLowerCase();
            if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') continue;

            // 确保元素可见且不是太小的元素
            if (el.offsetHeight > 20 && el.offsetWidth > 100) {
                latestMessage = el;
                console.log('[Quote Extension] 找到候选消息元素:', el.tagName, el.className);
                break;
            }
        }
    }

    if (latestMessage) {
        console.log('[Quote Extension] 找到最新消息，开始格式化');
        formatMessageWithData(latestMessage, pendingQuote, pendingBody);
        latestMessage.dataset.formatted = 'true';

        // 清除pending数据
        pendingQuote = null;
        pendingBody = null;
    } else {
        console.log('[Quote Extension] 未找到最新消息，尝试增加延迟重试');
        // 如果没找到，可能是渲染还没完成，再试一次
        setTimeout(() => {
            if (pendingQuote && pendingBody) {
                formatLatestMessage();
            }
        }, 500);
    }
}

// 使用给定的引文和正文数据格式化元素
function formatMessageWithData(element, quoteText, bodyText) {
    // 不替换整个元素，而是修改内部样式
    // 查找包含引文和正文的文本节点
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    // 查找包含引文的文本节点
    for (const textNode of textNodes) {
        const text = textNode.textContent;

        // 使用更宽松的检测逻辑，只要检测到 "引用" 和 "└" 后的横线即可，或者匹配 pendingQuote
        // 考虑到 ASCII 格式可能受换行影响，使用简单的关键特征匹配
        const hasAsciiHeader = text.includes('┌') && text.includes('引用');
        const hasAsciiFooter = text.includes('└') && text.includes('──');

        // 或者是未格式化的 pendingQuote 原文 (如果 ASCII 渲染失败)
        const hasPendingQuote = quoteText && text.includes(quoteText);

        if ((hasAsciiHeader && hasAsciiFooter) || hasPendingQuote) {
            // 创建新的结构
            const parent = textNode.parentElement;
            if (!parent) continue;

            // 创建容器
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin-top: 8px; margin-bottom: 8px;';

            // 1. 创建引文块 (User request: 灰色的底色框)
            const quoteDiv = document.createElement('div');
            quoteDiv.style.cssText = `
                display: block;
                font-size: 13px;
                color: #A0A0A0;  /* 灰色文字 */
                background-color: #2F2F2F; /* 灰色底色 */
                border-left: 3px solid #10a37f; /* 绿色左边框 */
                padding: 12px 16px;
                border-radius: 8px;
                line-height: 1.6;
                position: relative;
            `;

            // 添加一个 "引用" 标签头，让它看起来更像 Mockup
            const quoteLabel = document.createElement('div');
            quoteLabel.textContent = "—— 引用";
            quoteLabel.style.cssText = "font-size: 12px; color: #888; margin-bottom: 8px; font-weight: 500;";
            quoteDiv.appendChild(quoteLabel);

            // 引文内容
            const quoteContentDiv = document.createElement('div');
            quoteContentDiv.textContent = quoteText.trim();
            quoteContentDiv.style.whiteSpace = "pre-wrap";
            quoteDiv.appendChild(quoteContentDiv);

            // 2. 创建正文块 (User request: 没有底色，正文区隔开)
            const bodyDiv = document.createElement('div');
            bodyDiv.style.cssText = `
                display: block;
                font-size: 15px;
                color: #ececec; /* 白色字体，确保在深色模式下可见 */
                line-height: 1.6;
                white-space: pre-wrap;
                padding: 4px 2px;
            `;
            // 移除可能存在的 "💬 " 前缀，如果用户觉得它多余 (这里保留但做一下清洗)
            const cleanBody = bodyText.replace(/^[\n\r]*💬\s*/, '').trim();
            bodyDiv.textContent = cleanBody;

            wrapper.appendChild(quoteDiv);
            wrapper.appendChild(bodyDiv);

            // 替换文本节点
            parent.replaceChild(wrapper, textNode);

            console.log('[Quote Extension] message formatted successfully.');
            break;
        }
    }
}

// ==================== 5. 通用消息格式化 ====================
// 监听所有AI聊天页面的消息，将ASCII框格式替换为独立的样式块

function observeChatMessages() {
    // 移除ChatGPT限制，让它在所有平台上工作（包括Gemini）
    console.log('[Quote Extension] Starting message observer for all platforms');

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    processUserMessage(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function processUserMessage(node) {
    // 如果节点已经被格式化过，跳过
    if (node.dataset && node.dataset.formatted) return;

    // 查找所有可能包含文本的元素
    const textElements = [];

    // ChatGPT特定选择器
    if (node.querySelectorAll) {
        node.querySelectorAll('[data-message-author-role="user"]').forEach(el => {
            textElements.push(el);
        });
    }

    if (node.getAttribute && node.getAttribute('data-message-author-role') === 'user') {
        textElements.push(node);
    }

    // 通用选择器 - 查找包含大量文本的元素（适用于Gemini等）
    if (textElements.length === 0 && node.querySelectorAll) {
        // 查找可能包含用户消息的元素
        const candidates = node.querySelectorAll('div, p, span');
        candidates.forEach(el => {
            const text = el.innerText || el.textContent || '';
            // 如果包含ASCII框特征，且文本长度合理
            if (text.includes('┌── 引用') && text.length > 20 && text.length < 10000) {
                textElements.push(el);
            }
        });
    }

    // 如果node本身包含ASCII框
    const nodeText = node.innerText || node.textContent || '';
    if (nodeText.includes('┌── 引用') && nodeText.length > 20 && !node.dataset.formatted) {
        textElements.push(node);
    }

    textElements.forEach(element => {
        if (element.dataset && element.dataset.formatted) return;

        const text = element.innerText || element.textContent || '';

        // 检测ASCII框格式
        const hasAsciiBox = text.includes('┌── 引用') && text.includes('└');
        const hasBodyMarker = text.includes('💬');

        if (hasAsciiBox) {
            console.log('[Quote Extension] Found ASCII box in message, formatting...');

            // 立即隐藏元素，防止ASCII框闪现
            const originalDisplay = element.style.display;
            element.style.opacity = '0';

            // 提取引文和正文
            const lines = text.split('\n');
            let quoteLines = [];
            let bodyLines = [];
            let inQuote = false;
            let quoteEnded = false;

            for (const line of lines) {
                if (line.includes('┌── 引用')) {
                    inQuote = true;
                    continue;
                }
                if (line.includes('└') && line.includes('──')) {
                    inQuote = false;
                    quoteEnded = true;
                    continue;
                }
                if (inQuote) {
                    // 移除左侧的 │ 符号
                    const cleanLine = line.replace(/^│\s*/, '');
                    quoteLines.push(cleanLine);
                } else if (quoteEnded) {
                    // 移除 💬 前缀
                    const cleanLine = line.replace(/^💬\s*/, '').trim();
                    if (cleanLine) {
                        bodyLines.push(cleanLine);
                    }
                }
            }

            const quoteText = quoteLines.filter(line => line.trim().length > 0).join('\n').trim();
            const bodyText = bodyLines.join('\n').trim();

            if (quoteText && bodyText) {
                formatQuoteAndBody(element, quoteText, bodyText);
                element.dataset.formatted = 'true';
                // 格式化完成后恢复显示
                element.style.opacity = '1';
            } else {
                // 如果解析失败，恢复显示
                element.style.opacity = '1';
            }
        }
    });
}

function formatQuoteAndBody(element, quoteText, bodyText) {
    // 如果传入的是包含标记的完整文本（旧格式兼容）
    if (typeof bodyText === 'undefined') {
        const text = quoteText; // 第二个参数实际上是完整文本
        const quoteMatch = text.match(/\[QUOTE\]([\s\S]*?)\[\/QUOTE\]/);
        const bodyMatch = text.match(/\[BODY\]([\s\S]*?)\[\/BODY\]/);

        if (!quoteMatch || !bodyMatch) return;

        quoteText = quoteMatch[1].trim();
        bodyText = bodyMatch[1].trim();
    }

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin-left: auto; max-width: 50%;';

    // 引文区块：灰色文字，有色块底色
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'custom-quote-block';
    quoteDiv.style.cssText = `
        display: block;
        font-size: 14px;
        color: #808080;
        background-color: transparent;
        border-left: 3px solid #5a5a5a;
        padding: 8px 0 8px 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        margin-bottom: 12px;
    `;

    const quoteContent = document.createElement('div');
    quoteContent.textContent = quoteText;
    quoteContent.style.whiteSpace = "pre-wrap";
    quoteDiv.appendChild(quoteContent);

    // 正文区块：白色文字，正常大小
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'custom-body-block';
    bodyDiv.style.cssText = `
        background: #282A2C;
        color: #e8eaed;
        padding: 12px 16px;
        border-radius: 20px 4px 20px 20px;
        font-size: 16px;
        line-height: 1.5;
        white-space: pre-wrap;
        display: inline-block;
        max-width: fit-content;
        margin-left: auto;
    `;
    bodyDiv.innerText = bodyText;

    wrapper.appendChild(quoteDiv);
    wrapper.appendChild(bodyDiv);

    element.innerHTML = '';
    element.appendChild(wrapper);

    console.log('[Quote Extension] Formatted quote and body successfully');
}

// 启动监听
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeChatMessages);
} else {
    observeChatMessages();
}
