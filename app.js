/**
 * バレーボール ローテーション アプリ
 * 8人制（9人制対応）スマホ最適化
 */

// カラーパレット定義
const COLOR_PRESETS = [
  '#2563eb', // ブルー
  '#dc2626', // レッド
  '#16a34a', // グリーン
  '#d97706', // オレンジ
  '#7c3aed', // パープル
  '#0d9488', // ティール
  '#db2777', // ピンク
  '#475569', // グレー
  '#0284c7'  // ライトブルー
];

// 8人制のデフォルトメンバー（エクセル作戦ボードver.2.xlsm「8人」シート準拠）
const DEFAULT_MEMBERS_8 = [
  { id: 1, number: 1, name: 'まみ', role: 'ライト', color: '#2563eb' },
  { id: 2, number: 2, name: 'かよ', role: '中ライト', color: '#2563eb' },
  { id: 3, number: 3, name: 'まっちゃん', role: '前ライト', color: '#2563eb' },
  { id: 4, number: 4, name: 'じゅん', role: '前センター', color: '#2563eb' },
  { id: 5, number: 5, name: 'ゆみ', role: '前レフト', color: '#2563eb' },
  { id: 6, number: 6, name: 'ゆうき', role: '中レフト', color: '#2563eb' },
  { id: 7, number: 7, name: 'ほっしー', role: '後レフト', color: '#2563eb' },
  { id: 8, number: 8, name: 'つく', role: '中センター', color: '#2563eb' }
];

// 9人制のデフォルトメンバー（エクセル「9人」シート準拠）
const DEFAULT_MEMBERS_9 = [
  { id: 1, number: 1, name: 'つく', role: 'ライト', color: '#2563eb' },
  { id: 2, number: 2, name: 'のり', role: '中ライト', color: '#2563eb' },
  { id: 3, number: 3, name: 'まつ', role: '前ライト', color: '#2563eb' },
  { id: 4, number: 4, name: 'はる', role: '前センター', color: '#2563eb' },
  { id: 5, number: 5, name: 'じゅん', role: '前レフト', color: '#2563eb' },
  { id: 6, number: 6, name: 'ゴッツ', role: '中レフト', color: '#2563eb' },
  { id: 7, number: 7, name: 'みさき', role: '後レフト', color: '#2563eb' },
  { id: 8, number: 8, name: 'ゆうき', role: '後センター', color: '#2563eb' },
  { id: 9, number: 9, name: 'ほっし', role: '中センター', color: '#2563eb' }
];

// コート上のポジション座標（ネットが上、エンドラインが下）
const POSITIONS_8 = {
  // 前衛3人 (Row 14)
  5: { top: 18, left: 20, name: '前レフト' },
  4: { top: 18, left: 50, name: '前センター' },
  3: { top: 18, left: 80, name: '前ライト' },
  // 中衛3人 (Row 18)
  6: { top: 48, left: 20, name: '中レフト' },
  8: { top: 48, left: 50, name: '中センター' },
  2: { top: 48, left: 80, name: '中ライト' },
  // 後衛2人 (Row 22)
  7: { top: 78, left: 32, name: '後レフト' },
  1: { top: 78, left: 68, name: '後ライト(サーブ)' }
};

const POSITIONS_9 = {
  // 前衛3人
  5: { top: 18, left: 20, name: '前レフト' },
  4: { top: 18, left: 50, name: '前センター' },
  3: { top: 18, left: 80, name: '前ライト' },
  // 中衛3人
  6: { top: 48, left: 20, name: '中レフト' },
  9: { top: 48, left: 50, name: '中センター' },
  2: { top: 48, left: 80, name: '中ライト' },
  // 後衛3人
  7: { top: 78, left: 20, name: '後レフト' },
  8: { top: 78, left: 50, name: '後センター' },
  1: { top: 78, left: 80, name: '後ライト(サーブ)' }
};

// 控えメンバー（5名）のデフォルト定義
const DEFAULT_BENCH = [
  { id: 'bench-1', number: 10, name: '', role: '控え', color: '#2563eb' },
  { id: 'bench-2', number: 11, name: '', role: '控え', color: '#2563eb' },
  { id: 'bench-3', number: 12, name: '', role: '控え', color: '#2563eb' },
  { id: 'bench-4', number: 13, name: '', role: '控え', color: '#2563eb' },
  { id: 'bench-5', number: 14, name: '', role: '控え', color: '#2563eb' }
];

function ensureBenchMembers(benchList) {
  const result = Array.isArray(benchList) ? JSON.parse(JSON.stringify(benchList)) : [];
  while (result.length < 5) {
    const nextIdx = result.length + 1;
    result.push({
      id: `bench-${Date.now()}-${nextIdx}`,
      number: 10 + result.length,
      name: '',
      role: '控え',
      color: '#2563eb'
    });
  }
  return result.slice(0, 5);
}

// 欠席メンバー（20名枠）のデフォルト定義
const DEFAULT_ABSENT = Array.from({ length: 20 }, (_, i) => ({
  id: `absent-${i + 1}`,
  number: '',
  name: '',
  role: '欠席',
  color: '#2563eb'
}));

function ensureAbsentMembers(absentList) {
  const result = Array.isArray(absentList) ? JSON.parse(JSON.stringify(absentList)) : [];
  while (result.length < 20) {
    const nextIdx = result.length + 1;
    result.push({
      id: `absent-${Date.now()}-${nextIdx}`,
      number: '',
      name: '',
      role: '欠席',
      color: '#2563eb'
    });
  }
  return result.slice(0, 20);
}

// 本番公開URL (Vercel)
const PRODUCTION_URL = 'https://amado-rotation.vercel.app';

// アプリ全体の状態
const state = {
  mode: 8, // 8 or 9
  rotationIndex: 0, // 0 〜 (mode - 1)
  matchDate: '20260216',
  matchTitle: '長作招待',
  members: JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8)),
  bench: JSON.parse(JSON.stringify(DEFAULT_BENCH)),
  absent: JSON.parse(JSON.stringify(DEFAULT_ABSENT)),
  editingMemberId: null
};

