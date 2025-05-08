// Получение выбранных вопросов и ответов в текстовом формате
function getSelectedQA() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;

  // Собираем все вопросы и ответы
  let questions = Array.from(document.querySelectorAll('.group\\/query'));
  let answers = Array.from(document.querySelectorAll('[id^="markdown-content-"]'));
  
  let out = '';
  let answerIdx = 0;
  
  questions.forEach((q) => {
    let qText = q.innerText.trim();
    // Ищем ответ в пределах родительского блока
    let qBox = q.closest('.group.relative');
    let a = null;
    
    if (qBox) {
      a = qBox.parentElement.querySelector('[id^="markdown-content-"]');
    }
    
    if (!a && answerIdx < answers.length) {
      a = answers[answerIdx++];
    }
    
    let aText = a ? a.innerText.trim() : '[Ответ не найден]';
    
    // Если оба текста попадают в выделение - добавляем
    if (selection.containsNode(q, true) || (a && selection.containsNode(a, true))) {
      out += `Вопрос:\n${qText}\n\nОтвет:\n${aText}\n\n-----------------------------\n`;
    }
  });
  
  return out.trim() ? out : null;
}

// Получение всего диалога в JSON-формате
function getDialogAsJSON() {
  let questions = Array.from(document.querySelectorAll('.group\\/query'));
  let answers = Array.from(document.querySelectorAll('[id^="markdown-content-"]'));
  let answerIdx = 0;
  
  // Подготовка структуры JSON
  let dialogData = {
    metadata: {
      projectName: document.title.replace(" - Perplexity", "").trim(),
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
  
  // Заполнение истории диалога
  questions.forEach((q, index) => {
    let qText = q.innerText.trim();
    let qBox = q.closest('.group.relative');
    let a = null;
    
    if (qBox) {
      a = qBox.parentElement.querySelector('[id^="markdown-content-"]');
    }
    
    if (!a && answerIdx < answers.length) {
      a = answers[answerIdx++];
    }
    
    let aText = a ? a.innerText.trim() : '[Ответ не найден]';
    
    // Добавляем в историю диалога
    dialogData.dialogHistory.push({
      questionIndex: index + 1,
      question: qText,
      answer: aText
    });
    
    // Извлекаем код из ответа
    const codeBlocks = extractCodeBlocks(aText);
    if (codeBlocks.length > 0) {
      codeBlocks.forEach(block => {
        dialogData.codeSnippets.push({
          name: `snippet_${dialogData.codeSnippets.length + 1}`,
          language: detectLanguage(block),
          code: block,
          purpose: "Код из диалога",
          relatedTo: `Вопрос ${index + 1}`
        });
      });
    }
  });
  
  return JSON.stringify(dialogData, null, 2);
}

// Вспомогательная функция для извлечения блоков кода
function extractCodeBlocks(text) {
  // Исправленное регулярное выражение с захватывающей группой
  const codeBlockRegex = /``````/g;
  const matches = [];
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match[1]) {
      matches.push(match[1].trim());
    }
  }
  
  return matches;
}

// Определение языка программирования
function detectLanguage(codeBlock) {
  const firstLine = codeBlock.split('\n')[0].trim().toLowerCase();
  
  if (firstLine === 'javascript' || firstLine === 'js') return 'JavaScript';
  if (firstLine === 'python' || firstLine === 'py') return 'Python';
  if (firstLine === 'java') return 'Java';
  if (firstLine === 'c#' || firstLine === 'csharp') return 'C#';
  if (firstLine === 'php') return 'PHP';
  
  // Если язык не указан явно, пытаемся определить по синтаксису
  if (codeBlock.includes('function') || codeBlock.includes('const') || codeBlock.includes('let')) return 'JavaScript';
  if (codeBlock.includes('def ') || codeBlock.includes('import ')) return 'Python';
  if (codeBlock.includes('public class') || codeBlock.includes('void ')) return 'Java';
  
  return 'unknown';
}

// Копирование текста
function copyText(text, buttonId, successMessage) {
  navigator.clipboard.writeText(text).then(
    () => {
      const btn = document.getElementById(buttonId);
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = successMessage;
        setTimeout(() => { btn.textContent = originalText; }, 1500);
      }
    },
    (e) => alert('Ошибка копирования: ' + e)
  );
}

// Копирование в обычном текстовом формате
function copyQA() {
  let selected = getSelectedQA();
  if (!selected) {
    // Если ничего не выделено, копируем весь диалог
    let questions = Array.from(document.querySelectorAll('.group\\/query'));
    let answers = Array.from(document.querySelectorAll('[id^="markdown-content-"]'));
    let out = '';
    let answerIdx = 0;
    
    questions.forEach((q) => {
      let qText = q.innerText.trim();
      let qBox = q.closest('.group.relative');
      let a = null;
      
      if (qBox) {
        a = qBox.parentElement.querySelector('[id^="markdown-content-"]');
      }
      
      if (!a && answerIdx < answers.length) {
        a = answers[answerIdx++];
      }
      
      let aText = a ? a.innerText.trim() : '[Ответ не найден]';
      out += `Вопрос:\n${qText}\n\nОтвет:\n${aText}\n\n-----------------------------\n`;
    });
    
    selected = out;
  }
  
  copyText(selected, 'my-copy-all-btn', 'Скопировано!');
}

// Копирование в JSON формате
function copyAsJSON() {
  const jsonData = getDialogAsJSON();
  copyText(jsonData, 'my-copy-json-btn', 'JSON скопирован!');
}

// Добавление кнопок на страницу
function addButtons() {
  // Добавляем кнопку для обычного копирования, если её ещё нет
  if (!document.getElementById('my-copy-all-btn')) {
    let textBtn = document.createElement('button');
    textBtn.id = 'my-copy-all-btn';
    textBtn.textContent = 'Скопировать текст';
    textBtn.style = `
      position:fixed;
      top:40vh;
      right:0;
      z-index:9999;
      padding:12px 18px;
      background:#613bdb;
      color:#fff;
      border:none;
      border-radius:7px 0 0 7px;
      box-shadow:0 2px 8px #0002;
      cursor:pointer;
      font-size:16px;
      opacity:0.92;
      transition:opacity 0.2s;
    `;
    textBtn.onmouseenter = () => textBtn.style.opacity = "1";
    textBtn.onmouseleave = () => textBtn.style.opacity = "0.92";
    textBtn.onclick = copyQA;
    document.body.appendChild(textBtn);
  }
  
  // Добавляем кнопку для копирования в JSON формате, если её ещё нет
  if (!document.getElementById('my-copy-json-btn')) {
    let jsonBtn = document.createElement('button');
    jsonBtn.id = 'my-copy-json-btn';
    jsonBtn.textContent = 'Скопировать как JSON';
    jsonBtn.style = `
      position:fixed;
      top:48vh;
      right:0;
      z-index:9999;
      padding:12px 18px;
      background:#38a169;
      color:#fff;
      border:none;
      border-radius:7px 0 0 7px;
      box-shadow:0 2px 8px #0002;
      cursor:pointer;
      font-size:16px;
      opacity:0.92;
      transition:opacity 0.2s;
    `;
    jsonBtn.onmouseenter = () => jsonBtn.style.opacity = "1";
    jsonBtn.onmouseleave = () => jsonBtn.style.opacity = "0.92";
    jsonBtn.onclick = copyAsJSON;
    document.body.appendChild(jsonBtn);
  }
}

// Запускаем добавление кнопок периодически, чтобы они появлялись даже при динамической загрузке страницы
setInterval(addButtons, 2000);
