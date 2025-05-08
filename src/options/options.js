// src/options/options.js - Скрипт для управления настройками расширения

/**
 * Инициализирует страницу настроек
 */
function initOptions() {
  // Загружаем текущие настройки
  loadSettings();
  
  // Настраиваем обработчики событий
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  document.getElementById('resetButton').addEventListener('click', resetSettings);
}

/**
 * Загружает сохраненные настройки из хранилища
 */
function loadSettings() {
  chrome.storage.sync.get({
    // Настройки по умолчанию
    autoExpandCodeBlocks: true,
    enableDarkTheme: false,
    defaultExportFormat: 'json',
    buttonPosition: 'right',
    autoSaveHistory: true,
    maxHistoryItems: 20
  }, (settings) => {
    // Устанавливаем значения полей формы
    document.getElementById('autoExpandCodeBlocks').checked = settings.autoExpandCodeBlocks;
    document.getElementById('enableDarkTheme').checked = settings.enableDarkTheme;
    document.getElementById('defaultExportFormat').value = settings.defaultExportFormat;
    document.getElementById('buttonPosition').value = settings.buttonPosition;
    document.getElementById('autoSaveHistory').checked = settings.autoSaveHistory;
    document.getElementById('maxHistoryItems').value = settings.maxHistoryItems;
  });
}

/**
 * Сохраняет настройки в хранилище
 */
function saveSettings() {
  const settings = {
    autoExpandCodeBlocks: document.getElementById('autoExpandCodeBlocks').checked,
    enableDarkTheme: document.getElementById('enableDarkTheme').checked,
    defaultExportFormat: document.getElementById('defaultExportFormat').value,
    buttonPosition: document.getElementById('buttonPosition').value,
    autoSaveHistory: document.getElementById('autoSaveHistory').checked,
    maxHistoryItems: parseInt(document.getElementById('maxHistoryItems').value, 10) || 20
  };
  
  chrome.storage.sync.set(settings, () => {
    // Показываем сообщение об успешном сохранении
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = 'Настройки сохранены!';
    statusMessage.style.display = 'block';
    
    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  });
}

/**
 * Сбрасывает настройки на значения по умолчанию
 */
function resetSettings() {
  if (confirm('Вы уверены, что хотите сбросить все настройки на значения по умолчанию?')) {
    const defaultSettings = {
      autoExpandCodeBlocks: true,
      enableDarkTheme: false,
      defaultExportFormat: 'json',
      buttonPosition: 'right',
      autoSaveHistory: true,
      maxHistoryItems: 20
    };
    
    chrome.storage.sync.set(defaultSettings, () => {
      loadSettings(); // Перезагружаем настройки на странице
      
      // Показываем сообщение о сбросе
      const statusMessage = document.getElementById('statusMessage');
      statusMessage.textContent = 'Настройки сброшены на значения по умолчанию!';
      statusMessage.style.display = 'block';
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 3000);
    });
  }
}

// Инициализируем страницу настроек при загрузке
document.addEventListener('DOMContentLoaded', initOptions);