// DOM要素
const elements = {
  mode8Btn: document.getElementById('mode8Btn'),
  mode9Btn: document.getElementById('mode9Btn'),
  matchDate: document.getElementById('matchDate'),
  matchTitle: document.getElementById('matchTitle'),
  saveBtn: document.getElementById('saveBtn'),
  historyBtn: document.getElementById('historyBtn'),
  savedCount: document.getElementById('savedCount'),
  exportImgBtn: document.getElementById('exportImgBtn'),
  editMembersBtn: document.getElementById('editMembersBtn'),
  shareAppBtn: document.getElementById('shareAppBtn'),
  rotationBadge: document.getElementById('rotationBadge'),
  servingBadge: document.getElementById('servingBadge'),
  serverName: document.getElementById('serverName'),
  courtContainer: document.getElementById('courtContainer'),
  playersContainer: document.getElementById('playersContainer'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  resetBtn: document.getElementById('resetBtn'),
  // 選手モーダル
  playerModal: document.getElementById('playerModal'),
  closePlayerModal: document.getElementById('closePlayerModal'),
  modalPlayerTitle: document.getElementById('modalPlayerTitle'),
  editPlayerName: document.getElementById('editPlayerName'),
  editPlayerNumber: document.getElementById('editPlayerNumber'),
  editPlayerPos: document.getElementById('editPlayerPos'),
  colorPalette: document.getElementById('colorPalette'),
  savePlayerModalBtn: document.getElementById('savePlayerModalBtn'),
  // メンバー一括編集モーダル
  membersModal: document.getElementById('membersModal'),
  closeMembersModal: document.getElementById('closeMembersModal'),
  membersEditList: document.getElementById('membersEditList'),
  saveMembersModalBtn: document.getElementById('saveMembersModalBtn'),
  // 保存一覧モーダル
  historyModal: document.getElementById('historyModal'),
  closeHistoryModal: document.getElementById('closeHistoryModal'),
  closeHistoryModalBtn: document.getElementById('closeHistoryModalBtn'),
  historyList: document.getElementById('historyList'),
  // 共有URLモーダル
  shareModal: document.getElementById('shareModal'),
  closeShareModal: document.getElementById('closeShareModal'),
  closeShareModalBtn: document.getElementById('closeShareModalBtn'),
  shareUrlInput: document.getElementById('shareUrlInput'),
  copyUrlBtn: document.getElementById('copyUrlBtn'),
  qrCodeWrapper: document.getElementById('qrCodeWrapper'),
  exportCanvas: document.getElementById('exportCanvas')
};

// 初期化
function init() {
  loadSavedData();
  setupEventListeners();
  renderCourt();
  updateHistoryBadge();
}

// イベントリスナー設定
function setupEventListeners() {
  // モード切替
  elements.mode8Btn.addEventListener('click', () => switchMode(8));
  elements.mode9Btn.addEventListener('click', () => switchMode(9));

  // 大会情報変更（入力値の状態同期のみ、自動保存はしない）
  elements.matchDate.addEventListener('input', (e) => {
    state.matchDate = e.target.value;
  });
  elements.matchTitle.addEventListener('input', (e) => {
    state.matchTitle = e.target.value;
  });

  // ローテーション操作
  elements.nextBtn.addEventListener('click', nextRotation);
  elements.prevBtn.addEventListener('click', prevRotation);
  elements.resetBtn.addEventListener('click', resetRotation);

  // 保存・読込・画像出力・共有
  elements.saveBtn.addEventListener('click', saveCurrentMatch);
  elements.historyBtn.addEventListener('click', openHistoryModal);
  elements.exportImgBtn.addEventListener('click', handleSaveWithFilePicker);
  elements.editMembersBtn.addEventListener('click', openMembersModal);
  elements.shareAppBtn.addEventListener('click', openShareModal);

  // モーダル閉じる
  elements.closePlayerModal.addEventListener('click', closePlayerModal);
  elements.savePlayerModalBtn.addEventListener('click', savePlayerModal);
  elements.closeMembersModal.addEventListener('click', closeMembersModal);
  elements.saveMembersModalBtn.addEventListener('click', saveMembersModal);
  elements.closeHistoryModal.addEventListener('click', closeHistoryModal);
  elements.closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
  elements.closeShareModal.addEventListener('click', closeShareModal);
  elements.closeShareModalBtn.addEventListener('click', closeShareModal);
  elements.copyUrlBtn.addEventListener('click', copyShareUrl);

  // モーダル外側クリックで閉じる
  [elements.playerModal, elements.membersModal, elements.historyModal, elements.shareModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // カラーパレット生成
  renderColorPalette();
}

// モード切替（8人制 / 9人制）
function switchMode(newMode) {
  if (state.mode === newMode) return;
  state.mode = newMode;
  state.rotationIndex = 0;

  if (newMode === 8) {
    elements.mode8Btn.classList.add('active');
    elements.mode9Btn.classList.remove('active');
    state.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8));
  } else {
    elements.mode8Btn.classList.remove('active');
    elements.mode9Btn.classList.add('active');
    state.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS_9));
  }
  state.bench = ensureBenchMembers(state.bench);
  state.absent = ensureAbsentMembers(state.absent);

  renderCourt();
  showToast(`${newMode}人制モードに切り替えました`);
}

// ローテーション進む (エクセルのローテ8()準拠)
function nextRotation() {
  state.rotationIndex = (state.rotationIndex + 1) % state.mode;
  renderCourt();
}

// ローテーション戻る
function prevRotation() {
  state.rotationIndex = (state.rotationIndex - 1 + state.mode) % state.mode;
  renderCourt();
}

// ローテーションリセット
function resetRotation() {
  state.rotationIndex = 0;
  renderCourt();
  showToast('初期ローテーションにリセットしました');
}

/**
 * 日付文字列から確実に8桁の数字（YYYYMMDD）を生成する関数
 */
