// src/content/dialog-extractor.js - Модуль извлечения диалогов из страницы Perplexity

/**
 * Класс для извлечения диалогов из Perplexity AI с поддержкой различных форматов
 */
class DialogExtractor {
  /**
   * Извлекает все вопросы и ответы из текущей страницы
   * @returns {Array} Массив объектов {question, answer}
   */
  static extractDialogPairs() {
    const questions = Array.from(document.querySelectorAll('.group\\/query'));
    const answers = Array.from(document.querySelectorAll('[id^="markdown-content-"]'));
    
    let dialogPairs = [];
    let answerIdx = 0;
    
    questions.forEach((q, index) => {
      const questionText = q.innerText.trim();
      const questionBox = q.closest('.group.relative');
      let answerElement = null;
      
      // Ищем ответ рядом с вопросом
      if (questionBox) {
        answerElement = questionBox.parentElement.querySelector('[id^="markdown-content-"]');
      }
      
      // Если не нашли, берем следующий из общего списка
      if (!answerElement && answerIdx < answers.length) {
        answerElement = answers[answerIdx++];
      }
      
      const answerText = answerElement ? answerElement.innerText.trim() : '[Ответ не найден]';
      
      dialogPairs.push({
        index: index + 1,
        question: questionText,
        answer: answerText,
        questionElement: q,
        answerElement: answerElement
      });
    });
    
    return dialogPairs;
  }
  
  /**
   * Извлекает только выбранные вопросы и ответы
   * @returns {Array|null} Массив выбранных пар или null, если ничего не выбрано
   */
  static extractSelectedDialogPairs() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;
    
    const allPairs = this.extractDialogPairs();
    const selectedPairs = allPairs.filter(pair => {
      return selection.containsNode(pair.questionElement, true) || 
             (pair.answerElement && selection.containsNode(pair.answerElement, true));
    });
    
    return selectedPairs.length > 0 ? selectedPairs : null;
  }
  
  /**
   * Создает текстовое представление диалога
   * @param {Array} dialogPairs - Пары вопрос-ответ
   * @returns {string} Форматированный текст диалога
   */
  static createTextFormat(dialogPairs) {
    if (!dialogPairs || dialogPairs.length === 0) return '';
    
    return dialogPairs.map(pair => {
      return `Вопрос:\n${pair.question}\n\nОтвет:\n${pair.answer}\n\n-----------------------------\n`;
    }).join('');
  }
  
  /**
   * Создает JSON представление диалога со структурированной информацией
   * @param {Array} dialogPairs - Пары вопрос-ответ 
   * @returns {Object} Объект JSON с диалогом и метаданными
   */
  static createJSONFormat(dialogPairs) {
    if (!dialogPairs || dialogPairs.length === 0) return {};
    
    // Извлекаем заголовок страницы и очищаем его
    const pageTitle = document.title.replace(" - Perplexity", "").trim();
    
    // Подготавливаем базовую структуру JSON
    const dialogData = {
      metadata: {
        projectName: pageTitle,
        status: "В процессе",
        lastUpdated: new Date().toISOString().split('T')[0],
        source: "Perplexity AI"
      },
      keyDecisions: [],
      technicalSpecs: {
        architecture: "",
        dataModel: "",
        interfaces: []
      },
      roadmap: [],
      technologies: [],
      codeSnippets: [],
      currentIssues: [],
      resources: [],
      dialogHistory: []
    };
    
    // Заполняем историю диалога
    dialogPairs.forEach(pair => {
      dialogData.dialogHistory.push({
        questionIndex: pair.index,
        question: pair.question,
        answer: pair.answer
      });
      
      // Дополнительные поля могут быть заполнены с использованием AI-processor
    });
    
    return dialogData;
  }
}

// Экспортируем класс для использования в других модулях
window.DialogExtractor = DialogExtractor;
