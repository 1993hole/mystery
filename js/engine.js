/* ============================================================
   A Tale of Two Nights — prototype engine (vanilla JS)
   데이터(JSON) 구동 비주얼 노벨 + 허브 내비게이션 + 단서/수사노트
   ============================================================ */
'use strict';
const $ = s => document.querySelector(s);

let CH = {}, CL = {}, ACT = null;        // characters / clues / current act data
const S = {                              // runtime state
  scene: null, beats: [], i: 0, playerName: '', curLoc: null,
  done: new Set(), flags: {}, seenLocs: new Set(), clues: [], notes: [],
  goal: null, uiUnlocked: false, lastPortrait: null, tutorialShown: false, soundOn: true, textSpeed: 22
};
let _typeTimer = null, _typeFull = '';   // 타이핑 효과

/* ── 클릭음 (Web Audio 오실레이터 합성 — 파일 불필요·지연 0) ── */
let _actx = null;
function playClick(){
  if(!S.soundOn) return;                 // 사운드 OFF면 무음
  try{
    if(!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    if(_actx.state === 'suspended') _actx.resume();
    const t = _actx.currentTime;
    const o = _actx.createOscillator(), g = _actx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(600, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.10, t + 0.004);   // 빠른 어택
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);  // 짧은 감쇠 → "톡"
    o.connect(g); g.connect(_actx.destination);
    o.start(t); o.stop(t + 0.08);
  }catch(e){}
}

/* 배경 키 → 상단바 장소 표시명 */
const PLACES = {
  manor_exterior_night:'그레이번 저택 — 외관', manor_exterior_dawn:'그레이번 저택 — 새벽',
  manor_entrance_night:'저택 현관', ballroom_full_night:'연회장', ballroom_corner_night:'연회장 한편',
  ballroom_entrance_night:'연회장 입구', ballroom_invitation_table:'연회장 입구',
  hall_night:'홀', hall_window_night:'홀 — 창가', hall_corner_night:'홀 — 구석',
  bar_corner_night:'바 코너', bar_corner_inner_night:'바 코너 안쪽',
  parlor_night:'응접실', corridor_night:'복도',
  corridor_crime_scene_night:'복도 — 현장', corridor_crime_scene_night_red:'복도 — 현장',
  corridor_office_front_night:'집무실 앞 복도', study_night:'서재', office_night:'집무실',
  corridor_2nd_floor_night:'2층 복도', lucian_room_night:'루시안의 방',
  attic_night:'다락', attic_secret_night:'다락 — 비밀 공간', attic_secret_dawn:'다락 — 비밀 공간'
};

/* ── 저장/불러오기 (localStorage 6슬롯 · 체크포인트 방식) ── */
const SAVES_KEY = 'att_saves_v1';
const SLOT_COUNT = 6;
const ACTS = { act1:()=>window.DATA_ACT1, act2:()=>window.DATA_ACT2, act3:()=>window.DATA_ACT3 };
let _checkpoint = null;
let _slMode = 'save';      // 저장/불러오기 화면 모드
let _slConfirm = -1;       // 덮어쓰기 확인 대기 중인 슬롯
const clone = o => JSON.parse(JSON.stringify(o));

/* 씬의 첫 배경 비트에서 장소 표시명을 뽑음(tb-loc는 아직 이전 위치라 부정확) */
function sceneFirstPlace(scene){
  const sc = ACT.scenes[scene]; if(!sc) return $('#tb-loc').textContent || '';
  const bgBeat = (sc.beats||[]).find(b => 'bg' in b);
  return (bgBeat && PLACES[bgBeat.bg]) || $('#tb-loc').textContent || '';
}
/* 씬 진입 직전(효과 적용 전) 또는 허브 상태를 깊은 복사로 보관 */
function captureCheckpoint(scene){
  _checkpoint = {
    v:1, actId: ACT.id, scene,
    place: (scene==='__hub__') ? ((ACT.hub && ACT.hub.title) || '') : sceneFirstPlace(scene),
    playerName: S.playerName, curLoc: S.curLoc, goal: S.goal ? {...S.goal} : null,
    uiUnlocked: S.uiUnlocked, tutorialShown: S.tutorialShown, soundOn: S.soundOn, textSpeed: S.textSpeed,
    done: [...S.done], seenLocs: [...S.seenLocs],
    flags: clone(S.flags), clues: clone(S.clues), notes: clone(S.notes)
  };
}

/* localStorage 슬롯 저장소 { "0":rec, ... } */
function readSaves(){ try{ return JSON.parse(localStorage.getItem(SAVES_KEY) || '{}') || {}; }catch(e){ return {}; } }
function writeSaves(obj){ try{ localStorage.setItem(SAVES_KEY, JSON.stringify(obj)); return true; }catch(e){ return false; } }
function anySave(){ return Object.keys(readSaves()).length > 0; }

function makeRecord(){
  const cp=_checkpoint;
  const actTitle=(ACTS[cp.actId] && ACTS[cp.actId]().title) || '';
  return {...clone(cp), savedAt: Date.now(), actTitle };
}

/* 버튼 진입점 — 슬롯 화면 오픈 */
function saveGame(){ openSaveLoad('save'); }   // ⚙ 메뉴 "저장하기"
function loadGame(){ openSaveLoad('load'); }   // ⚙ 메뉴·타이틀 "불러오기"

function openSaveLoad(mode){
  _slMode=mode; _slConfirm=-1;
  $('#sl-title').textContent = mode==='save' ? '저장하기' : '불러오기';
  renderSlots();
  closeMenu();
  $('#saveload').classList.add('show');
}
function closeSaveLoad(){ $('#saveload').classList.remove('show'); _slConfirm=-1; }

