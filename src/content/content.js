// src/content/content.js - Основной модуль контента

/**
 * Инициализация расширения
 */
function initializeExtension() {
  console.log('PerplexiTransfer extension initialized with Memory Module');
  
  // Инициализация компонентов памяти
  initializeMemoryComponents();
  
  // Инициализация существующих компонентов
  initializeUIComponents();
}

/**
 * Инициализирует компоненты памяти
 */
function initializeMemoryComponents() {
  // Создаем и добавляем панель памяти
  const memoryPanel = MemoryPanel.create();
  document.body.appendChild(memoryPanel);
  
  // Инициализируем обработчик команд
  CommandHandler.init();
  
  // Инициализируем контекстный улучшатель
  ContextEnhancer.init();
}

/**
 * Инициализирует компоненты UI
 */
function initializeUIComponents() {
  // Создаем плавающую панель
  const panel = UIComponents.createFloatingPanel();
  
  // Добавляем кнопки действий
  const copyTextButton = UIComponents.createActionButton(
    'pt-copy-text-btn',
    'Копировать текст',
    '#613bdb',
    copyFullDialog,
    'Копировать весь диалог в текстовом формате'
  );
  
  const copyJsonButton = UIComponents.createActionButton(
    'pt-copy-json-btn',
    'Копировать как JSON',
    '#38a169',
    copyDialogAsJSON,
    'Копировать диалог в формате JSON с метаданными'
  );
  
  // Добавляем кнопки на панель
  panel.appendChild(copyTextButton);
  panel.appendChild(copyJsonButton);
  
  // Добавляем панель в документ
  document.body.appendChild(panel);
}

// Остальной код (функции copyFullDialog, copyDialogAsJSON и т.д.) остается без изменений

// Слушаем события загрузки страницы
document.addEventListener('DOMContentLoaded', initializeExtension);

// Альтернативный подход для случаев, когда страница уже загружена
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeExtension, 1000);
}
