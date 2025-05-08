// src/content/ui-components.js - Модуль UI-компонентов для расширения

/**
 * Класс для создания и управления интерфейсными элементами
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
    toggleBtn.style = `
      align-self: flex-end;
      background: #f0f0f0;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 5px;
      padding: 0;
    `;
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
}

// Экспортируем класс для использования в других модулях
window.UIComponents = UIComponents;