function formatDateTo8Digits(dateStr) {
  if (!dateStr || !dateStr.trim()) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  const s = dateStr.trim();
  // すでに8桁の数字ならそのまま返す
  if (/^\d{8}$/.test(s)) {
    return s;
  }

  // YYYY-MM-DD や YYYY/MM/DD などの形式
  const ymdMatch = s.match(/(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = String(ymdMatch[2]).padStart(2, '0');
    const d = String(ymdMatch[3]).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  // 「X月Y日」または「X/Y」の形式
  const mdMatch = s.match(/(\d{1,2})[月/\-](\d{1,2})/);
  if (mdMatch) {
    const y = new Date().getFullYear();
    const m = String(mdMatch[1]).padStart(2, '0');
    const d = String(mdMatch[2]).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  // 数字だけを抽出
  const digits = s.replace(/\D/g, '');
  if (digits.length === 8) return digits;
  if (digits.length === 4) { // 例: 0216
    return `${new Date().getFullYear()}${digits}`;
  }

  // フォールバック（現在日付）
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * コートと選手バッジのレンダリング
 */
function renderCourt() {
  const total = state.mode;
  const currentNum = state.rotationIndex + 1;
  elements.rotationBadge.textContent = `ローテーション ${currentNum} / ${total}`;

  const positions = state.mode === 8 ? POSITIONS_8 : POSITIONS_9;
  elements.playersContainer.innerHTML = '';

  let currentServerName = '';

  for (let posNum = 1; posNum <= total; posNum++) {
    const memberIndex = (posNum - 1 + state.rotationIndex) % total;
    const member = state.members[memberIndex];
    const posCoord = positions[posNum];

    if (!member || !posCoord) continue;

    const isServing = (posNum === 1);
    if (isServing) {
      currentServerName = `${member.name} (${member.number}番)`;
    }

    const card = document.createElement('div');
    card.className = `player-card ${isServing ? 'is-serving' : ''}`;
    card.style.top = `${posCoord.top}%`;
    card.style.left = `${posCoord.left}%`;
    card.setAttribute('data-member-id', member.id);

    card.innerHTML = `
      <div class="player-badge" style="background-color: ${member.color || '#2563eb'};">
        <span class="player-number">${member.number}</span>
      </div>
      <div class="player-name-label">${escapeHtml(member.name)}</div>
    `;

    card.addEventListener('click', () => {
      openPlayerModal(member.id);
    });

    elements.playersContainer.appendChild(card);
  }

  elements.serverName.textContent = currentServerName;
}

// 選手個別編集モーダル
function openPlayerModal(memberId) {
  const member = state.members.find(m => m.id === memberId);
  if (!member) return;

  state.editingMemberId = memberId;
  elements.modalPlayerTitle.textContent = `選手編集: #${member.number} ${member.name}`;
  elements.editPlayerName.value = member.name;
  elements.editPlayerNumber.value = member.number;
  elements.editPlayerPos.value = member.role || '';

  selectColorChip(member.color || '#2563eb');
  elements.playerModal.style.display = 'flex';
}

function closePlayerModal() {
  elements.playerModal.style.display = 'none';
  state.editingMemberId = null;
}

function savePlayerModal() {
  if (state.editingMemberId === null) return;
  const member = state.members.find(m => m.id === state.editingMemberId);
  if (!member) return;

  const newName = elements.editPlayerName.value.trim();
  const newNum = parseInt(elements.editPlayerNumber.value, 10);
  const newRole = elements.editPlayerPos.value.trim();
  const selectedChip = elements.colorPalette.querySelector('.color-chip.selected');
  const newColor = selectedChip ? selectedChip.dataset.color : member.color;

  if (newName) member.name = newName;
  if (!isNaN(newNum)) member.number = newNum;
  member.role = newRole;
  member.color = newColor;

  closePlayerModal();
  renderCourt();
  showToast('選手情報を更新しました');
}

// カラーパレット
function renderColorPalette() {
  elements.colorPalette.innerHTML = '';
  COLOR_PRESETS.forEach(color => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.style.backgroundColor = color;
    chip.dataset.color = color;
    chip.addEventListener('click', () => {
      selectColorChip(color);
    });
    elements.colorPalette.appendChild(chip);
  });
}

function selectColorChip(targetColor) {
  const chips = elements.colorPalette.querySelectorAll('.color-chip');
  chips.forEach(chip => {
    if (chip.dataset.color.toLowerCase() === targetColor.toLowerCase()) {
      chip.classList.add('selected');
    } else {
      chip.classList.remove('selected');
    }
  });
}

// メンバーモーダル編集用の作業配列と状態
let modalWorkingList = [];
let dragSourceIdx = null;

// メンバー一括編集モーダルを開く
function openMembersModal() {
  state.bench = ensureBenchMembers(state.bench);
  state.absent = ensureAbsentMembers(state.absent);

  // 出場メンバー (mode名) + 控えメンバー (5名) + 欠席メンバー (20名) を結合
  modalWorkingList = [
    ...JSON.parse(JSON.stringify(state.members)),
    ...JSON.parse(JSON.stringify(state.bench)),
    ...JSON.parse(JSON.stringify(state.absent))
  ];

  renderMembersEditList();
  elements.membersModal.style.display = 'flex';
}

function closeMembersModal() {
  closeColorPickerPopover();
  elements.membersModal.style.display = 'none';
}

// メンバー編集リストのレンダリング
function renderMembersEditList() {
  closeColorPickerPopover();
  elements.membersEditList.innerHTML = '';

  // 出場メンバーセクションラベル
  const activeLabel = document.createElement('div');
  activeLabel.className = 'members-section-label';
  activeLabel.textContent = `🏐 出場メンバー (${state.mode}名)`;
  elements.membersEditList.appendChild(activeLabel);

  modalWorkingList.forEach((m, idx) => {
    // 控えメンバー（8人制なら9番目〜、9人制なら10番目〜）の直前に控えラベル
    if (idx === state.mode) {
      const benchLabel = document.createElement('div');
      benchLabel.className = 'members-section-label bench-label';
      benchLabel.textContent = '🪑 控えメンバー (5名)';
      elements.membersEditList.appendChild(benchLabel);
    }

    // 欠席メンバー（控えの直後）の直前に欠席ラベル
    if (idx === state.mode + 5) {
      const absentLabel = document.createElement('div');
      absentLabel.className = 'members-section-label absent-label';
      absentLabel.textContent = '🏠 欠席メンバー (20名)';
      elements.membersEditList.appendChild(absentLabel);
    }

    const isBench = (idx >= state.mode && idx < state.mode + 5);
    const isAbsent = (idx >= state.mode + 5);
    const row = document.createElement('div');
    row.className = `member-edit-row ${isBench ? 'bench-row' : ''} ${isAbsent ? 'absent-row' : ''}`;
    row.setAttribute('data-idx', idx);
    row.draggable = true;

    // 通し番号（出場メンバーは1〜8/9、控え・欠席メンバーは番号なし）
    const idxText = (!isBench && !isAbsent) ? `${idx + 1}` : '';
    let placeholderText = '選手名';
    if (isBench) placeholderText = '控え選手名';
    if (isAbsent) placeholderText = `欠席選手名`;

    row.innerHTML = `
      <div class="drag-handle" title="ドラッグして並び替え・入替">☰</div>
      <span class="member-idx ${isBench ? 'bench-idx' : ''} ${isAbsent ? 'absent-idx' : ''}">${idxText}</span>
      <input type="text" class="edit-name" value="${escapeHtml(m.name || '')}" maxlength="10" placeholder="${placeholderText}">
      <button type="button" class="edit-color-btn" style="background-color: ${m.color || '#2563eb'};" title="カラー変更"></button>
    `;

    const nameInput = row.querySelector('.edit-name');
    nameInput.addEventListener('input', (e) => {
      modalWorkingList[idx].name = e.target.value;
    });

    // カラー変更ボタン
    const colorBtn = row.querySelector('.edit-color-btn');
    colorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openColorPickerPopover(colorBtn, idx);
    });

    // ドラッグ＆ドロップ（PC・スマホ両対応）
    setupDragAndDropEvents(row, idx);

    elements.membersEditList.appendChild(row);
  });
}

// 入力欄の現在の値を modalWorkingList に同期
function syncWorkingListFromInputs() {
  const rows = elements.membersEditList.querySelectorAll('.member-edit-row');
  rows.forEach((row) => {
    const idx = parseInt(row.getAttribute('data-idx'), 10);
    if (!isNaN(idx) && modalWorkingList[idx]) {
      const nameInput = row.querySelector('.edit-name');
      if (nameInput) {
        modalWorkingList[idx].name = nameInput.value;
      }
    }
  });
}

// メンバーの入れ替え（スワップ）
function swapMembers(fromIdx, toIdx) {
  if (fromIdx === toIdx || fromIdx == null || toIdx == null) return;
  syncWorkingListFromInputs();
  const temp = modalWorkingList[fromIdx];
  modalWorkingList[fromIdx] = modalWorkingList[toIdx];
  modalWorkingList[toIdx] = temp;
  renderMembersEditList();
}

// ドラッグ＆ドロップイベント設定（PC＆スマホ両対応）
function setupDragAndDropEvents(row, idx) {
  // --- PC / マウス用 (HTML5 Drag and Drop) ---
  row.addEventListener('dragstart', (e) => {
    syncWorkingListFromInputs();
    dragSourceIdx = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    setTimeout(() => row.classList.add('is-dragging'), 0);
  });

  row.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (dragSourceIdx !== null && dragSourceIdx !== idx) {
      row.classList.add('drag-over');
    }
  });

  row.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  row.addEventListener('dragleave', () => {
    row.classList.remove('drag-over');
  });

  row.addEventListener('drop', (e) => {
    e.preventDefault();
    row.classList.remove('drag-over');
    if (dragSourceIdx !== null && dragSourceIdx !== idx) {
      swapMembers(dragSourceIdx, idx);
    }
  });

  row.addEventListener('dragend', () => {
    document.querySelectorAll('.member-edit-row').forEach(r => {
      r.classList.remove('is-dragging', 'drag-over');
    });
    dragSourceIdx = null;
  });

  // --- スマートフォン用 (Touch Events) ---
  const handle = row.querySelector('.drag-handle');
  let currentTouchTargetIdx = null;

  handle.addEventListener('touchstart', () => {
    syncWorkingListFromInputs();
    dragSourceIdx = idx;
    row.classList.add('is-dragging');
  }, { passive: true });

  handle.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const elemUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetRow = elemUnderTouch ? elemUnderTouch.closest('.member-edit-row') : null;

    document.querySelectorAll('.member-edit-row').forEach(r => r.classList.remove('drag-over'));

    if (targetRow && targetRow !== row) {
      const targetIdx = parseInt(targetRow.getAttribute('data-idx'), 10);
      if (!isNaN(targetIdx)) {
        targetRow.classList.add('drag-over');
        currentTouchTargetIdx = targetIdx;
      }
    } else {
      currentTouchTargetIdx = null;
    }
  }, { passive: false });

  handle.addEventListener('touchend', () => {
    document.querySelectorAll('.member-edit-row').forEach(r => {
      r.classList.remove('is-dragging', 'drag-over');
    });

    if (dragSourceIdx !== null && currentTouchTargetIdx !== null && dragSourceIdx !== currentTouchTargetIdx) {
      swapMembers(dragSourceIdx, currentTouchTargetIdx);
    }
    dragSourceIdx = null;
    currentTouchTargetIdx = null;
  });
}

