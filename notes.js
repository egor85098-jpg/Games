(function(){
  'use strict';
  var PASSWORD='lolkek2024';
  var NOTES_KEY='lolkek_notes_v3';
  var DEFAULT_NOTES=[{id:1,title:'📌 Добро пожаловать!',text:'Это сайт lolkek — играй на информатике и переменах!\nСкоро: Standoff 2D.\n\nПодписывайся: @lolkek_tgk',date:'2024-01-01'}];
  function loadNotes(){
    try{
      var s=localStorage.getItem(NOTES_KEY);
      if(s){var a=JSON.parse(s);if(Array.isArray(a))return a;}
    }catch(e){}
    return DEFAULT_NOTES.slice();
  }
  function saveNotes(n){try{localStorage.setItem(NOTES_KEY,JSON.stringify(n));}catch(e){}}
  var notes=loadNotes();
  var isAdmin=false;
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function fmtDate(d){if(!d)return'';try{return new Date(d).toLocaleDateString('ru-RU',{day:'numeric',month:'short'});}catch(e){return d;}}
  function render(){
    var el=document.getElementById('notesList');if(!el)return;
    el.innerHTML='';
    if(!notes.length){el.innerHTML='<div class="notes-empty">Пока нет заметок</div>';return;}
    var sorted=notes.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    sorted.forEach(function(n){
      var card=document.createElement('div');card.className='note-card';
      var head=document.createElement('div');head.className='note-head';
      var title=document.createElement('div');title.className='note-title';title.innerHTML=esc(n.title||'Заметка');
      head.appendChild(title);
      if(isAdmin){
        var del=document.createElement('button');del.className='note-del';del.textContent='🗑';
        del.onclick=function(){if(confirm('Удалить?')){notes=notes.filter(function(x){return x.id!==n.id;});saveNotes(notes);render();}};
        head.appendChild(del);
      }
      card.appendChild(head);
      var text=document.createElement('div');text.className='note-text';text.textContent=n.text||'';
      card.appendChild(text);
      if(n.date){var dt=document.createElement('div');dt.className='note-date';dt.textContent=fmtDate(n.date);card.appendChild(dt);}
      el.appendChild(card);
    });
  }
  function openModal(){var m=document.getElementById('notesModal');if(m)m.classList.add('on');}
  function closeModal(){var m=document.getElementById('notesModal');if(m)m.classList.remove('on');}
  function login(){
    if(document.getElementById('notesPwd').value!==PASSWORD){
      document.getElementById('notesMsg').textContent='❌ Неверный пароль';return;
    }
    isAdmin=true;
    document.getElementById('notesPwdArea').style.display='none';
    document.getElementById('notesAdminArea').style.display='block';
    document.getElementById('notesMsg').textContent='✅ Режим админа';
    render();
  }
  function addNote(){
    var t=document.getElementById('noteTitleInput').value.trim();
    var x=document.getElementById('noteTextInput').value.trim();
    if(!x){document.getElementById('notesMsg').textContent='❌ Введи текст';return;}
    notes.push({id:Date.now(),title:t||'Заметка',text:x,date:new Date().toISOString().split('T')[0]});
    saveNotes(notes);
    document.getElementById('noteTitleInput').value='';
    document.getElementById('noteTextInput').value='';
    document.getElementById('notesMsg').textContent='✅ Добавлено!';
    render();
  }
  function init(){
    render();
    var lb=document.getElementById('notesLock');if(lb)lb.onclick=openModal;
    var li=document.getElementById('notesLoginBtn');if(li)li.onclick=login;
    var cl=document.getElementById('notesCloseBtn');if(cl)cl.onclick=closeModal;
    var ad=document.getElementById('notesAddBtn');if(ad)ad.onclick=addNote;
    var pw=document.getElementById('notesPwd');
    if(pw)pw.addEventListener('keydown',function(e){if(e.key==='Enter')login();});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}
  else{init();}
})();
