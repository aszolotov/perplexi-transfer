// src/content/command-handler.js

/**
 * Модуль для обработки команд в тексте запроса
 */
class CommandHandler {
  // Префикс для команд
  static commandPrefix = '/';
  
  // Список доступных команд
  static commands = {
    'save': {
      description: 'Сохраняет информацию в базу знаний',
      handler: (params) => CommandHandler.handleSaveCommand(params)
    },
    'remember': {
      description: 'Сохраняет информацию в базу знаний (синоним save)',
      handler: (params) => CommandHandler.handleSaveCommand(params)
    },
    'category': {
      description: 'Устанавливает категорию для следующей команды save',
      handler: (params) => CommandHandler.handleCategoryCommand(params)
    },
    'help': {
      description: 'Показывает список доступных команд',
      handler: () => CommandHandler.handleHelpCommand()
    }
  };
  
  // Временное хранилище для параметров команд
  static tempParams = {
    category: 'general'
  };
  
  /**
   * Инициализирует обработчик команд
   */
  static init() {
    // Находим поле ввода на странице Perplexity
    const inputFields = document.querySelectorAll('textarea');
    
    inputFields.forEach(field => {
      // Проверяем, что это поле ввода для запросов
      if (field.placeholder && (field.placeholder.includes('Ask') || field.placeholder.includes('Спросите'))) {
        // Добавляем обработчик ввода
        field.addEventListener('input', (e) => {
          this.processInputField(e.target);
        });
        
        // Добавляем обработчик клавиш
        field.addEventListener('keydown', (e) => {
          // Проверяем, если нажат Enter без Shift и есть команда в поле
          if (e.key === 'Enter' && !e.shiftKey && this.hasCommand(e.target.value)) {
            e.preventDefault(); // Предотвращаем отправку формы
            this.executeCommand(e.target);
          }
        });
      }
    });
  }
  
  /**
   * Проверяет, содержит ли текст команду
   * @param {string} text - Текст для проверки
   * @returns {boolean} Содержит ли текст команду
   */
  static hasCommand(text) {
    if (!text) return false;
    
    const commandRegex = new RegExp(`^\\s*${this.escapeRegExp(this.commandPrefix)}([a-zA-Z]+)\\s*`, 'i');
    return commandRegex.test(text);
  }
  
  /**
   * Обрабатывает поле ввода для проверки наличия команд
   * @param {HTMLElement} inputField - Поле ввода
   */
  static processInputField(inputField) {
    // Реализация подсветки команд или автодополнения может быть добавлена здесь
  }
  
  /**
   * Выполняет команду из поля ввода
   * @param {HTMLElement} inputField - Поле ввода с командой
   */
  static executeCommand(inputField) {
    const text = inputField.value.trim();
    
    // Извлекаем имя команды
    const commandRegex = new RegExp(`^\\s*${this.escapeRegExp(this.commandPrefix)}([a-zA-Z]+)(\\s+(.*))?$`, 'i');
    const match = text.match(commandRegex);
    
    if (!match) return;
    
    const commandName = match[1].toLowerCase();
    const params = match[3] || '';
    
    // Проверяем, существует ли такая команда
    if (this.commands[commandName]) {
      // Выполняем обработчик команды
      this.commands[commandName].handler(params);
      
      // Очищаем поле ввода после выполнения команды
      inputField.value = '';
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      UIComponents.showNotification(`Неизвестная команда: ${commandName}`, 'error');
    }
  }
  
  /**
   * Обработчик команды save/remember
   * @param {string} params - Параметры команды
   */
  static async handleSaveCommand(params) {
    if (!params.trim()) {
      UIComponents.showNotification('Пожалуйста, укажите текст для сохранения', 'error');
      return;
    }
    
    try {
      // Проверяем наличие тегов в формате #тег1 #тег2
      const tagRegex = /#([a-zA-Zа-яА-Я0-9_]+)/g;
      const tags = [];
      let contentWithoutTags = params;
      
      let match;
      while ((match = tagRegex.exec(params)) !== null) {
        tags.push(match[1]);
        contentWithoutTags = contentWithoutTags.replace(match[0], '');
      }
      
      // Сохраняем в базу знаний
      await MemoryStore.saveMemory({
        content: contentWithoutTags.trim(),
        category: this.tempParams.category,
        tags: tags,
        source: 'command'
      });
      
      // Сбрасываем временную категорию на значение по умолчанию
      this.tempParams.category = 'general';
      
      UIComponents.showNotification('Добавлено в базу знаний', 'success');
      
      // Обновляем список, если панель открыта
      const panel = document.getElementById('pt-memory-panel');
      if (panel && panel.style.transform === 'translateX(0px)') {
        MemoryPanel.refreshMemoryList();
        MemoryPanel.updateCategoryOptions();
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      UIComponents.showNotification('Ошибка при сохранении в базу знаний', 'error');
    }
  }
  
  /**
   * Обработчик команды category
   * @param {string} params - Параметры команды
   */
  static handleCategoryCommand(params) {
    if (!params.trim()) {
      UIComponents.showNotification('Пожалуйста, укажите категорию', 'error');
      return;
    }
    
    this.tempParams.category = params.trim();
    UIComponents.showNotification(`Категория установлена: ${params.trim()}`, 'success');
  }
  
  /**
   * Обработчик команды help
   */
  static handleHelpCommand() {
    let helpText = 'Доступные команды:\n\n';
    
    Object.keys(this.commands).forEach(cmd => {
      helpText += `${this.commandPrefix}${cmd} - ${this.commands[cmd].description}\n`;
    });
    
    helpText += '\nПример: /save Важная информация #важное #код';
    
    // Показываем модальное окно с помощью
    UIComponents.createModal('Справка по командам', helpText, [
      { text: 'Закрыть', primary: false, closeModal: true, onClick: () => {} }
    ]);
  }
  
  /**
   * Экранирует специальные символы в строке для регулярного выражения
   * @param {string} string - Строка для экранирования
   * @returns {string} Экранированная строка
   */
  static escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

window.CommandHandler = CommandHandler;
