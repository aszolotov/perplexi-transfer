// src/utils/formatters.js - Модуль для форматирования экспорта в различные форматы

/**
 * Класс с функциями для форматирования данных в различные форматы
 */
class Formatters {
  /**
   * Создает JSON-строку из объекта
   * @param {Object} data - Объект для сериализации
   * @returns {string} Форматированная JSON строка
   */
  static toJSON(data) {
    return JSON.stringify(data, null, 2);
  }
  
  /**
   * Преобразует данные диалога в Markdown формат
   * @param {Object} dialogData - Структурированные данные диалога
   * @returns {string} Markdown представление данных
   */
  static toMarkdown(dialogData) {
    if (!dialogData || !dialogData.metadata) return '';
    
    let markdown = `# ${dialogData.metadata.projectName}\n\n`;
    markdown += `*Последнее обновление: ${dialogData.metadata.lastUpdated}*\n\n`;
    
    // Добавляем метаданные
    markdown += '## Метаданные\n\n';
    markdown += `- **Статус**: ${dialogData.metadata.status}\n`;
    markdown += `- **Источник**: ${dialogData.metadata.source}\n\n`;
    
    // Добавляем ключевые решения, если они есть
    if (dialogData.keyDecisions && dialogData.keyDecisions.length > 0) {
      markdown += '## Ключевые решения\n\n';
      dialogData.keyDecisions.forEach(decision => {
        markdown += `### ${decision.title || 'Решение'}\n\n`;
        markdown += `${decision.description || decision.text || 'Описание отсутствует'}\n\n`;
      });
    }
    
    // Добавляем технические спецификации
    if (dialogData.technicalSpecs && Object.keys(dialogData.technicalSpecs).length > 0) {
      markdown += '## Технические спецификации\n\n';
      
      if (dialogData.technicalSpecs.architecture) {
        markdown += `### Архитектура\n\n${dialogData.technicalSpecs.architecture}\n\n`;
      }
      
      if (dialogData.technicalSpecs.dataModel) {
        markdown += `### Модель данных\n\n${dialogData.technicalSpecs.dataModel}\n\n`;
      }
      
      if (dialogData.technicalSpecs.interfaces && dialogData.technicalSpecs.interfaces.length > 0) {
        markdown += `### Интерфейсы\n\n`;
        dialogData.technicalSpecs.interfaces.forEach(iface => {
          markdown += `- ${iface}\n`;
        });
        markdown += '\n';
      }
    }
    
    // Добавляем фрагменты кода
    if (dialogData.codeSnippets && dialogData.codeSnippets.length > 0) {
      markdown += '## Фрагменты кода\n\n';
      dialogData.codeSnippets.forEach(snippet => {
        markdown += `### ${snippet.name} (${snippet.language})\n\n`;
        if (snippet.purpose) {
          markdown += `*${snippet.purpose}*\n\n`;
        }
        markdown += '```' + snippet.language.toLowerCase() + '\n';
        markdown += snippet.code + '\n';
        markdown += '```
        
        if (snippet.context) {
          markdown += `**Контекст**: ${snippet.context}\n\n`;
        }
      });
    }
    
    // Добавляем историю диалога
    if (dialogData.dialogHistory && dialogData.dialogHistory.length > 0) {
      markdown += '## История диалога\n\n';
      dialogData.dialogHistory.forEach(entry => {
        markdown += `### Вопрос ${entry.questionIndex}\n\n`;
        markdown += `**Q**: ${entry.question}\n\n`;
        markdown += `**A**: ${entry.answer}\n\n`;
      });
    }
    
    return markdown;
  }
  
  /**
   * Преобразует данные диалога в HTML формат
   * @param {Object} dialogData - Структурированные данные диалога
   * @returns {string} HTML представление данных
   */
  static toHTML(dialogData) {
    if (!dialogData || !dialogData.metadata) return '';
    
    let html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${dialogData.metadata.projectName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 { color: #2a4b8d; }
    .metadata { color: #666; font-size: 0.9em; }
    .question { background: #f4f6f8; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
    .answer { background: #f8f8f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    pre { background: #272822; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .purpose { font-style: italic; color: #666; }
    .context { font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <h1>${dialogData.metadata.projectName}</h1>
  <div class="metadata">
    <p>Последнее обновление: ${dialogData.metadata.lastUpdated}</p>
    <p>Статус: ${dialogData.metadata.status}</p>
    <p>Источник: ${dialogData.metadata.source}</p>
  </div>`;
    
    // Добавляем ключевые решения, если они есть
    if (dialogData.keyDecisions && dialogData.keyDecisions.length > 0) {
      html += '<h2>Ключевые решения</h2>';
      dialogData.keyDecisions.forEach(decision => {
        html += `<h3>${decision.title || 'Решение'}</h3>`;
        html += `<p>${decision.description || decision.text || 'Описание отсутствует'}</p>`;
      });
    }
    
    // Добавляем фрагменты кода
    if (dialogData.codeSnippets && dialogData.codeSnippets.length > 0) {
      html += '<h2>Фрагменты кода</h2>';
      dialogData.codeSnippets.forEach(snippet => {
        html += `<h3>${snippet.name} (${snippet.language})</h3>`;
        if (snippet.purpose) {
          html += `<p class="purpose">${snippet.purpose}</p>`;
        }
        html += '<pre>';
        html += this.escapeHtml(snippet.code);
        html += '</pre>';
        
        if (snippet.context) {
          html += `<p class="context">${snippet.context}</p>`;
        }
      });
    }
    
    // Добавляем историю диалога
    if (dialogData.dialogHistory && dialogData.dialogHistory.length > 0) {
      html += '<h2>История диалога</h2>';
      dialogData.dialogHistory.forEach(entry => {
        html += `<h3>Вопрос ${entry.questionIndex}</h3>`;
        html += `<div class="question">${entry.question}</div>`;
        html += `<div class="answer">${entry.answer.replace(/\n/g, '<br>')}</div>`;
      });
    }
    
    html += `
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Экранирует HTML-специальные символы
   * @param {string} text - Текст для экранирования
   * @returns {string} Экранированный текст
   */
  static escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Экспортируем класс для использования в других модулях
window.Formatters = Formatters;
