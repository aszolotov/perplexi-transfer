// src/content/memory-panel.js

/**
 * Класс для создания и управления панелью памяти
 */
class MemoryPanel {
  /**
   * Создает панель памяти
   * @returns {HTMLElement} DOM-элемент панели
   */
  static create() {
    // Создаем основной контейнер
    const panel = document.createElement('div');
    panel.id = 'pt-memory-panel';
    panel.className = 'pt-memory-panel';
    panel.style = `
      position: fixed;
      right: 0;
      top: 20%;
      width: 300px;
      height: 60%;
      background: white;
      border-radius: 8px 0 0 8px;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
      transform: translateX(290px);
    `;
    
    // Создаем заголовок панели
    const header = document.createElement('div');
    header.className = 'pt-memory-header';
    header.style = `
      padding: 12px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'База знаний';
    title.style = `
      margin: 0;
      font-size: 16px;
      color: #333;
    `;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '&lt;';
    toggleBtn.className = 'pt-toggle-btn';
    toggleBtn.style = `
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
    `;
    toggleBtn.onclick = () => this.togglePanel(panel);
    
    header.appendChild(title);
    header.appendChild(toggleBtn);
    
    // Создаем панель фильтров
    const filters = document.createElement('div');
    filters.className = 'pt-memory-filters';
    filters.style = `
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
    `;
    
    const categorySelector = document.createElement('select');
    categorySelector.id = 'pt-category-filter';
    categorySelector.style = `
      width: 100%;
      padding: 6px 8px;
      margin-bottom: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    `;
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Все категории';
    categorySelector.appendChild(defaultOption);
    
    categorySelector.onchange = () => this.refreshMemoryList();
    
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.id = 'pt-memory-search';
    searchBox.placeholder = 'Поиск...';
    searchBox.style = `
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    `;
    
    searchBox.oninput = () => this.refreshMemoryList();
    
    filters.appendChild(categorySelector);
    filters.appendChild(searchBox);
    
    // Создаем контейнер для списка элементов памяти
    const listContainer = document.createElement('div');
    listContainer.id = 'pt-memory-list';
    listContainer.style = `
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    `;
    
    // Создаем футер с кнопками
    const footer = document.createElement('div');
    footer.className = 'pt-memory-footer';
    footer.style = `
      padding: 12px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: space-between;
    `;
    
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Добавить';
    addBtn.className = 'pt-btn pt-btn-primary';
    addBtn.style = `
      padding: 8px 12px;
      background: #613bdb;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    addBtn.onclick = () => this.showAddMemoryForm();
    
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Экспорт';
    exportBtn.className = 'pt-btn';
    exportBtn.style = `
      padding: 8px 12px;
      background: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    exportBtn.onclick = () => this.exportMemories();
    
    footer.appendChild(addBtn);
    footer.appendChild(exportBtn);
    
    // Собираем панель
    panel.appendChild(header);
    panel.appendChild(filters);
    panel.appendChild(listContainer);
    panel.appendChild(footer);
    
    return panel;
  }
  
  /**
   * Переключает видимость панели
   * @param {HTMLElement} panel - DOM-элемент панели
   */
  static togglePanel(panel) {
    const isOpen = panel.style.transform === 'translateX(0px)';
    
    if (isOpen) {
      panel.style.transform = 'translateX(290px)';
      panel.querySelector('.pt-toggle-btn').innerHTML = '&lt;';
    } else {
      panel.style.transform = 'translateX(0px)';
      panel.querySelector('.pt-toggle-btn').innerHTML = '&gt;';
      
      // Обновляем список при открытии
      this.refreshMemoryList();
      this.updateCategoryOptions();
    }
  }
  
  /**
   * Обновляет список элементов памяти
   */
  static async refreshMemoryList() {
    const listContainer = document.getElementById('pt-memory-list');
    if (!listContainer) return;
    
    // Очищаем список
    listContainer.innerHTML = '';
    
    // Получаем фильтры
    const categoryFilter = document.getElementById('pt-category-filter').value;
    const searchFilter = document.getElementById('pt-memory-search').value.toLowerCase();
    
    // Получаем элементы памяти
    const filters = {};
    if (categoryFilter) filters.category = categoryFilter;
    
    const memories = await MemoryStore.getMemories(filters);
    
    // Фильтруем по поисковому запросу
    const filteredMemories = searchFilter
      ? memories.filter(m => 
          m.content.toLowerCase().includes(searchFilter) ||
          m.tags.some(tag => tag.toLowerCase().includes(searchFilter))
        )
      : memories;
    
    // Создаем элементы списка
    if (filteredMemories.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'pt-empty-message';
      emptyMessage.textContent = 'Нет сохраненных элементов';
      emptyMessage.style = `
        padding: 20px;
        text-align: center;
        color: #666;
      `;
      listContainer.appendChild(emptyMessage);
      return;
    }
    
    filteredMemories.forEach(memory => {
      const item = document.createElement('div');
      item.className = 'pt-memory-item';
      item.style = `
        padding: 10px 12px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
      `;
      
      const header = document.createElement('div');
      header.className = 'pt-memory-item-header';
      header.style = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      `;
      
      const category = document.createElement('span');
      category.className = 'pt-memory-category';
      category.textContent = memory.category;
      category.style = `
        font-size: 12px;
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
        color: #666;
      `;
      
      const controls = document.createElement('div');
      controls.className = 'pt-memory-controls';
      
      const useBtn = document.createElement('button');
      useBtn.innerHTML = '&#10004;'; // Галочка
      useBtn.title = 'Использовать';
      useBtn.style = `
        background: none;
        border: none;
        cursor: pointer;
        color: #38a169;
        font-size: 14px;
        margin-right: 6px;
      `;
      useBtn.onclick = (e) => {
        e.stopPropagation();
        this.useMemory(memory);
      };
      
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '&times;'; // Крестик
      deleteBtn.title = 'Удалить';
      deleteBtn.style = `
        background: none;
        border: none;
        cursor: pointer;
        color: #e53e3e;
        font-size: 14px;
      `;
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        this.deleteMemory(memory.id);
      };
      