// カラー選択ポップオーバー
function openColorPickerPopover(anchorBtn, memberIdx) {
  closeColorPickerPopover();

  const popover = document.createElement('div');
  popover.className = 'color-picker-popover';
  popover.id = 'colorPickerPopover';

  COLOR_PRESETS.forEach(color => {
    const chip = document.createElement('div');
    chip.className = 'popover-chip';
    chip.style.backgroundColor = color;
    if (modalWorkingList[memberIdx] && modalWorkingList[memberIdx].color === color) {
      chip.classList.add('selected');
    }

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalWorkingList[memberIdx]) {
        modalWorkingList[memberIdx].color = color;
        anchorBtn.style.backgroundColor = color;
      }
      closeColorPickerPopover();
    });

    popover.appendChild(chip);
  });

  document.body.appendChild(popover);

  const rect = anchorBtn.getBoundingClientRect();
  const popoverW = 200;
  let left = rect.right - popoverW;
  if (left < 10) left = 10;
  let top = rect.bottom + 6;
  if (top + 100 > window.innerHeight) {
    top = Math.max(10, rect.top - 90);
  }

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;

  const onDocClick = (e) => {
    if (!popover.contains(e.target) && e.target !== anchorBtn) {
      closeColorPickerPopover();
      document.removeEventListener('click', onDocClick);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', onDocClick);
  }, 10);
}

function closeColorPickerPopover() {
  const pop = document.getElementById('colorPickerPopover');
  if (pop && pop.parentNode) {
    pop.parentNode.removeChild(pop);
  }
}

// 一括保存
function saveMembersModal() {
  syncWorkingListFromInputs();

  // 出場メンバー (state.mode 名)
  state.members = modalWorkingList.slice(0, state.mode).map((m, i) => ({
    id: m.id || (i + 1),
    number: m.number !== '' && !isNaN(m.number) ? parseInt(m.number, 10) : (i + 1),
    name: m.name && m.name.trim() ? m.name.trim() : `選手${i + 1}`,
    role: m.role || '',
    color: m.color || '#2563eb'
  }));

  // 控えメンバー (5名)
  state.bench = modalWorkingList.slice(state.mode, state.mode + 5).map((m, i) => ({
    id: m.id || `bench-${i + 1}`,
    number: m.number !== '' && !isNaN(m.number) ? parseInt(m.number, 10) : (10 + i),
    name: m.name ? m.name.trim() : '',
    role: '控え',
    color: m.color || '#2563eb'
  }));

  // 欠席メンバー (20名)
  state.absent = modalWorkingList.slice(state.mode + 5, state.mode + 25).map((m, i) => ({
    id: m.id || `absent-${i + 1}`,
    number: m.number !== '' && !isNaN(m.number) ? parseInt(m.number, 10) : '',
    name: m.name ? m.name.trim() : '',
    role: '欠席',
    color: m.color || '#2563eb'
  }));

  // 不足分があれば20枠まで確保
  state.absent = ensureAbsentMembers(state.absent);

  closeMembersModal();
  renderCourt();
  showToast('メンバー一覧を更新しました');
}

