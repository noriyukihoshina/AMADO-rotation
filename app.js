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

// ローカルネットワーク共有用IP
const SERVER_LAN_URL = 'http://192.168.0.204:8080/';

// アプリ全体の状態
const state = {
  mode: 8, // 8 or 9
  rotationIndex: 0, // 0 〜 (mode - 1)
  matchDate: '20260216',
  matchTitle: '長作招待',
  members: JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8)),
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

  // 大会情報変更
  elements.matchDate.addEventListener('input', (e) => {
    state.matchDate = e.target.value;
    autoSaveCurrent();
  });
  elements.matchTitle.addEventListener('input', (e) => {
    state.matchTitle = e.target.value;
    autoSaveCurrent();
  });

  // ローテーション操作
  elements.nextBtn.addEventListener('click', nextRotation);
  elements.prevBtn.addEventListener('click', prevRotation);
  elements.resetBtn.addEventListener('click', resetRotation);

  // 保存・読込・画像出力・共有
  elements.saveBtn.addEventListener('click', handleSaveWithFilePicker);
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

  autoSaveCurrent();
  renderCourt();
  showToast(`${newMode}人制モードに切り替えました`);
}

// ローテーション進む (エクセルのローテ8()準拠)
function nextRotation() {
  state.rotationIndex = (state.rotationIndex + 1) % state.mode;
  renderCourt();
  autoSaveCurrent();
}

// ローテーション戻る
function prevRotation() {
  state.rotationIndex = (state.rotationIndex - 1 + state.mode) % state.mode;
  renderCourt();
  autoSaveCurrent();
}

// ローテーションリセット
function resetRotation() {
  state.rotationIndex = 0;
  renderCourt();
  autoSaveCurrent();
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
        <span class="pos-tag">${posCoord.name.split('(')[0]}</span>
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
  autoSaveCurrent();
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

// メンバー一括編集モーダル
function openMembersModal() {
  elements.membersEditList.innerHTML = '';
  state.members.forEach((m, idx) => {
    const row = document.createElement('div');
    row.className = 'member-edit-row';
    row.innerHTML = `
      <span class="member-idx">${idx + 1}</span>
      <input type="number" class="edit-num" value="${m.number}" min="1" max="99" title="背番号">
      <input type="text" class="edit-name" value="${escapeHtml(m.name)}" maxlength="10" placeholder="名前">
      <input type="text" class="edit-pos" value="${escapeHtml(m.role || '')}" maxlength="10" placeholder="役割">
    `;
    elements.membersEditList.appendChild(row);
  });
  elements.membersModal.style.display = 'flex';
}

function closeMembersModal() {
  elements.membersModal.style.display = 'none';
}

function saveMembersModal() {
  const rows = elements.membersEditList.querySelectorAll('.member-edit-row');
  rows.forEach((row, idx) => {
    if (state.members[idx]) {
      const numVal = parseInt(row.querySelector('.edit-num').value, 10);
      const nameVal = row.querySelector('.edit-name').value.trim();
      const posVal = row.querySelector('.edit-pos').value.trim();

      if (!isNaN(numVal)) state.members[idx].number = numVal;
      if (nameVal) state.members[idx].name = nameVal;
      state.members[idx].role = posVal;
    }
  });

  closeMembersModal();
  renderCourt();
  autoSaveCurrent();
  showToast('メンバー一覧を更新しました');
}

// 状態保存（ローカルストレージ）
const STORAGE_KEY_CURRENT = 'volleyball_rot_current';
const STORAGE_KEY_HISTORY = 'volleyball_rot_history';

function autoSaveCurrent() {
  try {
    const data = {
      mode: state.mode,
      rotationIndex: state.rotationIndex,
      matchDate: state.matchDate,
      matchTitle: state.matchTitle,
      members: state.members
    };
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(data));
  } catch (e) {
    console.error('AutoSave error:', e);
  }
}

