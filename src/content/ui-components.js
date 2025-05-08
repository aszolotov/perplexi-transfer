// src/content/ui-components.js - Модуль UI-компонентов для расширения PerplexiTransfer

/**
 * Класс для создания и управления интерфейсными элементами расширения
 */
class UIComponents {
  /**
   * Создает плавающую панель с кнопками
   * @returns {HTMLElement} DOM-элемент панели
   */
  static createFloatingPanel() {
    const panel = document.createElement('div');
    panel.id = 'perplexi-transfer-panel';
    panel.style = `
      position: fixed;
      top: 20vh;
      right: 0;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px 0 0 8px;
      box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    `;
    
    // Добавляем кнопку свертывания/развертывания
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '&lt;&lt;';
    toggleBtn.title = 'Свернуть/развернуть панель';
    toggleBtn.className = 'pt-toggle-btn';
    toggleBtn.onclick = () => this.togglePanel(panel);
    
    panel.appendChild(toggleBtn);
    
    return panel;
  }
  
  /**
   * Переключает видимость панели
   * @param {HTMLElement} panel - DOM-элемент панели
   */
  static togglePanel(panel) {
    if (panel.dataset.collapsed === 'true') {
      panel.style.transform = 'translateX(0)';
      panel.dataset.collapsed = 'false';
      panel.querySelector('.pt-toggle-btn').innerHTML = '&lt;&lt;';
    } else {
      panel.style.transform = 'translateX(calc(100% - 30px))';
      panel.dataset.collapsed = 'true';
      panel.querySelector('.pt-toggle-btn').innerHTML = '&gt;&gt;';
    }
  }
  
  /**
   * Создает кнопку действия
   * @param {string} id - Идентификатор кнопки
   * @param {string} text - Текст кнопки
   * @param {string} color - Цвет кнопки (HEX или имя)
   * @param {Function} onClick - Обработчик клика
   * @param {string} title - Подсказка при наведении
   * @returns {HTMLElement} DOM-элемент кнопки
   */
  static createActionButton(id, text, color, onClick, title = '') {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    button.title = title;
    button.className = 'pt-action-btn';
    button.style = `
      padding: 10px 15px;
      background: ${color};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 180px;
      text-align: center;
    `;
    
    button.onmouseenter = () => {
      button.style.opacity = '0.9';
      button.style.transform = 'translateY(-2px)';
    };
    
    button.onmouseleave = () => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
    };
    
    button.onclick = onClick;
    return button;
  }
  
  /**
   * Создает уведомление
   * @param {string} message - Текст уведомления
   * @param {string} type - Тип уведомления (success, error, info)
   * @param {number} duration - Длительность показа в мс
   */
  static showNotification(message, type = 'info', duration = 3000) {
    // Удаляем предыдущее уведомление, если есть
    const existingNotification = document.getElementById('pt-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const colors = {
      success: '#38a169',
      error: '#e53e3e',
      info: '#3182ce',
      warning: '#dd6b20'
    };
    
    const notification = document.createElement('div');
    notification.id = 'pt-notification';
    notification.textContent = message;
    notification.style = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${colors[type] || colors.info};
      color: white;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s forwards;
    `;
    
    // Добавляем CSS анимацию
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Автоматически скрываем уведомление через указанное время
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  /**
   * Создает модальное окно с содержимым
   * @param {string} title - Заголовок окна
   * @param {HTMLElement|string} content - Содержимое (HTML или строка)
   * @param {Array} actions - Массив кнопок действий
   * @returns {HTMLElement} DOM-элемент модального окна
   */
  static createModal(title, content, actions = []) {
    // Создаем затемнение
    const overlay = document.createElement('div');
    overlay.className = 'pt-modal-overlay';
    overlay.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'pt-modal';
    modal.style = `
      background: white;
      border-radius: 8px;
      width: 80%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    `;
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.className = 'pt-modal-header';
    header.style = `
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #718096;
      transition: color 0.2s;
    `;
    closeButton.onmouseenter = () => closeButton.style.color = '#1a202c';
    closeButton.onmouseleave = () => closeButton.style.color = '#718096';
    closeButton.onclick = () => overlay.remove();
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // Создаем содержимое
    const body = document.createElement('div');
    body.className = 'pt-modal-body';
    body.style = `
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    `;
    
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    
    // Создаем футер с кнопками действий
    const footer = document.createElement('div');
    footer.className = 'pt-modal-footer';
    footer.style = `
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.textContent = action.text;
      button.style = `
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
        ${action.primary ? 
          'background: #4299e1; color: white; border: none;' : 
          'background: #e2e8f0; color: #4a5568; border: none;'
        }
      `;
      button.onclick = () => {
        action.onClick();
        if (action.closeModal) {
          overlay.remove();
        }
      };
      footer.appendChild(button);
    });
    
    // Собираем модальное окно
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    
    // Добавляем на страницу
    document.body.appendChild(overlay);
    
    // Предотвращаем закрытие по клику на модальном окне
    modal.onclick = e => e.stopPropagation();
    
    // Закрываем по клику на затемнении
    overlay.onclick = e => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };
    
    return overlay;
  }
}

// Экспортируем класс для использования в других модулях
window.UIComponents = UIComponents;
