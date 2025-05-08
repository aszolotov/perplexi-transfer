// src/content/code-analyzer.js - Модуль для анализа и обработки кода в диалогах

/**
 * Класс для извлечения, анализа и обработки кода из диалогов Perplexity
 */
class CodeAnalyzer {
  /**
   * Извлекает блоки кода из текста
   * @param {string} text - Текст, из которого нужно извлечь код
   * @returns {Array} Массив извлеченных блоков кода
   */
  static extractCodeBlocks(text) {
    if (!text) return [];
    
    // Регулярное выражение для поиска блоков кода между ```
    const codeBlockRegex = /```([\s\S]*?)```
    const matches = [];
    let match;
    
    // Итеративно находим все блоки кода
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match[1]) {
        matches.push(match[1].trim());
      }
    }
    
    return matches;
  }

  /**
   * Определяет язык программирования кода
   * @param {string} codeBlock - Блок кода для анализа
   * @returns {string} Определенный язык программирования
   */
  static detectLanguage(codeBlock) {
    if (!codeBlock) return 'unknown';
    
    // Проверяем первую строку на явное указание языка
    const firstLine = codeBlock.split('\n').trim().toLowerCase();
    
    // Проверка явного указания языка в первой строке
    if (firstLine === 'javascript' || firstLine === 'js') return 'JavaScript';
    if (firstLine === 'typescript' || firstLine === 'ts') return 'TypeScript';
    if (firstLine === 'python' || firstLine === 'py') return 'Python';
    if (firstLine === 'java') return 'Java';
    if (firstLine === 'c#' || firstLine === 'csharp') return 'C#';
    if (firstLine === 'php') return 'PHP';
    if (firstLine === 'ruby' || firstLine === 'rb') return 'Ruby';
    if (firstLine === 'go' || firstLine === 'golang') return 'Go';
    if (firstLine === 'rust') return 'Rust';
    if (firstLine === 'html') return 'HTML';
    if (firstLine === 'css') return 'CSS';
    if (firstLine === 'sql') return 'SQL';
    if (firstLine === 'bash' || firstLine === 'sh') return 'Bash';
    
    // Эвристическое определение языка по синтаксису
    if (codeBlock.includes('function') || codeBlock.includes('const') || 
        codeBlock.includes('let') || codeBlock.includes('var ')) return 'JavaScript';
    if (codeBlock.includes(':') && codeBlock.includes('interface ') || 
        codeBlock.includes('type ') && codeBlock.includes('=>')) return 'TypeScript';
    if (codeBlock.includes('def ') || codeBlock.includes('import ') || 
        codeBlock.includes('class ') && codeBlock.includes(':')) return 'Python';
    if (codeBlock.includes('public class') || codeBlock.includes('private ') || 
        codeBlock.includes('protected ')) return 'Java';
    if (codeBlock.includes('func ') && codeBlock.includes('package ')) return 'Go';
    if (codeBlock.includes('fn ') && codeBlock.includes('let mut ')) return 'Rust';
    if (codeBlock.includes('<?php')) return 'PHP';
    
    return 'unknown';
  }

  /**
   * Обрабатывает блоки кода из диалога
   * @param {Array} dialogPairs - Пары вопрос-ответ
   * @returns {Array} Массив обработанных блоков кода
   */
  static processCodeFromDialog(dialogPairs) {
    if (!dialogPairs || dialogPairs.length === 0) return [];
    
    const codeSnippets = [];
    
    dialogPairs.forEach((pair, index) => {
      // Извлекаем код из ответа
      const codeBlocks = this.extractCodeBlocks(pair.answer);
      
      if (codeBlocks.length > 0) {
        codeBlocks.forEach((block, blockIndex) => {
          const language = this.detectLanguage(block);
          
          codeSnippets.push({
            name: `snippet_${codeSnippets.length + 1}`,
            language,
            code: block,
            purpose: this.detectPurpose(block, pair.question, pair.answer),
            relatedTo: `Вопрос ${pair.index}`,
            context: this.extractContext(pair.answer, block)
          });
        });
      }
    });
    
    return codeSnippets;
  }

  /**
   * Пытается определить назначение кода
   * @param {string} code - Блок кода
   * @param {string} question - Вопрос, связанный с кодом
   * @param {string} answer - Ответ, содержащий код
   * @returns {string} Предполагаемое назначение кода
   */
  static detectPurpose(code, question, answer) {
    // Извлекаем текст до блока кода
    const codePosition = answer.indexOf(code);
    if (codePosition === -1) return "Код из диалога";
    
    const contextBeforeCode = answer.substring(Math.max(0, codePosition - 150), codePosition).trim();
    
    // Проверяем наличие ключевых слов
    if (contextBeforeCode.includes('пример') || 
        contextBeforeCode.includes('вот код') || 
        contextBeforeCode.includes('код для')) {
      return contextBeforeCode.split('.').pop().trim() || "Пример кода";
    }
    
    // Анализируем вопрос
    if (question.includes('как сделать') || question.includes('как реализовать')) {
      return "