// 状態保存（ローカルストレージ）
const STORAGE_KEY_CURRENT = 'volleyball_rot_current';
const STORAGE_KEY_HISTORY = 'volleyball_rot_history';

// 自動保存は全廃（互換性のため空関数として保持）
function autoSaveCurrent() {}

/**
 * 起動時の保存データ読込
 * 1. URLパラメータ（?d=...）があれば共有大会データを最優先でロード
 * 2. なければローカル保存履歴（volleyball_rot_history）の最新大会をロード
 * 3. 保存履歴がなければ初期デフォルト（8人制、長作招待）をセット
 */
function loadSavedData() {
  try {
    // 1. URL共有パラメータがあるか確認
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('d');
    if (shareParam) {
      const sharedData = decodeShareData(shareParam);
      if (sharedData) {
        applySharedData(sharedData);
        showToast(`🔗 共有ローテーション「${sharedData.t || '大会'}」を開きました`);
        return;
      }
    }

    // 2. ローカル保存履歴の最新大会をロード
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      const history = JSON.parse(raw);
      if (Array.isArray(history) && history.length > 0) {
        applyMatchData(history[0]);
        return;
      }
    }

    // 旧バージョンのcurrentがあれば移行確認
    const oldCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (oldCurrent) {
      const data = JSON.parse(oldCurrent);
      applyMatchData(data);
      return;
    }

    // 3. デフォルト設定（8人制、長作招待）
    setDefaultState();
  } catch (e) {
    console.error('LoadSavedData error:', e);
    setDefaultState();
  }
}

function setDefaultState() {
  state.mode = 8;
  state.rotationIndex = 0;
  state.matchDate = '20260216';
  state.matchTitle = '長作招待';
  state.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8));
  state.bench = ensureBenchMembers(DEFAULT_BENCH);
  state.absent = ensureAbsentMembers(DEFAULT_ABSENT);

  elements.matchDate.value = state.matchDate;
  elements.matchTitle.value = state.matchTitle;
  elements.mode8Btn.classList.add('active');
  elements.mode9Btn.classList.remove('active');
}

/**
 * 保存データオブジェクトを画面およびstateに反映
 */
function applyMatchData(data) {
  state.mode = data.mode || 8;
  state.rotationIndex = data.rotationIndex || 0;
  state.matchDate = data.matchDate !== undefined ? data.matchDate : '';
  state.matchTitle = data.matchTitle !== undefined ? data.matchTitle : '';
  state.members = data.members && data.members.length ? JSON.parse(JSON.stringify(data.members)) : (state.mode === 9 ? JSON.parse(JSON.stringify(DEFAULT_MEMBERS_9)) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8)));
  state.bench = ensureBenchMembers(data.bench);
  state.absent = ensureAbsentMembers(data.absent);

  elements.matchDate.value = state.matchDate;
  elements.matchTitle.value = state.matchTitle;

  if (state.mode === 9) {
    elements.mode9Btn.classList.add('active');
    elements.mode8Btn.classList.remove('active');
  } else {
    elements.mode8Btn.classList.add('active');
    elements.mode9Btn.classList.remove('active');
  }
}

/**
 * 「💾 保存」ボタン押下時の処理：
 * ユーザーが「確定」と思った時に手動で「日付＋大会名」で保存する。
 * 同一の「日付＋大会名」なら上書き更新、新規なら先頭に追加。
 */
function saveCurrentMatch() {
  const dateStr = (elements.matchDate.value || state.matchDate || '').trim();
  const titleStr = (elements.matchTitle.value || state.matchTitle || '').trim();

  if (!dateStr || !titleStr) {
    showToast('⚠️ 日付と大会名を入力してから「保存」を押してください');
    if (!dateStr) elements.matchDate.focus();
    else elements.matchTitle.focus();
    return;
  }

  state.matchDate = dateStr;
  state.matchTitle = titleStr;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    let history = raw ? JSON.parse(raw) : [];

    const date8 = formatDateTo8Digits(dateStr);
    const itemKey = `${date8}_${titleStr}`;

    const newItem = {
      id: itemKey,
      savedAt: new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      mode: state.mode,
      rotationIndex: state.rotationIndex,
      matchDate: dateStr,
      matchTitle: titleStr,
      members: JSON.parse(JSON.stringify(state.members)),
      bench: JSON.parse(JSON.stringify(state.bench)),
      absent: JSON.parse(JSON.stringify(state.absent))
    };

    // 同名（同じ日付＋大会名）があれば上書き更新、なければ先頭に追加
    const existingIndex = history.findIndex(item => item.id === itemKey || (item.matchDate === dateStr && item.matchTitle === titleStr));
    if (existingIndex >= 0) {
      history.splice(existingIndex, 1);
      history.unshift(newItem);
    } else {
      history.unshift(newItem);
    }

    if (history.length > 50) history.pop();

    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    updateHistoryBadge();
    showToast(`💾 「${dateStr} ${titleStr}」を保存しました`);
  } catch (e) {
    console.error('Save match error:', e);
    showToast('保存に失敗しました');
  }
}

/**
 * 「📷 画像出力」ボタン押下時の処理
 */
async function handleSaveWithFilePicker() {
  const date8 = formatDateTo8Digits(state.matchDate);
  const titleClean = (state.matchTitle || '大会名未設定').replace(/[\\/:*?"<>|]/g, '');
  const fileName = `${date8}${titleClean}.png`;

  // 画像Blobを生成
  const blob = await generateCourtImageBlob();
  if (!blob) return;

  // 保存先指定 (File System Access API: Chrome / Edge 等)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'PNG画像ファイル',
          accept: { 'image/png': ['.png'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      showToast(`保存しました: ${fileName}`);
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('showSaveFilePicker error, fallback to download:', err);
    }
  }

  // モバイル共有シートが使える場合（iOS / Android）
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] })) {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      await navigator.share({
        title: `${state.matchTitle} ローテーション`,
        files: [file]
      });
      showToast('共有・保存が完了しました');
      return;
    } catch (e) {
      if (e.name !== 'AbortError') {
        downloadBlob(blob, fileName);
      }
      return;
    }
  }

  // 通常のダウンロード
  downloadBlob(blob, fileName);
}

