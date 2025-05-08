// src/background/background.js - Фоновый скрипт для межтабовой коммуникации

/**
 * Фоновый скрипт расширения PerplexiTransfer
 * Обрабатывает межтабовую коммуникацию и события жизненного цикла
 */

// Прослушивание сообщений от content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Получено сообщение:', message);
  
  // Обработка запроса на открытие нового чата с контекстом
  if (message.action === 'openNewChat') {
    openNewPerplexityChat(message.context, message.source);
    sendResponse({ success: true });
  }
  
  // Обработка запроса на сохранение диалога
  if (message.action === 'saveDialog') {
    storeDialogData(message.dialogData);
    sendResponse({ success: true });
  }
  
  // Получение сохраненного диалога
  if (message.action === 'getStoredDialog') {
    chrome.storage.local.get(['storedDialog'], (result) => {
      sendResponse({ data: result.storedDialog || null });
    });
    return true; // Для асинхронного sendResponse
  }
  
  // Обработка запроса на получение настроек
  if (message.action === 'getSettings') {
    getSettings().then(settings => {
      sendResponse({ settings });
    });
    return true; // Для асинхронного sendResponse
  }
});

/**
 * Открывает новый чат Perplexity с предоставленным контекстом
 * @param {string} context - Контекст для нового чата
 * @param {string} sourceTabId - ID исходной вкладки
 */
function openNewPerplexityChat(context, sourceTabId) {
  // Открываем новую вкладку с Perplexity
  chrome.tabs.create({ url: 'https://www.perplexity.ai/' }, (newTab) => {
    // Сохраняем контекст в локальное хранилище для доступа в новой вкладке
    chrome.storage.local.set({
      pendingContext: {
        text: context,
        sourceTabId: sourceTabId,
        targetTabId: newTab.id,
        timestamp: Date.now()
      }
    });
  });
}

/**
 * Сохраняет данные диалога для повторного использования
 * @param {Object} dialogData - Данные диалога в формате JSON
 */
function storeDialogData(dialogData) {
  chrome.storage.local.set({ storedDialog: dialogData }, () => {
    console.log('Диалог сохранен в локальном хранилище');
  });
}

/**
 * Получает настройки расширения
 * @returns {Promise<Object>} Настройки расширения
 */
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      // Настройки по умолчанию
      autoExpandCodeBlocks: true,
      enableDarkTheme: false,
      defaultExportFormat: 'json',
      buttonPosition: 'right',
      autoSaveHistory: true,
      maxHistoryItems: 20
    }, (settings) => {
      resolve(settings);
    });
  });
}

// Обработка установки расширения
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Инициализация настроек по умолчанию
    chrome.storage.sync.set({
      autoExpandCodeBlocks: true,
      enableDarkTheme: false,
      defaultExportFormat: 'json',
      buttonPosition: 'right',
      autoSaveHistory: true,
      maxHistoryItems: 20
    });
    
    // Открываем страницу с инструкциями после установки
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/options/welcome.html')
    });
  }
});