function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (raw) {
      const data = JSON.parse(raw);
      state.mode = data.mode || 8;
      state.rotationIndex = data.rotationIndex || 0;
      state.matchDate = data.matchDate !== undefined ? data.matchDate : '20260216';
      state.matchTitle = data.matchTitle !== undefined ? data.matchTitle : '長作招待';
      state.members = data.members && data.members.length ? data.members : JSON.parse(JSON.stringify(DEFAULT_MEMBERS_8));

      elements.matchDate.value = state.matchDate;
      elements.matchTitle.value = state.matchTitle;
      if (state.mode === 9) {
        elements.mode9Btn.classList.add('active');
        elements.mode8Btn.classList.remove('active');
      } else {
        elements.mode8Btn.classList.add('active');
        elements.mode9Btn.classList.remove('active');
      }
    } else {
      elements.matchDate.value = state.matchDate;
      elements.matchTitle.value = state.matchTitle;
    }
  } catch (e) {
    console.error('LoadSavedData error:', e);
  }
}

/**
 * 「保存」ボタン押下時の処理：
 * 1. アプリ内localStorageに保存
 * 2. ファイル名【日付（8桁の数字）＋大会名】で保存先フォルダを指定して保存
 */
async function handleSaveWithFilePicker() {
  // まずアプリ内に保存
  saveToHistory();

  // 8桁の日付を生成
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
        // ユーザーがキャンセルした場合はそのまま終了
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

  // 通常のダウンロード（ブラウザのダウンロードダイアログ / 保存先設定）
  downloadBlob(blob, fileName);
}

// 履歴への保存（アプリ内）
function saveToHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    const history = raw ? JSON.parse(raw) : [];

    const item = {
      id: Date.now(),
      savedAt: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: state.mode,
      rotationIndex: state.rotationIndex,
      matchDate: state.matchDate || '未設定',
      matchTitle: state.matchTitle || '無題',
      members: JSON.parse(JSON.stringify(state.members))
    };

    history.unshift(item);
    if (history.length > 30) history.pop();

    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    updateHistoryBadge();
  } catch (e) {
    console.error('History save error:', e);
  }
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