function fmtTime(ts){ const p=n=>(''+n).padStart(2,'0'); const d=new Date(ts);
  return `${d.getFullYear()}.${p(d.getMonth()+1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

function renderSlots(){
  const saves=readSaves(); const box=$('#sl-slots'); box.innerHTML='';
  for(let i=0;i<SLOT_COUNT;i++){
    const rec=saves[i];
    const slot=document.createElement('div');
    slot.className='sl-slot' + ((_slMode==='load' && !rec) ? ' disabled' : '');
    if(rec){
      const clues=(rec.clues && rec.clues.length) || 0;
      slot.innerHTML =
        `<div class="sl-row"><span class="sl-name"><span class="sl-num">SLOT ${i+1}</span>${esc(rec.actTitle||'')}${rec.place?' · '+esc(rec.place):''}</span></div>`
        + `<div class="sl-meta"><span>${esc(rec.playerName||'')} · 단서 ${clues}개</span><span class="sl-time">${fmtTime(rec.savedAt)}</span></div>`;
      if(_slMode==='save'){
        const del=document.createElement('button'); del.className='sl-del'; del.textContent='×'; del.title='삭제';
        del.addEventListener('click', e=>{ e.stopPropagation(); playClick(); deleteSlot(i); });
        slot.appendChild(del);
      }
    } else {
      slot.innerHTML = `<div class="sl-row"><span class="sl-empty"><span class="sl-num">SLOT ${i+1}</span>— 비어 있음 —</span></div>`;
    }
    if(_slConfirm===i){        // 덮어쓰기 확인 인라인
      const c=document.createElement('div'); c.className='sl-confirm';
      const yes=document.createElement('button'); yes.className='sl-cbtn yes'; yes.textContent='덮어쓰기';
      const no =document.createElement('button'); no.className='sl-cbtn';      no.textContent='취소';
      yes.addEventListener('click', e=>{ e.stopPropagation(); playClick(); doWriteSlot(i); });
      no .addEventListener('click', e=>{ e.stopPropagation(); playClick(); _slConfirm=-1; renderSlots(); });
      c.append(yes,no); slot.appendChild(c);
    }
    slot.addEventListener('click', ()=> slotClick(i, !!rec));
    box.appendChild(slot);
  }
}

function slotClick(i, occupied){
  if(_slMode==='save'){
    if(occupied){ _slConfirm = (_slConfirm===i ? -1 : i); renderSlots(); }   // 덮어쓰기 확인 토글
    else doWriteSlot(i);
  }else if(occupied){ loadSlot(i); }
}

function doWriteSlot(i){
  if(!_checkpoint){ showToast('아직 저장할 지점이 없습니다'); return; }
  const saves=readSaves(); saves[i]=makeRecord();
  if(writeSaves(saves)){ _slConfirm=-1; renderSlots(); refreshLoadButtons(); showToast(`슬롯 ${i+1}에 저장되었습니다`); }
  else showToast('저장 실패 — 저장 공간을 확인해 주세요');
}
function deleteSlot(i){ const saves=readSaves(); delete saves[i]; writeSaves(saves); _slConfirm=-1; renderSlots(); refreshLoadButtons(); }

function loadSlot(i){
  const d=readSaves()[i]; if(!d) return;
  const act = ACTS[d.actId] && ACTS[d.actId]();
  if(!act){ showToast('불러오기 실패 — 손상된 기록'); return; }
  closeSaveLoad();
  ACT = act;
  S.playerName=d.playerName; if(CH.player) CH.player.name=d.playerName;
  S.curLoc=d.curLoc; S.goal=d.goal; S.uiUnlocked=d.uiUnlocked; S.tutorialShown=d.tutorialShown;
  S.soundOn=(d.soundOn!==false); S.textSpeed=(typeof d.textSpeed==='number'?d.textSpeed:22);
  S.done=new Set(d.done||[]); S.seenLocs=new Set(d.seenLocs||[]);
  S.flags=d.flags||{}; S.clues=d.clues||[]; S.notes=d.notes||[];
  // UI 반영
  setActPips(ACT.id);
  if(S.uiUnlocked) revealUI(); else hideUI();
  dismissTutorial(); renderNotes(); renderInv(); updateGoal();
  const ss=$('#sound-state'); if(ss){ ss.textContent=S.soundOn?'ON':'OFF'; ss.classList.toggle('off', !S.soundOn); }
  syncSpeedSeg();
  $('#settings').classList.remove('show');
  // 재개: 씬이면 그 씬 1회 재생(스냅샷이 효과 적용 전이라 중복 없음), 허브면 허브로
  if(d.scene && d.scene!=='__hub__') runScene(d.scene);
  else showHub();
}

function syncSpeedSeg(){ const seg=$('#seg-speed'); if(!seg) return;
  [...seg.children].forEach(b=>b.classList.toggle('on', +b.dataset.speed===S.textSpeed)); }

/* 저장 기록 유무에 따라 불러오기 버튼(타이틀·메뉴) 활성/비활성 표시 */
function refreshLoadButtons(){
  const has=anySave();
  const tl=$('#btn-title-load'); if(tl) tl.classList.toggle('off', !has);
  const ml=$('#sys-load');       if(ml) ml.disabled = !has;
}

/* ── boot ── (데이터는 index.html의 <script>로 미리 로드된 전역) ── */
function boot(){
  try{
    CH = window.DATA_CHARACTERS; CL = window.DATA_CLUES; ACT = window.DATA_ACT1;
    if(!CH || !CL || !ACT) throw new Error('데이터 스크립트가 로드되지 않았습니다 (data/*.js 확인).');
    $('#loading').style.display = 'none';
    refreshLoadButtons();
  }catch(e){
    $('#loading').textContent = '데이터 로드 실패: ' + e.message;
    console.error(e);
  }
}

/* ── helpers ── */
const esc = s => (s||'').replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
/* 허브 공간의 항목(entries) — 사람(talks)·사물 혼합. talks는 "OO에게 다가간다"로 자동 변환 */
function locEntries(loc){
  if(loc.entries) return loc.entries;
  if(loc.talks) return loc.talks.map(t=>({ label:(CH[t.replace('talk_','')]||{name:t}).name+'에게 다가간다', scene:t }));
  return [];
}
function allHubScenes(){ return (ACT.hub ? ACT.hub.locations : []).flatMap(locEntries).map(e=>e.scene); }
function doneHubCount(){ return allHubScenes().filter(s=>S.done.has(s)).length; }
/* 조건 평가 — flags(전부 참)·done(전부 완료)·counters(이상) */
function meets(c){
  if(!c) return true;
  if(c.flags && !c.flags.every(f=>S.flags[f])) return false;
  if(c.done && !c.done.every(s=>S.done.has(s))) return false;
  if(c.counters){ for(const k in c.counters) if((S.flags[k]||0) < c.counters[k]) return false; }
  return true;
}
/* 게이팅 트리거 — 조건 충족 시 1회 자동 씬 발동 */
function checkTriggers(){
  const trigs = (ACT.hub && ACT.hub.triggers) || [];
  for(const t of trigs){ if(!S.flags['_t_'+t.id] && meets(t.when)){ S.flags['_t_'+t.id]=true; S.curLoc=null; runScene(t.goto); return true; } }
  return false;
}
function show(id){ document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id===id)); }
function setBg(el, key){ if(key) el.style.backgroundImage = `url('assets/backgrounds/bg_${key}.png')`; }
/* 씬 배경 — 바뀔 때 페이드(아웃→교체→인) */
let _bgTimer = null;
function setSceneBg(key){
  if(!key) return;
  const el=$('#scene-bg'), url=`url('assets/backgrounds/bg_${key}.png')`;
  if(el.style.backgroundImage===url) return;
  clearTimeout(_bgTimer);
  el.style.opacity='0';
  _bgTimer=setTimeout(()=>{ el.style.backgroundImage=url; el.style.opacity='1'; }, 340);
}
/* 즉시 교체 (다른 화면→씬 진입 시: 화면 크로스페이드가 전환 담당, 옛 배경 안 비침) */
function setSceneBgInstant(key){
  if(!key) return;
  clearTimeout(_bgTimer);
  const el=$('#scene-bg');
  el.style.backgroundImage=`url('assets/backgrounds/bg_${key}.png')`;
  el.style.opacity='1';
}
function updateLocation(key){ const el=$('#tb-loc'); if(el) el.textContent = PLACES[key] || (ACT && ACT.hub && ACT.hub.title) || ''; }
function setActPips(actId){ const n={act1:1,act2:2,act3:3}[actId]||1; [1,2,3].forEach(i=>$('#pip'+i).classList.toggle('on', i===n)); }
function revealUI(){ ['btn-notes','btn-inv'].forEach(id=>{ const e=$('#'+id); e.classList.remove('hidden'); e.classList.add('revealed'); }); }
function hideUI(){ ['btn-notes','btn-inv'].forEach(id=>{ const e=$('#'+id); e.classList.add('hidden'); e.classList.remove('revealed'); }); }
function showTutorial(){ if(S.tutorialShown) return; S.tutorialShown=true; $('#tutorial').classList.add('show'); $('#topbar').classList.add('tut-raise'); }
function dismissTutorial(){ $('#tutorial').classList.remove('show'); $('#topbar').classList.remove('tut-raise'); }
function openMenu(){ $('#sysmenu').classList.add('show'); }
function closeMenu(){ $('#sysmenu').classList.remove('show'); }

function setPortrait(src){
  const p=$('#scene-portrait'), img=p.querySelector('img');
  if(img.getAttribute('src')===src && p.classList.contains('show')) return;   // 같은 인물 → 유지
  p.classList.remove('show');                  // 즉시 숨김(transition 없음) → 이전 이미지·검은 박스 잔상 제거
  const reveal = ()=>{ if(img.getAttribute('src')===src) p.classList.add('show'); };  // 새 이미지 로드 후에만 페이드 인
  img.onload = reveal;
  img.src = src;
  if(img.complete && img.naturalWidth) reveal();        // 이미 캐시된 경우 즉시
  else setTimeout(reveal, 250);                          // 폴백: onload 누락 대비(로컬 이미지는 그 전에 로드됨)
  S.lastPortrait = src;
}
function clearPortrait(){ $('#scene-portrait').classList.remove('show'); S.lastPortrait=null; }   /* 대화 중 페이드 아웃(이미지 유지) */
function hidePortraitInstant(){ const p=$('#scene-portrait'); p.classList.remove('show'); p.querySelector('img').removeAttribute('src'); S.lastPortrait=null; }   /* 씬 전환·접근 진입: 이미지 즉시 비움(옛 인물 잔상 방지) */

/* ── act / scene flow ── */
function resetState(){   // 새 게임(ACT1 시작) — 전체 초기화
  S.done=new Set(); S.flags={}; S.seenLocs=new Set(); S.clues=[]; S.notes=[]; S.goal=null; S.uiUnlocked=false; S.curLoc=null; S.tutorialShown=false;
  hideUI(); dismissTutorial(); $('#goal-text').textContent='—'; $('#goal-prog').textContent=''; renderNotes(); renderInv(); }

/* ACT 전환 — 누적 평가용(플래그·단서·노트·카운터)은 유지, 내비게이션만 초기화.
   씬 id가 ACT마다 겹치므로 done/seen은 반드시 리셋. */
function resetActState(){ S.done=new Set(); S.seenLocs=new Set(); S.curLoc=null; S.scene=null; S.goal=null;
  $('#goal-text').textContent='—'; $('#goal-prog').textContent=''; }

function startAct(act){ ACT=act;
  if(act.id==='act1'){ resetState(); }
  else { resetActState(); S.tutorialShown=true; }     // ACT2·3: 튜토리얼 생략, 누적 상태 보존
  setActPips(act.id); runScene(act.start); }

function runScene(id){
  const sc = ACT.scenes[id];
  if(!sc){ console.error('no scene', id); return; }
  captureCheckpoint(id);          // 씬 진입 직전(효과 적용 전) 상태 스냅샷 → 불러오기 시 이 씬부터 1회 재생
  S.scene = id;
  S.beats = JSON.parse(JSON.stringify(sc.beats));   // clone (choices splice into it)
  S.i = 0;
  hidePortraitInstant();
  $('#blackout').classList.remove('on');
  $('#choices').style.display='none';
  hideInterrogate();                              // 씬 전환 시 추궁 카드 잔상 제거
  $('#combine').classList.remove('show'); _cb=null;   // 조합 오버레이 잔상 제거
  $('#clue-overlay').classList.remove('show');        // 단서 오버레이 잔상 제거(멈춤 방지)
  show('sc-scene');
  step();
}

function step(){
  while(S.i < S.beats.length){
    const b = S.beats[S.i++];
    if('bg' in b){ setSceneBg(b.bg); clearPortrait(); updateLocation(b.bg); }
    if('blackout' in b){ $('#blackout').classList.toggle('on', !!b.blackout); }
    if(b.set) Object.assign(S.flags, b.set);                         // 플래그 지정
    if(b.add) for(const k in b.add) S.flags[k]=(S.flags[k]||0)+b.add[k];  // 누적(가중치)
    // bgm/se: 오디오 에셋 없음 — 무시 (추후 연결). tint/color: 사용 안 함(사용자가 배경 이미지에 직접)

    if(b.quest){ setGoal(b.quest); continue; }
    if(b.note){ addNote(b.note.title, b.note.body); continue; }
    if(b.unlockUI){ S.uiUnlocked=true; revealUI(); showTutorial(); continue; }
    if('goto' in b){ runScene(b.goto); return; }
    if(b.hub){ finishToHub(b.incomplete); return; }
    if(b.end){ actEnd(); return; }
    if(b.evalEnding){ runScene(evaluateEnding()); return; }   // 누적 분기 평가 → 해당 엔딩 씬으로
    if(b.ending){ showEnding(b.ending); return; }             // 엔딩 카드(처음부터 다시)

    if(b.combine){ showCombine(b.combine); return; }              // blocking (사색 — 단서 조합)
    if(b.interrogate){ showInterrogate(b.interrogate); return; }  // blocking (추궁 — 단서 카드)
    if(b.reInterrogate){ renderInterrogate(); return; }           // 카드 반응 후 메뉴 복귀
    if(b.clue){ showClue(b.clue); return; }                       // blocking
    if(b.options){ showChoices(b); return; }                      // blocking
    if(('text' in b) || ('who' in b)){ renderLine(b); return; }   // blocking
    // 그 외(bg/tint/blackout 전용 비트)는 즉시 다음으로
  }
}

/* ── 타이핑 효과 ── */
function typeText(el, text){
  clearInterval(_typeTimer); _typeTimer=null; _typeFull=text;
  if(S.textSpeed<=0){ el.textContent=text; return; }      // 즉시
  el.textContent='';
  let i=0;
  _typeTimer=setInterval(()=>{ el.textContent=text.slice(0, ++i);
    if(i>=text.length){ clearInterval(_typeTimer); _typeTimer=null; } }, S.textSpeed);
}
const typingActive = ()=> _typeTimer !== null;
function finishTyping(){ if(_typeTimer){ clearInterval(_typeTimer); _typeTimer=null; $('#dlg-text').textContent=_typeFull; } }

function renderLine(b){
  $('#choices').style.display='none';
  $('#dialogue').classList.remove('compact');        // 일반 대화 땐 대화창 기본 높이 복원
  const nameEl=$('#dlg-name'), txtEl=$('#dlg-text');
  nameEl.className='dlg-name'; txtEl.className='dlg-text';
  if(!b.who){                                       // 나레이션(독백) — 캐릭터 헤더 제거
    nameEl.classList.add('narrator'); txtEl.classList.add('narrator'); nameEl.textContent='';
    clearPortrait();
  } else if(b.who==='player'){                       // 플레이어 (이름 표시, 직전 포트레이트 유지)
    nameEl.classList.add('player'); nameEl.textContent = S.playerName || '나';
  } else {                                           // 캐릭터
    const c = CH[b.who] || {name:b.who, portrait:null};
    nameEl.textContent=c.name; if(c.portrait) setPortrait(c.portrait);
  }
  typeText(txtEl, (b.text || '').replace(/\{플레이어\}/g, S.playerName || ''));
}

/* 나레이션 한 줄 (접근 안내 등) */
function renderNarration(text){
  $('#choices').style.display='none';
  const n=$('#dlg-name'), t=$('#dlg-text');
  n.className='dlg-name narrator'; t.className='dlg-text narrator'; n.textContent='';
  typeText(t, text);
}

/* 선택지 렌더 (분기 · 접근 공통) — items:[{label, onPick}] */
function renderChoices(items){
  const box=$('#choices'); box.innerHTML=''; box.style.display='flex';
  $('#dialogue').classList.add('compact');           // 선택지 뜰 땐 대화창 빈 공간 제거
  items.forEach(it=>{
    const btn=document.createElement('button'); btn.className='choice-btn'; btn.textContent=it.label;
    btn.addEventListener('click', e=>{ e.stopPropagation(); playClick(); box.style.display='none'; it.onPick(); });
    box.appendChild(btn);
  });
}

function showChoices(b){
  renderChoices(b.options.map(opt=>({
    label: opt.label,
    onPick: ()=>{ if(opt.then && opt.then.length) S.beats.splice(S.i, 0, ...opt.then); step(); }
  })));
}

/* ── 공간 선택 (허브 박스 클릭) — 항목 1개면 바로, 여러 개면 접근 리스트 ── */
function chooseLocation(loc){
  const undone = locEntries(loc).filter(e=>!S.done.has(e.scene));
  if(!undone.length) return;
  S.seenLocs.add(loc.id);          // 방문 → 펄스 중지
  S.curLoc = loc.id;
  if(undone.length===1) runScene(undone[0].scene);
  else enterLocation(loc.id);
}
/* ── 공간 접근 리스트 (대화창에 "무엇을 할까") ── */
function enterLocation(locId){
  const loc = ACT.hub.locations.find(l=>l.id===locId);
  const undone = locEntries(loc).filter(e=>!S.done.has(e.scene));
  if(!undone.length){ S.curLoc=null; showHub(); return; }
  S.curLoc = locId;
  const onScene = $('#sc-scene').classList.contains('active');   // 이미 씬이면 페이드, 허브에서 진입이면 즉시
  if(loc.bg){ (onScene ? setSceneBg : setSceneBgInstant)(loc.bg); updateLocation(loc.bg); }
  hidePortraitInstant();
  show('sc-scene');
  const defaultPrompt = loc.talks ? `${loc.name}. 손님들이 여전히 대화를 나누고 있다.\n누구에게 다가갈까.` : `${loc.name}.`;
  renderNarration(loc.prompt || defaultPrompt);
  const items = undone.map(e=>({ label:e.label, onPick:()=>runScene(e.scene) }));
  items.push({ label:'다른 공간을 둘러본다', onPick:()=>{ S.curLoc=null; showHub(); } });
  renderChoices(items);
}

function showClue(id){
  const c = CL[id]; if(!c){ step(); return; }
  const ov=$('#clue-overlay'), img=$('#clue-img');
  if(c.img){ img.src=c.img; img.style.display='block'; } else { img.style.display='none'; }
  $('#clue-title').textContent=c.title;
  $('#clue-desc').textContent=c.desc||'';
  ov.classList.add('show');
  if(!S.clues.some(x=>x.id===id)){ S.clues.push({id, ...c}); renderInv(); }
  addNote(c.title, c.desc||'');
  ov.onclick = ()=>{ playClick(); ov.classList.remove('show'); ov.onclick=null; step(); };
}

/* ── 사색: 단서 조합 ──
   items는 clue(획득 단서) 또는 flag(증언·목격 등 노트성 단서) 조건으로 가용 여부 결정.
   정답 조합마다 perCombo 누적(도달 조합 수 × 1) → ACT3 엔딩 평가에 반영. */
let _cb = null;
const pairKey = (a,b) => [a,b].sort().join('|');

function cbAvailable(it){
  if(it.clue && !S.clues.some(c=>c.id===it.clue)) return false;
  if(it.flag && !S.flags[it.flag]) return false;
  return true;
}
function cbLabel(id){ const it=_cb.items.find(x=>x.id===id); return it ? it.label : id; }
/* 지금 가진 단서로 성립 가능한 조합만 분모에 셈 (못 가진 단서의 조합은 애초에 안 보임) */
function cbPairs(){ const ids=new Set(_cb.items.map(i=>i.id));
  return _cb.cfg.pairs.filter(p=>ids.has(p.a)&&ids.has(p.b)); }

function showCombine(cfg){
  _cb = { cfg, items: cfg.items.filter(cbAvailable), sel: [], found: new Set(), fails: 0 };
  $('#cb-title').textContent = cfg.title || '수사 노트';
  $('#cb-close').textContent = cfg.closeLabel || '수사 노트를 덮는다';
  $('#cb-result').className = 'cb-result';
  renderCombine();
  $('#combine').classList.add('show');
}

function renderCombine(){
  const c=_cb;
  $('#cb-prog').textContent = `이어진 단서 ${c.found.size} / ${cbPairs().length}`;
  [0,1].forEach(i=>{ const el=$('#cb-slot'+i);
    el.textContent = c.sel[i] ? cbLabel(c.sel[i]) : (i===0?'첫 번째 단서':'두 번째 단서');
    el.classList.toggle('filled', !!c.sel[i]); });
  const linked = new Set();                       // 이미 이어진 조합에 쓰인 단서 표시
  c.found.forEach(k => k.split('|').forEach(id=>linked.add(id)));
  const g=$('#cb-grid'); g.innerHTML='';
  c.items.forEach(it=>{
    const b=document.createElement('button');
    b.className='cb-item' + (c.sel.includes(it.id)?' sel':'') + (linked.has(it.id)?' linked':'');
    b.innerHTML = `<div class="cb-il">${esc(it.label)}</div><div class="cb-is">${esc(it.sub||'')}</div>`;
    b.addEventListener('click', e=>{ e.stopPropagation(); playClick(); pickCombine(it.id); });
    g.appendChild(b);
  });
}

function pickCombine(id){
  const c=_cb;
  const at=c.sel.indexOf(id);
  if(at>=0){ c.sel.splice(at,1); renderCombine(); return; }   // 다시 누르면 해제
  if(c.sel.length>=2) return;
  c.sel.push(id);
  renderCombine();
  if(c.sel.length===2) evalCombine();
}

function cbResult(lines, ok, title, hint){
  const r=$('#cb-result');
  r.className = 'cb-result show' + (ok?' ok':'');
  r.innerHTML = (title ? `<div class="cb-rt">${esc(title)}</div>` : '')
    + lines.map(t=>`<div class="cb-rl">${esc(t)}</div>`).join('')
    + (hint ? `<div class="cb-rh">${esc(hint)}</div>` : '');
}

function evalCombine(){
  const c=_cb, key=pairKey(c.sel[0], c.sel[1]);
  const pair = c.cfg.pairs.find(p=>pairKey(p.a,p.b)===key);
  if(pair){
    if(c.found.has(key)) cbResult(['이미 이어 놓은 단서다.'], false);
    else{
      c.found.add(key);
      if(c.cfg.perCombo) for(const k in c.cfg.perCombo) S.flags[k]=(S.flags[k]||0)+c.cfg.perCombo[k];
      if(pair.note) addNote(pair.note.title, pair.note.body);
      cbResult(pair.lines, true, pair.title);
    }
  }else{
    c.fails++;
    const w = (c.cfg.wrong||[]).find(p=>pairKey(p.a,p.b)===key);
    const lines = (w ? w.lines : (c.cfg.wrongDefault || ['…이 둘은, 아직 이어지지 않는다.'])).slice();
    let hint=null;
    if(c.fails >= (c.cfg.hintAfter||3)){                       // 반복 실패 → 가벼운 유도
      const un = cbPairs().find(p=>!c.found.has(pairKey(p.a,p.b)));
      if(un && un.hint) hint = un.hint;
    }
    cbResult(lines, false, null, hint);
  }
  c.sel=[]; renderCombine();
}

function closeCombine(){ $('#combine').classList.remove('show'); _cb=null; step(); }

/* ── 추궁: 단서 카드 선택 ──
   round:true = 필수 라운드(순서 무관) / lockRounds:N = N개 제시해야 해금되는 결정타
   그 외 카드는 오답(무관한 단서) — 상대가 받아넘기고 1회만 제시 가능. */
let _ig = null;
function showInterrogate(cfg){ _ig={ cfg, used:new Set(), rounds:0 }; renderInterrogate(); }
function hideInterrogate(){ $('#interro').classList.remove('show'); }

function igVisible(card){
  if(card.clue && !S.clues.some(c=>c.id===card.clue)) return false;   // 못 가진 단서는 아예 안 보임
  if(card.flag && !S.flags[card.flag]) return false;
  return true;
}
function renderInterrogate(){
  const ig=_ig, cfg=ig.cfg;
  $('#choices').style.display='none';
  $('#dialogue').classList.add('compact');
  $('#ig-prompt').textContent = cfg.prompt || '무엇을 내밀 것인가';
  $('#ig-prog').textContent   = `제시 ${ig.rounds} / ${cfg.rounds}`;
  const g=$('#ig-grid'); g.innerHTML='';
  cfg.cards.filter(igVisible).forEach(card=>{
    const locked = !!card.lockRounds && ig.rounds < card.lockRounds;
    const used   = ig.used.has(card.id);
    const b=document.createElement('button');
    b.className = 'ig-card' + (used?' used':'') + (locked?' locked':'')
                + (card.lockRounds && !locked && !used ? ' key':'');
    b.innerHTML = `<div class="ig-cl">${locked?'🔒 ':''}${esc(card.label)}</div>`
                + `<div class="ig-cs">${esc(locked ? (card.lockedSub||'') : (card.sub||''))}</div>`;
    if(!locked && !used) b.addEventListener('click', e=>{ e.stopPropagation(); playClick(); pickInterrogate(card); });
    g.appendChild(b);
  });
  $('#interro').classList.add('show');
}
function pickInterrogate(card){
  const ig=_ig;
  const beats = JSON.parse(JSON.stringify(card.beats||[]));
  ig.used.add(card.id);
  if(card.round) ig.rounds++;
  if(!card.lockRounds) beats.push({ reInterrogate:true });   // 결정타가 아니면 메뉴로 복귀
  hideInterrogate();
  S.beats.splice(S.i, 0, ...beats);
  step();
}

/* ── hub ── */
function finishToHub(incomplete){
  if(S.scene && !incomplete) S.done.add(S.scene);  // 방금 끝낸 씬 완료 기록(incomplete면 미완료 유지 — 재진입 가능)
  updateGoal();
  if(checkTriggers()) return;                       // 게이팅 트리거 우선
  if(ACT.hub.onComplete && allHubScenes().length && allHubScenes().every(s=>S.done.has(s))){
    S.curLoc=null; runScene(ACT.hub.onComplete); return;       // 모든 항목 완료 → 다음(ACT1: 살인)
  }
  if(S.curLoc){ enterLocation(S.curLoc); return; }  // 같은 공간 리스트로 복귀
  showHub();
}

function showHub(){
  const h=ACT.hub;
  captureCheckpoint('__hub__');   // 허브(씬 사이) — 불러오기 시 재생 없이 허브로 복귀
  setBg($('#hub-bg'), h.background);
  $('#hub-title').textContent = h.title;
  const showCount = !!h.onComplete;     // ACT1처럼 전부 완료가 목표인 경우만 카운터 노출
  $('#hub-sub').textContent = (h.subtitle||'') + (showCount ? `   (${doneHubCount()}/${allHubScenes().length})` : '');
  const list=$('#hub-list'); list.innerHTML='';
  h.locations.forEach(loc=>{
    const locked = loc.lock && !S.flags[loc.lock];
    const undone = locked ? [] : locEntries(loc).filter(e=>!S.done.has(e.scene));
    const box=document.createElement('button');
    const isNew = !locked && undone.length && !S.seenLocs.has(loc.id);   // 안 가본 열린 공간
    box.className='hub-box' + ((locked || !undone.length) ? ' done' : '') + (isNew ? ' pulse' : '');
    box.textContent = loc.name;
    if(!locked && undone.length){ box.addEventListener('click', ()=> chooseLocation(loc)); }
    list.appendChild(box);
  });
  show('sc-hub');
}

/* ── quest / notes / inventory ── */
let _toastTimer=null;
function showToast(text){
  const t=$('#toast'); if(!t) return; t.textContent=text; t.classList.add('show');
  clearTimeout(_toastTimer); _toastTimer=setTimeout(()=>t.classList.remove('show'), 2600);
}
function setGoal(q){
  if(q.action==='complete' && S.goal && S.goal.id===q.id){ S.goal={...S.goal, done:true}; }
  else { S.goal={id:q.id, label:q.label, done:q.action==='complete'};
    if(q.action!=='complete') showToast('새 목표 · ' + q.label); }   // 목표 바뀔 때 짧은 알림
  updateGoal();
}
function updateGoal(){
  if(!S.goal){ $('#goal-text').textContent='—'; $('#goal-prog').textContent=''; return; }
  $('#goal-text').textContent = S.goal.label || '';
  let p='';
  if(S.goal.done) p='완료 ✓';
  else if(S.goal.id==='M1-1') p=`${doneHubCount()} / ${allHubScenes().length}`;
  $('#goal-prog').textContent = p;
}

function addNote(t,b){ S.notes.push({t,b}); renderNotes(); }
function renderNotes(){
  const body=$('#notes-body'); if(!body) return;
  body.innerHTML = S.notes.length
    ? S.notes.map(n=>`<div class="note-item"><div class="nt">${esc(n.t)}</div><div class="nb">${esc(n.b)}</div></div>`).join('')
    : '<div class="panel-empty">아직 기록된 단서가 없습니다.</div>';
}
function renderInv(){
  const g=$('#inv-grid'); if(!g) return;
  g.innerHTML = S.clues.length
    ? S.clues.map(c=> c.img
        ? `<div class="inv-cell" title="${esc(c.title)}"><img src="${c.img}" alt="${esc(c.title)}"></div>`
        : `<div class="inv-cell"><span class="txt">${esc(c.title)}</span></div>`).join('')
    : '<div class="panel-empty">없음</div>';
}
function togglePanel(id){
  document.querySelectorAll('.panel').forEach(p=>{ if(p.id!==id) p.classList.remove('open'); });
  $('#'+id).classList.toggle('open');
}

/* ── act end ── */
function actEnd(){
  const nextKey = { act1:'DATA_ACT2', act2:'DATA_ACT3', act3:null }[ACT.id];
  const nextData = nextKey ? window[nextKey] : null;
  const nextNum = { act1:'ACT 2', act2:'ACT 3' }[ACT.id];
  const card=$('#act-card'), btn=$('#act-card-btn');
  $('#act-card-label').textContent = 'END OF';
  $('#act-card-recap').classList.remove('show');      // ACT 카드엔 리캡 없음(엔딩 전용)
  $('#act-card-title').classList.remove('ending-title');
  $('#act-card-title').textContent = ACT.title || 'ACT';
  if(nextData){
    $('#act-card-msg').textContent = `${nextNum}로 이어집니다.`;
    btn.textContent = `${nextNum} 계속`;
    btn.onclick = ()=>{ card.classList.remove('show'); startAct(nextData); };
  } else {
    $('#act-card-msg').textContent = '여기까지가 현재 제작된 분량입니다.';
    btn.textContent = '타이틀로';
    btn.onclick = ()=> toTitleUnderCover(card, null);
  }
  card.classList.add('show');
}

/* ── 엔딩: 누적 분기 평가 (ACT1~3 누적 플래그 기준) ──
   추리_진척도 = insight 카운터 / 관계 = relation / 알렉스 단계 = alex1·2·3 / 베라_무너짐 = vera_broken
   최종선택 = final_choice('reveal'=공개 / 'silence'=침묵)

   임계값은 실제 점수 경제 기준으로 산정(시나리오 원안 ≥8은 강제 진행분만으로 충족돼 사색④가 무의미해짐):
     강제 진행만        9   → 서브 C  (선택 대화·조합을 건너뜀)
     선택 대화 전부     12   → 서브 A  (다 돌아다녔지만 단서를 잇지 않음)
     + 조합까지        ~18   → 트루    (최대 18) */
const TH_TRUE = 14, TH_SUBA = 10;
function evaluateEnding(){
  const F=S.flags, insight=F.insight||0, relation=F.relation||0;
  const alexAll = !!(F.alex1 && F.alex2 && F.alex3);
  const alex12  = !!(F.alex1 && F.alex2);
  if(F.final_choice==='reveal'){                 // 공개
    if(alexAll && insight>=TH_TRUE) return 'end_true';        // E-01 트루
    if(alex12  && insight>=TH_SUBA) return 'end_subA';        // E-02 서브 A (허탈)
    return 'end_subC';                                        // E-04 서브 C (엉뚱한 지목)
  } else {                                        // 침묵
    if(alexAll && insight>=TH_TRUE && relation>=1) return 'end_subB';  // E-03 서브 B (공모)
    return 'end_subD';                                        // E-05 서브 D (미완성)
  }
}

/* 이 결말을 만든 선택들 — 고정 문구가 아니라 실제 플레이한 누적 플래그로 생성 */
function buildRecap(){
  const F=S.flags, rel=F.relation||0, L=[];
  if(F.tommy_empathy)     L.push('토미에게 공감으로 다가가, 그의 증언을 들었다.');
  else if(F.tommy_closed) L.push('토미를 압박했고, 그는 끝내 입을 닫았다.');
  if(F.alex1) L.push('다락의 비밀 공간을 끝까지 조사했다.');
  else        L.push('다락의 비밀 공간에는 닿지 못했다.');
  if(F.alex3) L.push('루시안의 방까지 살펴보았다.');
  if(F.alex2) L.push('집무실의 잠긴 서랍을 열었다.');
  if(F.vera_broken) L.push('응접실에서 베라의 가면을 무너뜨렸다.');
  if(rel>=1)     L.push('루시안 앞에서, 단서를 차분히 펼쳤다.');
  else if(rel<0) L.push('루시안을 직설적으로 추궁했다.');
  L.push(F.final_choice==='reveal' ? '마지막에 — 진실을 공개했다.' : '마지막에 — 진실을 묻었다.');
  return L;
}

/* 엔딩 카드(솔리드 배경, z70)로 화면을 덮은 채 타이틀로 전환.
   씬 크로스페이드(.45s)가 끝난 뒤 카드를 치워 직전 배경이 비치지 않게 한다. */
function toTitleUnderCover(card, rc){
  show('sc-title');                                  // 카드 아래에서 전환 시작
  $('#scene-bg').style.opacity='0';                  // 씬 배경도 즉시 죽여 이중 안전장치
  setTimeout(()=>{ card.classList.remove('show'); if(rc) rc.classList.remove('show'); }, 500);
}

function showEnding(e){
  const card=$('#act-card'), btn=$('#act-card-btn'), rc=$('#act-card-recap');
  $('#act-card-label').textContent = e.label || 'ENDING';   // 트루 엔딩만 TRUE ENDING
  $('#act-card-title').textContent = e.title || '엔딩';
  $('#act-card-title').classList.add('ending-title');        // 한 문장 제목 — 폭 제한·줄바꿈 허용
  $('#act-card-msg').textContent   = e.sub || '';
  rc.innerHTML = '<div class="recap-hd">이 결말을 만든 선택들</div>'
    + buildRecap().map(t=>`<div class="recap-row">· ${esc(t)}</div>`).join('')
    + `<div class="recap-stat">수집한 단서 ${S.clues.length}개</div>`;   /* 분모 미표기: 미사용 단서(white_flower 등)가 섞여 오해를 부름 */
  rc.classList.add('show');
  btn.textContent = '처음부터 다시';
  btn.onclick = ()=> toTitleUnderCover(card, rc);   // 카드로 덮은 채 전환 → 배경 잔상 방지
  card.classList.add('show');
}

/* ── 게임 시작 (이름 입력 후) — 항상 ACT1부터 ── */
function startGame(){
  const nm = ($('#name-input').value || '').trim();
  if(!nm){                                   // 이름 미입력 — 인라인 안내 + 흔들기(강제 진행 방지)
    $('#name-warn').classList.add('show');
    const inp=$('#name-input'); inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); inp.focus();
    return;
  }
  S.playerName = nm;
  if(CH.player) CH.player.name = S.playerName;
  startAct(window.DATA_ACT1);
}

/* ── input wiring ── */
function tryAdvance(){    // 대화 진행은 무음 (클릭음 없음)
  if(typingActive()){ finishTyping(); return; }     // 타이핑 중 클릭 → 즉시 완성
  if($('#choices').style.display !== 'none') return;
  if($('#clue-overlay').classList.contains('show')) return;
  if($('#combine').classList.contains('show')) return;   // 조합 UI 중엔 대화 진행 금지
  if($('#interro').classList.contains('show')) return;   // 추궁 카드 선택 중에도 금지
  if(document.querySelector('.panel.open')) return;
  step();
}
$('#cb-close').addEventListener('click', closeCombine);
$('#stage').addEventListener('click', tryAdvance);
$('#dialogue').addEventListener('click', tryAdvance);
$('#tutorial').addEventListener('click', dismissTutorial);   // 튜토리얼 클릭 시 닫기

/* 버튼류 클릭음 (선택지는 renderChoices에서 직접 처리) */
document.addEventListener('click', e=>{
  if(e.target.closest('.btn,.pro-btn,.name-ok,.hub-box,.ic-btn,.panel-close,.sys-item,.sys-close,.seg button,.sl-slot')) playClick();
});

$('#btn-start').addEventListener('click', ()=> show('sc-prologue'));        // 타이틀 → 초대장
$('#btn-title-load').addEventListener('click', loadGame);                   // 타이틀 → 불러오기
$('#btn-accept').addEventListener('click', ()=> show('sc-name'));           // 응한다 → 이름
$('#btn-decline').addEventListener('click', ()=> show('sc-title'));         // 거절 → 타이틀
$('#btn-enter').addEventListener('click', startGame);                       // 저택에 들어간다
$('#name-input').addEventListener('keydown', e=>{ if(e.key==='Enter') startGame(); });
$('#name-input').addEventListener('input', ()=> $('#name-warn').classList.remove('show'));   // 입력 시작하면 경고 해제

$('#btn-notes').addEventListener('click', ()=>togglePanel('panel-notes'));
$('#btn-inv').addEventListener('click', ()=>togglePanel('panel-inv'));
document.querySelectorAll('.panel-close').forEach(b=> b.addEventListener('click', ()=>$('#'+b.dataset.close).classList.remove('open')));

/* 시스템 메뉴 (사운드·저장·불러오기·설정 골격) */
$('#btn-menu').addEventListener('click', openMenu);
$('#sys-close').addEventListener('click', closeMenu);
$('#sys-title').addEventListener('click', ()=>{ closeMenu(); show('sc-title'); });
$('#sys-save').addEventListener('click', saveGame);
$('#sys-load').addEventListener('click', ()=>{ if(!$('#sys-load').disabled) loadGame(); });
$('#hub-menu').addEventListener('click', openMenu);                                   // 허브 우상단 ⚙
$('#sl-close').addEventListener('click', closeSaveLoad);
$('#saveload').addEventListener('click', e=>{ if(e.target.id==='saveload') closeSaveLoad(); });   // 바깥 클릭 닫기
$('#sys-sound').addEventListener('click', ()=>{          // 사운드 ON/OFF (현재 클릭음, 추후 BGM·효과음도 제어)
  S.soundOn = !S.soundOn;
  const el=$('#sound-state'); el.textContent = S.soundOn ? 'ON' : 'OFF'; el.classList.toggle('off', !S.soundOn);
});

/* 설정 (텍스트 속도 · 글자 크기) */
$('#sys-settings').addEventListener('click', ()=>{ closeMenu(); $('#settings').classList.add('show'); });
$('#set-close').addEventListener('click', ()=> $('#settings').classList.remove('show'));
$('#settings').addEventListener('click', e=>{ if(e.target.id==='settings') $('#settings').classList.remove('show'); });
$('#seg-speed').addEventListener('click', e=>{ const b=e.target.closest('button[data-speed]'); if(!b) return;
  S.textSpeed = +b.dataset.speed;
  [...$('#seg-speed').children].forEach(x=>x.classList.toggle('on', x===b)); });
$('#seg-font').addEventListener('click', e=>{ const b=e.target.closest('button[data-font]'); if(!b) return;
  const g=document.getElementById('game'); g.classList.remove('fs-sm','fs-lg');
  if(b.dataset.font==='sm') g.classList.add('fs-sm'); else if(b.dataset.font==='lg') g.classList.add('fs-lg');
  [...$('#seg-font').children].forEach(x=>x.classList.toggle('on', x===b)); });
$('#sysmenu').addEventListener('click', e=>{ if(e.target.id==='sysmenu') closeMenu(); });   // 바깥 클릭 시 닫기

boot();