function updateHistoryBadge() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    const history = raw ? JSON.parse(raw) : [];
    elements.savedCount.textContent = history.length;
  } catch (e) {
    elements.savedCount.textContent = '0';
  }
}

// 保存一覧（読込）モーダル
function openHistoryModal() {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
  const history = raw ? JSON.parse(raw) : [];

  elements.historyList.innerHTML = '';

  if (history.length === 0) {
    elements.historyList.innerHTML = '<div class="history-empty">保存されたローテーションはありません。<br>日付と大会名を入力し「💾 保存」を押すと保存されます。</div>';
  } else {
    history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';

      const memberNames = (item.members || []).map(m => m.name).filter(Boolean).join(' / ');

      el.innerHTML = `
        <div class="history-info">
          <div class="history-title">【${item.mode}人制】${escapeHtml(item.matchDate)} ${escapeHtml(item.matchTitle)} (Rot ${item.rotationIndex + 1})</div>
          <div class="history-date">保存日時: ${item.savedAt}</div>
          <div class="history-members">${escapeHtml(memberNames || 'メンバー設定あり')}</div>
        </div>
        <div class="history-actions">
          <button class="history-load-btn" title="この大会のローテーションを呼び出す">呼出</button>
          <button class="history-delete-btn" title="削除">削除</button>
        </div>
      `;

      el.querySelector('.history-info').addEventListener('click', () => {
        loadHistoryItem(item);
      });

      el.querySelector('.history-load-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        loadHistoryItem(item);
      });

      el.querySelector('.history-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);
      });

      elements.historyList.appendChild(el);
    });
  }

  elements.historyModal.style.display = 'flex';
}

function closeHistoryModal() {
  elements.historyModal.style.display = 'none';
}

function loadHistoryItem(item) {
  applyMatchData(item);
  closeHistoryModal();
  renderCourt();
  showToast(`📂 「${item.matchTitle}」のローテーションを呼び出しました`);
}

function deleteHistoryItem(id) {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (!raw) return;
  let history = JSON.parse(raw);
  history = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  updateHistoryBadge();
  openHistoryModal();
  showToast('保存データを削除しました');
}

/**
 * 現在表示中の大会ローテーションデータのみを抽出（他大会のデータは含めない）
 */
function createShareData() {
  // 欠席メンバー（末尾の完全空枠をトリミングしてURLサイズを節約）
  let lastNonEmpty = -1;
  const absentList = Array.isArray(state.absent) ? state.absent : [];
  for (let i = absentList.length - 1; i >= 0; i--) {
    const item = absentList[i];
    if (item && ((item.name && item.name.trim()) || (item.number !== '' && item.number !== null && item.number !== undefined))) {
      lastNonEmpty = i;
      break;
    }
  }
  const shareAbsent = (lastNonEmpty >= 0 ? absentList.slice(0, lastNonEmpty + 1) : []).map(m => ({
    n: m.name || '',
    num: m.number !== undefined && m.number !== null ? m.number : '',
    c: m.color || '#2563eb'
  }));

  return {
    v: 1,
    m: state.mode,
    r: state.rotationIndex,
    d: state.matchDate || '',
    t: state.matchTitle || '',
    p: state.members.map(m => ({ n: m.name || '', num: m.number, c: m.color || '#2563eb' })),
    b: state.bench.map(m => ({ n: m.name || '', num: m.number, c: m.color || '#2563eb' })),
    a: shareAbsent
  };
}

/**
 * 共有データをURL-Safe Base64にエンコード
 */
function encodeShareData(data) {
  try {
    const json = JSON.stringify(data);
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Encode share data error:', e);
    return '';
  }
}

/**
 * URL-Safe Base64文字列から大会データを復元
 */
function decodeShareData(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    console.error('Decode share data error:', e);
    return null;
  }
}

/**
 * 共有データを受信側アプリに適用
 */
function applySharedData(data) {
  state.mode = data.m || 8;
  state.rotationIndex = data.r || 0;
  state.matchDate = data.d || '';
  state.matchTitle = data.t || '';

  if (Array.isArray(data.p) && data.p.length) {
    state.members = data.p.map((p, idx) => ({
      id: idx + 1,
      number: p.num !== undefined ? p.num : (idx + 1),
      name: p.n || '',
      role: '',
      color: p.c || '#2563eb'
    }));
  } else {
    state.members = state.mode === 9 ? JSON.parse(JSON.stringify(DEFAULT_MEMBERS_9)) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8));
  }

  if (Array.isArray(data.b)) {
    state.bench = ensureBenchMembers(data.b.map((b, idx) => ({
      id: `bench-${idx + 1}`,
      number: b.num !== undefined ? b.num : (10 + idx),
      name: b.n || '',
      role: '控え',
      color: b.c || '#2563eb'
    })));
  } else {
    state.bench = ensureBenchMembers(DEFAULT_BENCH);
  }

  if (Array.isArray(data.a)) {
    state.absent = ensureAbsentMembers(data.a.map((a, idx) => ({
      id: `absent-${idx + 1}`,
      number: a.num !== undefined ? a.num : '',
      name: a.n || '',
      role: '欠席',
      color: a.c || '#2563eb'
    })));
  } else {
    state.absent = ensureAbsentMembers(DEFAULT_ABSENT);
  }

  elements.matchDate.value = state.matchDate;
  elements.matchTitle.value = state.matchTitle;

  if (state.mode === 9) {
    elements.mode9Btn.classList.add('active');
    elements.mode8Btn.classList.remove('active');
  } else {
    elements.mode8Btn.classList.add('active');
    elements.mode9Btn.classList.remove('active');
  }
}

/**
 * 共有URL・QRコードモーダルを開く
 * 現在の大会データのみをURLに埋め込み、他者のスマホに共有可能にする
 */
function openShareModal() {
  const shareData = createShareData();
  const encoded = encodeShareData(shareData);

  // 本番公開URLまたは現在のホストURL
  let baseUrl = PRODUCTION_URL;
  if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    baseUrl = `${window.location.origin}${window.location.pathname}`;
  }

  const fullShareUrl = `${baseUrl}?d=${encoded}`;
  elements.shareUrlInput.value = fullShareUrl;

  // 高精度QRコードの生成・描画
  generateQrCode(fullShareUrl, elements.qrCodeWrapper);

  elements.shareModal.style.display = 'flex';
}