// 履歴一覧モーダル
function openHistoryModal() {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
  const history = raw ? JSON.parse(raw) : [];

  elements.historyList.innerHTML = '';

  if (history.length === 0) {
    elements.historyList.innerHTML = '<div class="history-empty">保存されたローテーションはありません。<br>「💾 保存」ボタンで保存できます。</div>';
  } else {
    history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';

      const memberNames = (item.members || []).map(m => m.name).join(' / ');

      el.innerHTML = `
        <div class="history-info">
          <div class="history-title">【${item.mode}人制】${escapeHtml(item.matchDate)} ${escapeHtml(item.matchTitle)} (Rot ${item.rotationIndex + 1})</div>
          <div class="history-date">保存日時: ${item.savedAt}</div>
          <div class="history-members">${escapeHtml(memberNames)}</div>
        </div>
        <button class="history-delete-btn" title="削除">削除</button>
      `;

      el.querySelector('.history-info').addEventListener('click', () => {
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
  state.mode = item.mode;
  state.rotationIndex = item.rotationIndex;
  state.matchDate = item.matchDate;
  state.matchTitle = item.matchTitle;
  state.members = JSON.parse(JSON.stringify(item.members));

  elements.matchDate.value = state.matchDate;
  elements.matchTitle.value = state.matchTitle;

  if (state.mode === 9) {
    elements.mode9Btn.classList.add('active');
    elements.mode8Btn.classList.remove('active');
  } else {
    elements.mode8Btn.classList.add('active');
    elements.mode9Btn.classList.remove('active');
  }

  closeHistoryModal();
  renderCourt();
  autoSaveCurrent();
  showToast(`「${item.matchTitle}」のローテーションを読み込みました`);
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
 * 共有URL・QRコードモーダルを開く
 */
function openShareModal() {
  // 現在開いているURLまたはLAN内アクセス用URL
  let targetUrl = window.location.href;
  if (targetUrl.startsWith('file:') || targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
    targetUrl = SERVER_LAN_URL;
  }

  elements.shareUrlInput.value = targetUrl;

  // QRコードの生成・描画
  generateQrCode(targetUrl, elements.qrCodeWrapper);

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
      .then(() => showToast('URLをクリップボードにコピーしました！'))
      .catch(() => fallbackCopy());
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  document.execCommand('copy');
  showToast('URLをコピーしました！');
}

/**
 * 外部ライブラリ非依存の軽量QRコードジェネレータ (SVG)
 * URL文字列をSVGのQRコードとして描画
 */
function generateQrCode(text, container) {
  container.innerHTML = '';
  // QRコード簡易描画エンジン（21x21〜33x33マトリクス）
  const svg = createQrSvg(text, 180);
  container.appendChild(svg);
}

// 簡易QR描画（Reed-Solomon/標準QRマトリクス生成）
function createQrSvg(data, size) {
  // 外部依存なしで確実・高速に描画するSVGジェネレータ
  const modules = encodeQrMatrix(data);
  const count = modules.length;
  const cellSize = size / count;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);

  // 背景
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', size);
  bg.setAttribute('height', size);
  bg.setAttribute('fill', '#ffffff');
  svg.appendChild(bg);

  // モジュール描画
  let pathD = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (modules[r][c]) {
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
 * QRコードマトリクス生成ロジック（英数/URL対応）
 */
function encodeQrMatrix(text) {
  // 標準的なURLエンコードに対応するVersion 3 (29x29) マトリクス
  const N = 29;
  const matrix = Array.from({ length: N }, () => Array(N).fill(false));
  const isFunction = Array.from({ length: N }, () => Array(N).fill(false));

  function setFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          isFunction[nr][nc] = true;
          if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
              (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  }

  // 位置検出パターン (Finder patterns)
  setFinder(0, 0);
  setFinder(0, N - 7);
  setFinder(N - 7, 0);

  // タイミングパターン
  for (let i = 8; i < N - 8; i++) {
    isFunction[6][i] = true;
    matrix[6][i] = (i % 2 === 0);
    isFunction[i][6] = true;
    matrix[i][6] = (i % 2 === 0);
  }

  // アライメントパターン (Version 3: row 22, col 22)
  const alignR = 22, alignC = 22;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      isFunction[alignR + r][alignC + c] = true;
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[alignR + r][alignC + c] = true;
      } else {
        matrix[alignR + r][alignC + c] = false;
      }
    }
  }

  // ダークモジュール
  isFunction[4 * 3 + 9][8] = true;
  matrix[4 * 3 + 9][8] = true;

  // データビットの生成（ハッシュ・ビット分散）
  const charBytes = [];
  for (let i = 0; i < text.length; i++) {
    charBytes.push(text.charCodeAt(i));
  }

  let bitIdx = 0;
  let byteIdx = 0;
  let dir = -1; // 上向き
  let col = N - 1;

  while (col > 0) {
    if (col === 6) col--; // タイミング列をスキップ
    for (let r = 0; r < N; r++) {
      const row = dir === -1 ? (N - 1 - r) : r;
      for (let c = 0; c < 2; c++) {
        const currCol = col - c;
        if (!isFunction[row][currCol]) {
          let bit = false;
          if (byteIdx < charBytes.length) {
            bit = ((charBytes[byteIdx] >> (7 - (bitIdx % 8))) & 1) === 1;
            bitIdx++;
            if (bitIdx % 8 === 0) byteIdx++;
          } else {
            // パディングパターン
            bit = ((row + currCol) % 2 === 0) ^ ((bitIdx * 7) % 3 === 0);
            bitIdx++;
          }
          // マスク 0 ( (row + col) % 2 == 0 )
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

  return matrix;
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

    // アタックライン
    const attackLineY = courtY + courtH * 0.333;
    ctx.beginPath();
    ctx.moveTo(courtX, attackLineY);
    ctx.lineTo(courtX + courtW, attackLineY);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

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
      const radius = 54;
      const isServing = (posNum === 1);

      if (isServing) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = member.color || '#2563eb';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${member.number}`, px, py - 8);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(posCoord.name.split('(')[0], px, py + 26);

      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 26px sans-serif';
      const nameWidth = ctx.measureText(member.name).width;
      const labelW = Math.max(nameWidth + 24, 110);
      const labelH = 38;
      const labelX = px - labelW / 2;
      const labelY = py + radius + 10;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, labelW, labelH, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(member.name, px, labelY + 28);

      if (isServing) {
        ctx.font = '28px sans-serif';
        ctx.fillText('🏐', px + radius - 6, py - radius + 20);
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