      controls.appendChild(useBtn);
      controls.appendChild(deleteBtn);
      
      header.appendChild(category);
      header.appendChild(controls);
      
      const content = document.createElement('div');
      content.className = 'pt-memory-content';
      content.textContent = memory.content.length > 100
        ? memory.content.substring(0, 100) + '...'
        : memory.content;
      
      const tags = document.createElement('div');
      tags.className = 'pt-memory-tags';
      tags.style = `
        margin-top: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      `;
      
      memory.tags.forEach(tag => {
        const tagElem = document.createElement('span');
        tagElem.className = 'pt-memory-tag';
        tagElem.textContent = tag;
        tagElem.style = `
          font-size: 11px;
          background: #edf2f7;
          padding: 1px 4px;
          border-radius: 3px;
          color: #4a5568;
        `;
        tags.appendChild(tagElem);
      });
      
      item.appendChild(header);
      item.appendChild(content);
      if (memory.tags.length > 0) {
        item.appendChild(tags);
      }
      
      // Обработчик клика для показа деталей
      item.onclick = () => this.showMemoryDetails(memory);
      
      listContainer.appendChild(item);
    });
  }
  
  /**
   * Обновляет опции выбора категорий
   */
  static async updateCategoryOptions() {
    const categorySelector = document.getElementById('pt-category-filter');
    if (!categorySelector) return;
    
    // Сохраняем текущее значение
    const currentValue = categorySelector.value;
    
    // Получаем все элементы памяти
    const memories = await MemoryStore.getMemories();
    
    // Извлекаем уникальные категории
    const categories = [...new Set(memories.map(m => m.category))].sort();
    
    // Очищаем селектор, оставляя только опцию "Все категории"
    while (categorySelector.options.length > 1) {
      categorySelector.remove(1);
    }
    
    // Добавляем категории
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelector.appendChild(option);
    });
    
    // Восстанавливаем выбранное значение, если оно все еще доступно
    if (categories.includes(currentValue)) {
      categorySelector.value = currentValue;
    }
  }
  
  /**
   * Показывает форму добавления новой памяти
   */
  static showAddMemoryForm() {
    // Создаем модальное окно
    const overlay = document.createElement('div');
    overlay.className = 'pt-modal-overlay';
    overlay.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const modal = document.createElement('div');
    modal.className = 'pt-modal';
    modal.style = `
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    `;
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'pt-modal-header';
    header.style = `
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Добавить в базу знаний';
    title.style = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #718096;
    `;
    closeBtn.onclick = () => overlay.remove();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Тело модального окна
    const body = document.createElement('div');
    body.className = 'pt-modal-body';
    body.style = `
      padding: 20px;
      overflow-y: auto;
    `;
    
    // Поле контента
    const contentGroup = document.createElement('div');
    contentGroup.className = 'pt-form-group';
    contentGroup.style = 'margin-bottom: 16px;';
    
    const contentLabel = document.createElement('label');
    contentLabel.htmlFor = 'pt-memory-content';
    contentLabel.textContent = 'Содержание:';
    contentLabel.style = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    `;
    
    const contentInput = document.createElement('textarea');
    contentInput.id = 'pt-memory-content';
    contentInput.rows = 5;
    contentInput.style = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    `;
    
    contentGroup.appendChild(contentLabel);
    contentGroup.appendChild(contentInput);
    
    // Поле категории
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'pt-form-group';
    categoryGroup.style = 'margin-bottom: 16px;';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.htmlFor = 'pt-memory-category';
    categoryLabel.textContent = 'Категория:';
    categoryLabel.style = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    `;
    
    const categoryInput = document.createElement('input');
    categoryInput.id = 'pt-memory-category';
    categoryInput.value = 'general';
    categoryInput.style = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    `;
    
    categoryGroup.appendChild(categoryLabel);
    categoryGroup.appendChild(categoryInput);
    
    // Поле тегов
    const tagsGroup = document.createElement('div');
    tagsGroup.className = 'pt-form-group';
    tagsGroup.style = 'margin-bottom: 16px;';
    
    const tagsLabel = document.createElement('label');
    tagsLabel.htmlFor = 'pt-memory-tags';
    tagsLabel.textContent = 'Теги (через запятую):';
    tagsLabel.style = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    `;
    
    const tagsInput = document.createElement('input');
    tagsInput.id = 'pt-memory-tags';
    tagsInput.placeholder = 'например: важное, код, документация';
    tagsInput.style = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    `;
    
    tagsGroup.appendChild(tagsLabel);
    tagsGroup.appendChild(tagsInput);
    
    // Поле приоритета
    const priorityGroup = document.createElement('div');
    priorityGroup.className = 'pt-form-group';
    
    const priorityLabel = document.createElement('label');
    priorityLabel.htmlFor = 'pt-memory-priority';
    priorityLabel.textContent = 'Приоритет:';
    priorityLabel.style = `
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
    `;
    
    const priorityInput = document.createElement('select');
    priorityInput.id = 'pt-memory-priority';
    priorityInput.style = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    `;
    
    const priorities = [
      { value: 0, text: 'Обычный' },
      { value: 1, text: 'Важный' },
      { value: 2, text: 'Критичный' }
    ];
    
    priorities.forEach(priority => {
      const option = document.createElement('option');
      option.value = priority.value;
      option.textContent = priority.text;
      priorityInput.appendChild(option);
    });
    
    priorityGroup.appendChild(priorityLabel);
    priorityGroup.appendChild(priorityInput);
    
    body.appendChild(contentGroup);
    body.appendChild(categoryGroup);
    body.appendChild(tagsGroup);
    body.appendChild(priorityGroup);
    
    // Футер с кнопками
    const footer = document.createElement('div');
    footer.className = 'pt-modal-footer';
    footer.style = `
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.className = 'pt-btn';
    cancelBtn.style = `
      padding: 8px 16px;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    cancelBtn.onclick = () => overlay.remove();
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Сохранить';
    saveBtn.className = 'pt-btn pt-btn-primary';
    saveBtn.style = `
      padding: 8px 16px;
      background: #613bdb;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    saveBtn.onclick = async () => {
      const content = contentInput.value.trim();
      const category = categoryInput.value.trim();
      const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      const priority = parseInt(priorityInput.value);
      
      if (!content) {
        alert('Пожалуйста, введите содержание');
        return;
      }
      
      try {
        await MemoryStore.saveMemory({
          content,
          category,
          tags,
          priority,
          source: 'manual'
        });
        
        overlay.remove();
        this.refreshMemoryList();
        this.updateCategoryOptions();
        
        UIComponents.showNotification('Элемент добавлен в базу знаний', 'success');
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert('Не удалось сохранить: ' + error.message);
      }
    };
    
    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);
    
    // Собираем модальное окно
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    
    // Добавляем на страницу
    document.body.appendChild(overlay);
    
    // Фокус на поле ввода
    contentInput.focus();
  }
  
  /**
   * Показывает детали элемента памяти
   * @param {Object} memory - Объект памяти
   */
  static showMemoryDetails(memory) {
    // Реализация показа деталей (аналогично форме добавления)
    // ...
  }
  
  /**
   * Использует элемент памяти в текущем диалоге
   * @param {Object} memory - Объект памяти
   */
  static async useMemory(memory) {
    try {
      // Находим поле ввода на странице Perplexity
      const inputField = document.querySelector('textarea[placeholder*="Ask"]') || 
                         document.querySelector('textarea[placeholder*="Спросите"]');
      
      if (inputField) {
        // Обновляем счетчик использования
        await MemoryStore.updateUseCount(memory.id);
        
        // Подготавливаем контент для вставки
        let currentValue = inputField.value;
        
        // Если поле не пустое и не заканчивается пробелом, добавляем пробел
        if (currentValue && !currentValue.endsWith(' ')) {
          currentValue += ' ';
        }
        
        // Добавляем содержимое памяти
        inputField.value = currentValue + memory.content;
        
        // Генерируем событие ввода для активации кнопки отправки
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Устанавливаем фокус в конец текста
        inputField.focus();
        inputField.setSelectionRange(inputField.value.length, inputField.value.length);
        
        // Уведомляем пользователя
        UIComponents.showNotification('Контент добавлен в поле ввода', 'success');
      } else {
        UIComponents.showNotification('Не удалось найти поле ввода', 'error');
      }
    } catch (error) {
      console.error('Ошибка при использовании памяти:', error);
      UIComponents.showNotification('Произошла ошибка', 'error');
    }
  }
  
  /**
   * Удаляет элемент памяти
   * @param {string} id - ID элемента памяти
   */
  static async deleteMemory(id) {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      try {
        await MemoryStore.deleteMemory(id);
        this.refreshMemoryList();
        this.updateCategoryOptions();
        
        UIComponents.showNotification('Элемент удален', 'success');
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        UIComponents.showNotification('Ошибка при удалении', 'error');
      }
    }
  }
  
  /**
   * Экспортирует все элементы памяти
   */
  static async exportMemories() {
    try {
      const memories = await MemoryStore.getMemories();
      
      // Создаем JSON для экспорта
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        memories: memories
      };
      
      // Создаем blob с данными
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Создаем ссылку для скачивания
      const a = document.createElement('a');
      a.href = url;
      a.download = `perplexi-memories-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      // Освобождаем URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      UIComponents.showNotification('Экспорт завершен', 'success');
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      UIComponents.showNotification('Ошибка при экспорте', 'error');
    }
  }
}

window.MemoryPanel = MemoryPanel;