function closeShareModal() {
  elements.shareModal.style.display = 'none';
}

function copyShareUrl() {
  elements.shareUrlInput.select();
  elements.shareUrlInput.setSelectionRange(0, 99999);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(elements.shareUrlInput.value)
      .then(() => showToast('共有URLをコピーしました！'))
      .catch(() => fallbackCopy());
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  document.execCommand('copy');
  showToast('共有URLをコピーしました！');
}

/**
 * 外部ライブラリ非依存の標準準拠QRコードジェネレータ (SVG)
 */
function generateQrCode(text, container) {
  container.innerHTML = '';
  try {
    const svg = createQrSvg(text, 180);
    container.appendChild(svg);
  } catch (err) {
    console.error('QR code generation failed:', err);
    container.innerHTML = '<span style="font-size:0.75rem;color:#ef4444;">QRコードの生成に失敗しました</span>';
  }
}

// Galois Field GF(256) 演算テーブル
const QR_GF_EXP = new Uint8Array(512);
const QR_GF_LOG = new Uint8Array(256);
(function initQrGf() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    QR_GF_EXP[i] = val;
    QR_GF_EXP[i + 255] = val;
    QR_GF_LOG[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
})();

function qrGfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return QR_GF_EXP[QR_GF_LOG[x] + QR_GF_LOG[y]];
}

function qrRsGenPoly(n) {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = QR_GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= qrGfMul(poly[j], root);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function qrRsEncode(data, ecCount) {
  const poly = qrRsGenPoly(ecCount);
  const res = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const m = data[i] ^ res[0];
    res.copyWithin(0, 1);
    res[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      res[j] ^= qrGfMul(poly[j], m);
    }
  }
  return res;
}

// QRコード仕様テーブル (Version 1〜12, Level M)
// 各バージョンの [総コード語数, ECコード語数/ブロック, ブロック数, アライメント座標リスト]
const QR_VERSIONS = [
  null,
  { total: 26, ec: 10, b1: 1, b2: 0, align: [] },
  { total: 44, ec: 16, b1: 1, b2: 0, align: [6, 18] },
  { total: 70, ec: 26, b1: 1, b2: 0, align: [6, 22] },
  { total: 100, ec: 18, b1: 2, b2: 0, align: [6, 26] },
  { total: 134, ec: 24, b1: 2, b2: 0, align: [6, 30] },
  { total: 172, ec: 16, b1: 4, b2: 0, align: [6, 34] },
  { total: 196, ec: 18, b1: 4, b2: 0, align: [6, 22, 38] },
  { total: 242, ec: 22, b1: 2, b2: 2, align: [6, 24, 42] },
  { total: 292, ec: 22, b1: 3, b2: 2, align: [6, 26, 46] },
  { total: 346, ec: 26, b1: 4, b2: 1, align: [6, 28, 50] },
  { total: 404, ec: 30, b1: 1, b2: 4, align: [6, 30, 54] },
  { total: 466, ec: 22, b1: 6, b2: 2, align: [6, 32, 58] }
];

/**
 * 標準QRコードマトリクスを生成
 */
