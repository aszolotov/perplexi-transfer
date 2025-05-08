// src/utils/memory-store.js

/**
 * Модуль для работы с локальным хранилищем долгосрочной памяти
 */
class MemoryStore {
  /**
   * Структура данных для хранения:
   * - memories: массив объектов памяти
   * - metadata: метаданные о памяти (последнее обновление, счетчики и т.д.)
   */
  
  /**
   * Сохраняет новый элемент памяти
   * @param {Object} memory - Объект памяти для сохранения
   * @returns {Promise} Promise с результатом операции
   */
  static async saveMemory(memory) {
    // Валидация входных данных
    if (!memory.content) {
      return Promise.reject(new Error('Память должна содержать контент'));
    }
    
    // Подготавливаем объект памяти
    const memoryItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      content: memory.content,
      category: memory.category || 'general',
      tags: memory.tags || [],
      source: memory.source || 'manual',
      context: memory.context || '',
      created: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      accessCount: 0,
      useCount: 0,
      priority: memory.priority || 0,
      isActive: true
    };
    
    // Получаем существующие данные
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['memories'], (result) => {
        const memories = result.memories || [];
        memories.push(memoryItem);
        
        // Сохраняем обновленные данные
        chrome.storage.local.set({ memories }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(memoryItem);
        });
      });
    });
  }
  
  /**
   * Получает все элементы памяти
   * @param {Object} filters - Фильтры для выборки
   * @returns {Promise} Promise с массивом объектов памяти
   */
  static async getMemories(filters = {}) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['memories'], (result) => {
        let memories = result.memories || [];
        
        // Применяем фильтры
        if (filters.category) {
          memories = memories.filter(m => m.category === filters.category);
        }
        
        if (filters.tags && filters.tags.length > 0) {
          memories = memories.filter(m => 
            filters.tags.some(tag => m.tags.includes(tag))
          );
        }
        
        if (filters.active !== undefined) {
          memories = memories.filter(m => m.isActive === filters.active);
        }
        
        // Сортировка (по умолчанию по приоритету и дате создания)
        memories.sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(b.created) - new Date(a.created);
        });
        
        resolve(memories);
      });
    });
  }
  
  /**
   * Получает релевантную память на основе запроса
   * @param {string} query - Запрос для поиска релевантной информации
   * @param {number} limit - Максимальное количество элементов
   * @returns {Promise} Promise с массивом релевантных объектов памяти
   */
  static async getRelevantMemories(query, limit = 5) {
    // Получаем все активные элементы памяти
    const allMemories = await this.getMemories({ active: true });
    
    // Простой алгоритм определения релевантности на основе ключевых слов
    // В будущих версиях можно заменить на векторное сравнение или другие методы
    const scoredMemories = allMemories.map(memory => {
      const words = query.toLowerCase().split(/\s+/);
      let score = 0;
      
      // Проверяем совпадение слов
      words.forEach(word => {
        if (word.length < 3) return; // Игнорируем короткие слова
        
        if (memory.content.toLowerCase().includes(word)) {
          score += 3;
        }
        
        memory.tags.forEach(tag => {
          if (tag.toLowerCase().includes(word)) {
            score += 5;
          }
        });
        
        if (memory.category.toLowerCase().includes(word)) {
          score += 4;
        }
      });
      
      // Учитываем приоритет и частоту использования
      score += memory.priority * 2;
      score += Math.min(memory.useCount / 10, 3); // Не более 3 баллов за использование
      
      return { memory, score };
    });
    
    // Сортируем по релевантности и берем limit элементов
    const relevantMemories = scoredMemories
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        // Обновляем счетчик доступа
        this.updateAccessCount(item.memory.id);
        return item.memory;
      });
    
    return relevantMemories;
  }
  
  /**
   * Обновляет счетчик доступа к памяти
   * @param {string} id - ID элемента памяти
   * @returns {Promise} Promise с результатом операции
   */
  static async updateAccessCount(id) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['memories'], (result) => {
        const memories = result.memories || [];
        const index = memories.findIndex(m => m.id === id);
        
        if (index !== -1) {
          memories[index].accessCount += 1;
          memories[index].lastAccessed = new Date().toISOString();
          
          chrome.storage.local.set({ memories }, () => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
    });
  }
  
  /**
   * Обновляет счетчик использования памяти
   * @param {string} id - ID элемента памяти
   * @returns {Promise} Promise с результатом операции
   */
  static async updateUseCount(id) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['memories'], (result) => {
        const memories = result.memories || [];
        const index = memories.findIndex(m => m.id === id);
        
        if (index !== -1) {
          memories[index].useCount += 1;
          
          chrome.storage.local.set({ memories }, () => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
    });
  }
  
  /**
   * Удаляет элемент памяти
   * @param {string} id - ID элемента памяти
   * @returns {Promise} Promise с результатом операции
   */
  static async deleteMemory(id) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['memories'], (result) => {
        const memories = result.memories || [];
        const newMemories = memories.filter(m => m.id !== id);
        
        chrome.storage.local.set({ memories: newMemories }, () => {
          resolve(true);
        });
      });
    });
  }
}

window.MemoryStore = MemoryStore;
