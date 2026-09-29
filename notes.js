/* =====================================================
   NOTES.JS — система заметок для сайта lolkek
   Подключается на всех страницах
   ===================================================== */

(function(){
  'use strict';

  // ===== НАСТРОЙКИ =====
  var PASSWORD = 'lolkek2024';
  var NOTES_KEY = 'lolkek_notes_v2';

  // Заметки по умолчанию (сюда попадает то, что вы "зальёте" через GitHub)
  var DEFAULT_NOTES = [
    {
      id: 1,
      title: '📌 Добро пожаловать!',
      text: 'Это сайт lolkek — играй на информатике и переменах!\nСкоро добавлю Standoff 2D и CS 2D.\n\nПодписывайся: @lolkek_tgk',
      date: '2024-01-01'
    }
  ];

  // ===== ЗАГРУЗКА =====
  function loadNotes(){
    // Приоритет 1: URL хеш (#notes=...)
    var hash = location.hash;
    if (hash.indexOf('#notes=') === 0){
      try {
        var decoded = JSON.parse(decodeURIComponent(hash.substr(7)));
        saveNotes(decoded);
        history.replaceState(null, '', location.pathname + location.search);
        return decoded;
      } catch(e){}
    }
    // Приоритет 2: localStorage
    try {
      var s = localStorage.getItem(NOTES_KEY);
      if (s){
        var arr = JSON.parse(s);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch(e){}
    // По умолчанию
    return DEFAULT_NOTES.slice();
  }

  function saveNotes(notes){
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch(e){}
  }

  // ===== СОСТОЯНИЕ =====
  var notes = loadNotes();
  var isAdmin = false;

  // ===== РЕНДЕР =====
  function escapeHtml(s){
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(d){
    if (!d) return '';
    try {
      var dt = new Date(d);
      return dt.toLocaleDateString('ru-RU', {day:'numeric', month:'short'});
    } catch(e){ return d; }
  }

  function render(){
    var el = document.getElementById('notesList');
    if (!el) return;
    el.innerHTML = '';

    if (!notes.length){
      el.innerHTML = '<div class="notes-empty">Пока нет заметок</div>';
      return;
    }

    // Сортируем по дате (новые сверху)
    var sorted = notes.slice().sort(function(a, b){
      return (b.date || '').localeCompare(a.date || '');
    });

    sorted.forEach(function(n){
      var card = document.createElement('div');
      card.className = 'note-card';

      var head = document.createElement('div');
      head.className = 'note-head';

      var title = document.createElement('div');
      title.className = 'note-title';
      title.innerHTML = escapeHtml(n.title || 'Без названия');
      head.appendChild(title);

      if (isAdmin){
        var del = document.createElement('button');
        del.className = 'note-del';
        del.textContent = '🗑';
        del.title = 'Удалить';
        del.onclick = function(){
          if (confirm('Удалить эту заметку?')){
            notes = notes.filter(function(x){ return x.id !== n.id; });
            saveNotes(notes);
            render();
          }
        };
        head.appendChild(del);
      }

      card.appendChild(head);

      var text = document.createElement('div');
      text.className = 'note-text';
      text.textContent = n.text || '';
      card.appendChild(text);

      if (n.date){
        var date = document.createElement('div');
        date.className = 'note-date';
        date.textContent = formatDate(n.date);
        card.appendChild(date);
      }

      el.appendChild(card);
    });
  }

  // ===== МОДАЛКА =====
  function openModal(){
    var m = document.getElementById('notesModal');
    if (m) m.classList.add('on');
  }
  function closeModal(){
    var m = document.getElementById('notesModal');
    if (m) m.classList.remove('on');
  }

  function login(){
    var pwd = document.getElementById('notesPwd').value;
    if (pwd !== PASSWORD){
      document.getElementById('notesMsg').textContent = '❌ Неверный пароль';
      return;
    }
    isAdmin = true;
    document.getElementById('notesPwdArea').style.display = 'none';
    document.getElementById('notesAdminArea').style.display = 'block';
    document.getElementById('notesMsg').textContent = '✅ Режим админа включён';
    render();
  }

  function addNote(){
    var title = document.getElementById('noteTitleInput').value.trim();
    var text = document.getElementById('noteTextInput').value.trim();
    if (!text){
      document.getElementById('notesMsg').textContent = '❌ Введи текст заметки';
      return;
    }
    var newNote = {
      id: Date.now(),
      title: title || 'Заметка',
      text: text,
      date: new Date().toISOString().split('T')[0]
    };
    notes.push(newNote);
    saveNotes(notes);
    document.getElementById('noteTitleInput').value = '';
    document.getElementById('noteTextInput').value = '';
    document.getElementById('notesMsg').textContent = '✅ Добавлено!';
    render();
  }

  function copyCode(){
    if (!isAdmin){
      document.getElementById('notesMsg').textContent = '❌ Сначала введи пароль';
      return;
    }
    var code = 'var DEFAULT_NOTES = ' + JSON.stringify(notes, null, 2) + ';';
    var ta = document.createElement('textarea');
    ta.value = code;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, 999999);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
    if (ok){
      document.getElementById('notesMsg').innerHTML =
        '✅ Скопировано! Замени блок <b>var DEFAULT_NOTES = [...]</b> в файле notes.js на GitHub.';
    } else {
      prompt('Скопируй вручную:', code);
    }
  }

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  function init(){
    render();

    // Кнопка открытия редактора
    var lockBtn = document.getElementById('notesLock');
    if (lockBtn) lockBtn.onclick = openModal;

    // Кнопки модалки
    var loginBtn = document.getElementById('notesLoginBtn');
    if (loginBtn) loginBtn.onclick = login;
    var closeBtn = document.getElementById('notesCloseBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
    var addBtn = document.getElementById('notesAddBtn');
    if (addBtn) addBtn.onclick = addNote;
    var copyBtn = document.getElementById('notesCopyBtn');
    if (copyBtn) copyBtn.onclick = copyCode;

    // Enter в поле пароля
    var pwd = document.getElementById('notesPwd');
    if (pwd) pwd.addEventListener('keydown', function(e){
      if (e.key === 'Enter') login();
    });
  }

  // ===== ЭКСПОРТ (для других скриптов) =====
  window.LolkekNotes = {
    get: function(){ return notes; },
    reload: function(){ notes = loadNotes(); render(); }
  };

  // ===== СТАРТ =====
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();