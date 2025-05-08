// src/content/context-enhancer.js

/**
 * Модуль для улучшения запросов с использованием контекстной памяти
 */
class ContextEnhancer {
  // Флаг, указывающий, включена ли функция автоматического добавления контекста
  static isEnabled = true;
  
  /**
   * Инициализирует модуль
   */
  static init() {
    // Находим форму отправки запроса
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Добавляем обработчик отправки формы
      form.addEventListener('submit', async (e) => {
        if (this.isEnabled) {
          // Предотвращаем отправку формы
          e.preventDefault();
          
          // Улучшаем запрос с помощью контекстной памяти
          await this.enhanceQuery(form);
          
          // Продолжаем отправку формы
          form.submit();
        }
      });
    });
    
    // Добавляем переключатель в интерфейс
    this.addToggleButton();
  }
  
  /**
   * Улучшает запрос с помощью контекстной памяти
   * @param {HTMLElement} form - Форма с запросом
   */
  static async enhanceQuery(form) {
    // Находим поле ввода
    const inputField = form.querySelector('textarea');
    if (!inputField) return;
    
    const query = inputField.value.trim();
    
    // Если это команда, не добавляем контекст
    if (CommandHandler.hasCommand(query)) return;
    
    try {
      // Получаем релевантные элементы памяти
      const relevantMemories = await MemoryStore.getRelevantMemories(query, 3);
      
      if (relevantMemories.length === 0) return;
      
      // Создаем контекстное дополнение
      let contextAddition = 'Используй следующую важную информацию для ответа:\n\n';
      
      relevantMemories.forEach(memory => {
        contextAddition += `- ${memory.content}\n`;
        
        // Обновляем счетчик использования
        MemoryStore.updateUseCount(memory.id);
      });
      
      contextAddition += '\nТеперь ответь на мой вопрос:';
      
      // Добавляем контекст к запросу
      inputField.value = contextAddition + '\n\n' + query;
      
      // Показываем уведомление о добавленном контексте
      UIComponents.showNotification(`Добавлено ${relevantMemories.length} элементов контекста`, 'info');
    } catch (error) {
      console.error('Ошибка при добавлении контекста:', error);
      // Не показываем ошибку пользователю, чтобы не мешать отправке запроса
    }
  }
  
  /**
   * Добавляет кнопку переключения контекстной памяти
   */
  static addToggleButton() {
    const button = document.createElement('button');
    button.id = 'pt-context-toggle';
    button.title = 'Включить/выключить автоматический контекст';
    button.innerHTML = '🧠';
    button.style = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${this.isEnabled ? '#613bdb' : '#f0f0f0'};
      color: ${this.isEnabled ? 'white' : '#666'};
      border: none;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    `;
    
    button.onclick = () => {
      this.isEnabled = !this.isEnabled;
      button.style.background = this.isEnabled ? '#613bdb' : '#f0f0f0';
      button.style.color = this.isEnabled ? 'white' : '#666';
      
      UIComponents.showNotification(
        this.isEnabled ? 'Автоматический контекст включен' : 'Автоматический контекст отключен',
        this.isEnabled ? 'success' : 'info'
      );
      
      // Сохраняем настройку
      chrome.storage.sync.set({ contextEnhancerEnabled: this.isEnabled });
    };
    
    document.body.appendChild(button);
    
    // Загружаем сохраненную настройку
    chrome.storage.sync.get(['contextEnhancerEnabled'], (result) => {
      if (result.contextEnhancerEnabled !== undefined) {
        this.isEnabled = result.contextEnhancerEnabled;
        button.style.background = this.isEnabled ? '#613bdb' : '#f0f0f0';
        button.style.color = this.isEnabled ? 'white' : '#666';
      }
    });
  }
}

window.ContextEnhancer = ContextEnhancer;
