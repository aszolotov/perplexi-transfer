// src/background/background.js - Фоновый скрипт для обработки межтабовых и общих событий

/**
 * Обработчик установки расширения
 */
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // Первая установка
    chrome.storage.local.set({
      'settings': {
        defaultFormat: 'json',
        darkMode: false,
        compactMode: false,
        hotkeys: {
          copyText: 'Ctrl+Shift+C',
          copyJson: 'Ctrl+Shift+J',
          continueChat: 'Ctrl+Shift+N'
        }
      },
      'dialogHistory': []
    });
    
    // Открываем страницу руководства
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/welcome/welcome.html')
    });
  } else if (details.reason === 'update') {
    // Обновление расширения
    // Здесь можно добавить логику миграции настроек, если нужно
  }
});

/**
 * Обработчик сообщений от контент-скриптов и других частей расширения
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'continueInNewTab') {
    // Логика для открытия нового таба и продолжения диалога
    chrome.tabs.create({ url: 'https://www.perplexity.ai/' }, newTab => {
      // Сохраняем ID таба для последующей передачи данных
      chrome.storage.local.set({ 'targetTabId': newTab.id });
    });
    
    return true; // Важно для асинхронных ответов
  }
  
  if (message.action === 'checkForContinueData') {
    // Проверка, есть ли данные для продолжения диалога
    chrome.storage.local.get(['continueData', 'targetTabId'], data => {
      if (data.continueData && sender.tab.id === data.targetTabId) {
        // Отправляем данные в контент-скрипт
        sendResponse({ 
          status: 'success',
          data: data.continueData
        });
        
        // Очищаем данные после использования
        chrome.storage.local.remove(['continueData', 'targetTabId']);
      } else {
        sendResponse({ status: 'noData' });
      }
    });
    
    return true; // Важно для асинхронных ответов
  }
});

/**
 * Обработчик нажатия на иконку расширения
 */
chrome.action.onClicked.addListener(tab => {
  // Проверяем, что мы на странице Perplexity
  if (tab.url.includes('perplexity.ai')) {
    // Отправляем сообщение для открытия панели управления
    chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
  } else {
    // Если не на Perplexity, открываем новую вкладку
    chrome.tabs.create({ url: 'https://www.perplexity.ai/' });
  }
});

/**
 * Обработчик создания нового таба
 */
chrome.tabs.onCreated.addListener(tab => {
  // Логика для нового таба, если нужно
});

/**
 * Обработчик активации таба
 */
chrome.tabs.onActivated.addListener(activeInfo => {
  // Обновляем состояние расширения для активного таба
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url && tab.url.includes('perplexity.ai')) {
      chrome.action.setIcon({
        path: {
          "16": "assets/icons/icon16.png",
          "48": "assets/icons/icon48.png",
          "128": "assets/icons/icon128.png"
        },
        tabId: tab.id
      });
    } else {
      chrome.action.setIcon({
        path: {
          "16": "assets/icons/icon16-disabled.png",
          "48": "assets/icons/icon48-disabled.png",
          "128": "assets/icons/icon128-disabled.png"
        },
        tabId: tab.id
      });
    }
  });
});