function createQrSvg(text, size) {
  const utf8 = new TextEncoder().encode(text);
  const dataLen = utf8.length;

  // 適切なバージョンを決定
  let ver = 1;
  while (ver <= 12) {
    const vinfo = QR_VERSIONS[ver];
    const totalBlocks = vinfo.b1 + vinfo.b2;
    const totalEc = totalBlocks * vinfo.ec;
    const maxDataBytes = vinfo.total - totalEc;
    const headerBits = 4 + (ver <= 9 ? 8 : 16);
    const availableDataBytes = Math.floor((maxDataBytes * 8 - headerBits) / 8);
    if (dataLen <= availableDataBytes) break;
    ver++;
  }
  if (ver > 12) ver = 12;

  const vinfo = QR_VERSIONS[ver];
  const totalBlocks = vinfo.b1 + vinfo.b2;
  const totalEc = totalBlocks * vinfo.ec;
  const totalDataBytes = vinfo.total - totalEc;

  // ビットバッファ構築 (Byte Mode: 0100)
  const bitBuf = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitBuf.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(dataLen, ver <= 9 ? 8 : 16); // Character count indicator
  for (let i = 0; i < dataLen; i++) {
    pushBits(utf8[i], 8);
  }

  // 終端パターン (最大4ビット)
  const maxBits = totalDataBytes * 8;
  const termLen = Math.min(4, maxBits - bitBuf.length);
  for (let i = 0; i < termLen; i++) bitBuf.push(0);

  // 8ビット境界パディング
  while (bitBuf.length % 8 !== 0) bitBuf.push(0);

  // データコード語へ変換
  const dataWords = [];
  for (let i = 0; i < bitBuf.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitBuf[i + j];
    }
    dataWords.push(b);
  }

  // パディングコード語 (0xEC, 0x11)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (dataWords.length < totalDataBytes) {
    dataWords.push(padPatterns[padIdx % 2]);
    padIdx++;
  }

  // ブロック分割と誤り訂正コード生成
  const shortLen = Math.floor(totalDataBytes / totalBlocks);
  const blocks = [];
  let dOffset = 0;
  for (let i = 0; i < totalBlocks; i++) {
    const bLen = (i < totalBlocks - vinfo.b2) ? shortLen : (shortLen + 1);
    const dBlock = dataWords.slice(dOffset, dOffset + bLen);
    dOffset += bLen;
    const ecBlock = qrRsEncode(dBlock, vinfo.ec);
    blocks.push({ data: dBlock, ec: ecBlock });
  }

  // インターリーブ
  const finalWords = [];
  const maxBlockLen = Math.max(...blocks.map(b => b.data.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < blocks[b].data.length) finalWords.push(blocks[b].data[i]);
    }
  }
  for (let i = 0; i < vinfo.ec; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      finalWords.push(blocks[b].ec[i]);
    }
  }

  // マトリクス構築 (サイズ N)
  const N = 17 + 4 * ver;
  const matrix = Array.from({ length: N }, () => Array(N).fill(false));
  const isFunc = Array.from({ length: N }, () => Array(N).fill(false));

  function setFunc(r, c, v) {
    if (r >= 0 && r < N && c >= 0 && c < N) {
      matrix[r][c] = !!v;
      isFunc[r][c] = true;
    }
  }

  // ファインダーパターン
  function placeFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r, nc = col + c;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBlack = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
          setFunc(nr, nc, isBlack);
        } else {
          setFunc(nr, nc, false); // セパレータ
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, N - 7);
  placeFinder(N - 7, 0);

  // タイミングパターン
  for (let i = 8; i < N - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // アライメントパターン
  const coords = vinfo.align;
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      const ar = coords[i], ac = coords[j];
      if (isFunc[ar][ac]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isBlack = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0));
          setFunc(ar + r, ac + c, isBlack);
        }
      }
    }
  }

  // ダークモジュール
  setFunc(4 * ver + 9, 8, true);

  // フォーマット予約エリア
  for (let i = 0; i < 9; i++) {
    if (!isFunc[8][i]) isFunc[8][i] = true;
    if (!isFunc[i][8]) isFunc[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunc[8][N - 1 - i]) isFunc[8][N - 1 - i] = true;
    if (!isFunc[N - 1 - i][8]) isFunc[N - 1 - i] = true;
  }

  // データビットの配置 (ジグザグ走査)
  let bitPointer = 0;
  const totalBits = finalWords.length * 8;
  let dir = -1;
  let col = N - 1;

  while (col > 0) {
    if (col === 6) col--;
    for (let r = 0; r < N; r++) {
      const row = dir === -1 ? (N - 1 - r) : r;
      for (let c = 0; c < 2; c++) {
        const currCol = col - c;
        if (!isFunc[row][currCol]) {
          let bit = false;
          if (bitPointer < totalBits) {
            const byteIdx = Math.floor(bitPointer / 8);
            const bitOffset = 7 - (bitPointer % 8);
            bit = ((finalWords[byteIdx] >> bitOffset) & 1) === 1;
            bitPointer++;
          }
          // マスクパターン 0: (row + col) % 2 === 0
          if ((row + currCol) % 2 === 0) {
            bit = !bit;
          }
          matrix[row][currCol] = bit;
        }
      }
    }
    dir = -dir;
    col -= 2;
  }

  // フォーマット情報 (Level M = 00, Mask 0 = 000 -> 00000 -> BCH format = 0x5412)
  // 15ビット形式情報: 0x5412 ^ 0x5412 = 0
  // Level M, Mask 0 の既定値: 0b101010000010010 (15 bits)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // フォーマット情報の書き込み
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 0; i < 6; i++) matrix[5 - i][8] = formatBits[9 + i] === 1;

  for (let i = 0; i < 7; i++) matrix[N - 1 - i][8] = formatBits[i] === 1;
  for (let i = 0; i < 8; i++) matrix[8][N - 8 + i] = formatBits[7 + i] === 1;

  // SVGを生成
  const cellSize = size / N;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', size);
  bg.setAttribute('height', size);
  bg.setAttribute('fill', '#ffffff');
  svg.appendChild(bg);

  let pathD = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (matrix[r][c]) {
        const x = c * cellSize;
        const y = r * cellSize;
        pathD += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `;
      }
    }
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('fill', '#0f172a');
  svg.appendChild(path);

  return svg;
}

/**
 * 高精細Canvas画像Blobの生成
 */
function generateCourtImageBlob() {
  return new Promise((resolve) => {
    const canvas = elements.exportCanvas;
    const ctx = canvas.getContext('2d');

    const width = 1080;
    const height = 1520;
    canvas.width = width;
    canvas.height = height;

    // 全体背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // ヘッダータイトル枠
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 40, width - 80, 160);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, 160);

    // ロゴ画像を描画（読み込み済みの場合）
    const logoImg = document.querySelector('.header-logo');
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      try {
        const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight;
        const logoH = 50;
        const logoW = logoH * logoAspect;
        ctx.drawImage(logoImg, 70, 60, logoW, logoH);
      } catch (e) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText('AMADO VC', 70, 95);
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('AMADO VC', 70, 95);
    }

    // 大会名・日付（8桁数字）
    const date8 = formatDateTo8Digits(state.matchDate);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'left';
    const matchInfoText = `📅 ${date8}  🏆 ${state.matchTitle || '無題'} （${state.mode}人制）`;
    ctx.fillText(matchInfoText, 70, 160);

    // 現在のローテーションバッジ
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`ローテーション ${state.rotationIndex + 1} / ${state.mode}`, width - 70, 160);

    // コート外枠
    const courtX = 80;
    const courtY = 240;
    const courtW = width - 160;
    const courtH = height - 320;

    // 青いゾーン
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(courtX - 20, courtY - 20, courtW + 40, courtH + 40);

    // ネットライン
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(courtX, courtY - 30, courtW, 28);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('━━ NET ネット ━━', courtX + courtW / 2, courtY - 8);

    // コート内側（オレンジ）
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(courtX, courtY, courtW, courtH);

    // 白いコート境界線
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(courtX, courtY, courtW, courtH);

    // サーブエリアマーカー
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.fillRect(courtX + courtW - 200, courtY + courtH - 50, 200, 50);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(courtX + courtW - 200, courtY + courtH - 50, 200, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('サーブ位置', courtX + courtW - 100, courtY + courtH - 18);

    // 選手の描画
    const total = state.mode;
    const positions = state.mode === 8 ? POSITIONS_8 : POSITIONS_9;

    for (let posNum = 1; posNum <= total; posNum++) {
      const memberIndex = (posNum - 1 + state.rotationIndex) % total;
      const member = state.members[memberIndex];
      const posCoord = positions[posNum];
      if (!member || !posCoord) continue;

      const px = courtX + (courtW * posCoord.left / 100);
      const py = courtY + (courtH * posCoord.top / 100);
      const radius = 28;
      const isServing = (posNum === 1);

      if (isServing) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = member.color || '#2563eb';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${member.number}`, px, py);

      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 38px sans-serif';
      const nameWidth = ctx.measureText(member.name).width;
      const labelW = Math.max(nameWidth + 28, 120);
      const labelH = 52;
      const labelX = px - labelW / 2;
      const labelY = py + radius + 8;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelW, labelH, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(member.name, px, labelY + 38);

      if (isServing) {
        ctx.font = '22px sans-serif';
        ctx.fillText('🏐', px + radius - 2, py - radius + 14);
      }
    }

    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`保存しました: ${fileName}`);
}

// トースト通知
function showToast(msg) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// エスケープ関数
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// 起動
document.addEventListener('DOMContentLoaded', init);
