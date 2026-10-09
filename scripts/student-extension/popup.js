document.addEventListener('DOMContentLoaded', async () => {
  const navLatest = document.getElementById('navLatest');
  const navArchive = document.getElementById('navArchive');
  const viewLatest = document.getElementById('viewLatest');
  const viewArchive = document.getElementById('viewArchive');
  const archiveCount = document.getElementById('archiveCount');
  const archiveList = document.getElementById('archiveList');
  const btnReloadArchive = document.getElementById('btnReloadArchive');

  // 계정 연동 UI 요소
  const userAccountBar = document.getElementById('userAccountBar');
  const userStatusIcon = document.getElementById('userStatusIcon');
  const userAccountText = document.getElementById('userAccountText');
  const btnToggleAccountEdit = document.getElementById('btnToggleAccountEdit');
  const userAccountEditBox = document.getElementById('userAccountEditBox');
  const inputUserId = document.getElementById('inputUserId');
  const btnAutoDetectAccount = document.getElementById('btnAutoDetectAccount');
  const btnSaveUserId = document.getElementById('btnSaveUserId');

  const loadingEl = document.getElementById('loading');
  const postContentEl = document.getElementById('postContent');
  const pTitleEl = document.getElementById('pTitle');
  const pExcerptEl = document.getElementById('pExcerpt');
  const statusBox = document.getElementById('statusBox');
  const statusText = document.getElementById('statusText');
  const btnQuickOpenTistory = document.getElementById('btnQuickOpenTistory');
  const quickOpenEditorBox = document.getElementById('quickOpenEditorBox');
  const btnOpenTistoryDirect = document.getElementById('btnOpenTistoryDirect');
  const btnOpenNaverDirect = document.getElementById('btnOpenNaverDirect');
  const btnPost = document.getElementById('btnPost');
  const btnPostText = document.getElementById('btnPostText');
  const sourceDomain = document.getElementById('sourceDomain');
  const sourceChip = document.getElementById('sourceChip');
  const photosChip = document.getElementById('photosChip');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnPaste = document.getElementById('btnPaste');
  
  const tabNaver = document.getElementById('tabNaver');
  const tabTistory = document.getElementById('tabTistory');
  const blogUrlInput = document.getElementById('blogUrlInput');
  const btnSaveBlogUrl = document.getElementById('btnSaveBlogUrl');
  const btnOpenBlog = document.getElementById('btnOpenBlog');

  // 크기 조절 및 우측 실시간 본문 미리보기 요소
  const btnToggleSize = document.getElementById('btnToggleSize');
  const toggleSizeIcon = document.getElementById('toggleSizeIcon');
  const toggleSizeText = document.getElementById('toggleSizeText');
  const btnOpenWindow = document.getElementById('btnOpenWindow');
  const btnCopyPreview = document.getElementById('btnCopyPreview');
  const copyIcon = document.getElementById('copyIcon');
  const copyText = document.getElementById('copyText');
  const previewPhotosChip = document.getElementById('previewPhotosChip');
  const previewCharsChip = document.getElementById('previewCharsChip');
  const renderedArticle = document.getElementById('renderedArticle');
  const previewContentScroll = document.getElementById('previewContentScroll');

  let currentPost = null;
  let savedPostsList = [];
  let currentUserId = '';
  let currentUserEmail = '';
  let activePlatform = 'tistory';
  let savedUrls = {
    tistory: 'https://www.tistory.com/member/blog',
    naver: 'https://blog.naver.com/GoBlogWrite.naver',
  };

  const naverModeBox = document.getElementById('naverModeBox');
  let activeTab = null;
  let isTistory = false;
  let isNaver = false;

  // 1. 활성 탭 플랫폼 즉시 감지
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;
    isTistory = Boolean(activeTab?.url?.includes('tistory.com'));
    isNaver = Boolean(activeTab?.url?.includes('naver.com'));
    if (isNaver) activePlatform = 'naver';
  } catch (e) {}

  // 1-1. 스마트 에디터 탭 전환 또는 새 탭 열기 헬퍼
  async function openOrSwitchToEditor(platform = 'tistory') {
    const isTist = platform === 'tistory';
    const defaultUrl = isTist
      ? (savedUrls.tistory || 'https://www.tistory.com/member/blog')
      : (savedUrls.naver || 'https://blog.naver.com/GoBlogWrite.naver');

    const targetUrl = (blogUrlInput && blogUrlInput.value.trim() && activePlatform === platform)
      ? blogUrlInput.value.trim()
      : defaultUrl;

    try {
      // 1) 이미 열려있는 해당 플랫폼의 글쓰기/관리 탭 탐색
      const queryPattern = isTist ? '*://*.tistory.com/*' : '*://blog.naver.com/*';
      const tabs = await chrome.tabs.query({ url: queryPattern });

      let targetTab = null;
      if (isTist) {
        // 티스토리 글쓰기 URL 우선 탐색 (/manage/newpost 또는 /manage/post 또는 entry/write)
        targetTab = tabs.find(t => t.url && (t.url.includes('/manage/newpost') || t.url.includes('/manage/post') || t.url.includes('entry/write')))
                 || tabs.find(t => t.url && t.url.includes('/manage'))
                 || tabs[0];
      } else {
        // 네이버 글쓰기 URL 우선 탐색
        targetTab = tabs.find(t => t.url && (t.url.includes('GoBlogWrite') || t.url.includes('Redirect=Write') || t.url.includes('blog.editor.naver.com')))
                 || tabs[0];
      }

      if (targetTab && targetTab.id) {
        // 이미 탭이 열려있으면 즉시 해당 탭으로 전환 및 윈도우 포커스
        await chrome.tabs.update(targetTab.id, { active: true });
        if (targetTab.windowId) {
          await chrome.windows.update(targetTab.windowId, { focused: true });
        }
        return;
      }
    } catch (err) {
      console.warn('[openOrSwitchToEditor] 탭 검색 실패, 새 탭 생성 진행:', err);
    }

    // 2) 열려있는 탭이 없으면 새 탭으로 열기
    chrome.tabs.create({ url: targetUrl });
  }

  function updatePlatformButtons() {
    if (isTistory) {
      if (naverModeBox) naverModeBox.style.display = 'none';
      if (quickOpenEditorBox) quickOpenEditorBox.style.display = 'none';
      if (btnQuickOpenTistory) btnQuickOpenTistory.style.display = 'none';
      btnPost.style.display = 'flex';
      statusBox.className = 'status-box status-ready';
      statusText.textContent = '🟠 티스토리 글쓰기 창 감지됨!';
      btnPost.className = 'btn btn-tistory';
      btnPostText.textContent = currentPost ? `🚀 티스토리에 [${currentPost.title.slice(0, 12)}...] 1초 배포` : '🚀 티스토리에 1초 자동 작성';
    } else if (isNaver) {
      if (naverModeBox) naverModeBox.style.display = 'block';
      if (quickOpenEditorBox) quickOpenEditorBox.style.display = 'none';
      if (btnQuickOpenTistory) btnQuickOpenTistory.style.display = 'none';
      btnPost.style.display = 'flex';
      statusBox.className = 'status-box status-ready';
      statusText.textContent = '🟢 네이버 블로그 에디터 감지됨!';
      btnPost.className = 'btn btn-naver';
      btnPostText.textContent = currentPost ? `🚀 네이버에 [${currentPost.title.slice(0, 12)}...] 자동 작성` : '🚀 네이버 블로그에 자동 작성';
    } else {
      if (naverModeBox) naverModeBox.style.display = 'none';
      if (quickOpenEditorBox) {
        quickOpenEditorBox.style.display = 'flex';
        btnPost.style.display = 'none';
      } else {
        btnPost.style.display = 'flex';
        btnPost.className = 'btn btn-tistory';
        btnPostText.textContent = '🚀 티스토리 글쓰기 창 바로 열기';
      }
      if (btnQuickOpenTistory) btnQuickOpenTistory.style.display = 'inline-flex';
      statusBox.className = 'status-box status-warn';
      statusText.textContent = '글쓰기 창을 열어주세요';
    }
  }

  updatePlatformButtons();

  // ─── 창 크기 모드 (기본 와이드 780px, 콤팩트 380px, 독립 윈도우 모드) ───
  const urlParams = new URLSearchParams(window.location.search);
  const isWindowMode = urlParams.get('mode') === 'window';

  if (isWindowMode) {
    document.body.classList.remove('compact-mode');
    document.body.classList.add('window-mode');
    if (btnOpenWindow) btnOpenWindow.style.display = 'none';
    if (btnToggleSize) btnToggleSize.style.display = 'none';
  } else {
    // 저장된 크기 설정 복원 (기본값: wide)
    chrome.storage.local.get(['popupSize'], (res) => {
      if (res.popupSize === 'compact') {
        document.body.classList.add('compact-mode');
        document.body.classList.remove('wide-mode');
        if (toggleSizeIcon) toggleSizeIcon.textContent = '⤢';
        if (toggleSizeText) toggleSizeText.textContent = '넓게 보기';
      } else {
        document.body.classList.remove('compact-mode');
        document.body.classList.add('wide-mode');
        if (toggleSizeIcon) toggleSizeIcon.textContent = '⤡';
        if (toggleSizeText) toggleSizeText.textContent = '콤팩트';
      }
    });
  }

  if (btnToggleSize) {
    btnToggleSize.addEventListener('click', () => {
      const isCompact = document.body.classList.contains('compact-mode');
      if (isCompact) {
        document.body.classList.remove('compact-mode');
        document.body.classList.add('wide-mode');
        if (toggleSizeIcon) toggleSizeIcon.textContent = '⤡';
        if (toggleSizeText) toggleSizeText.textContent = '콤팩트';
        chrome.storage.local.set({ popupSize: 'wide' });
      } else {
        document.body.classList.add('compact-mode');
        document.body.classList.remove('wide-mode');
        if (toggleSizeIcon) toggleSizeIcon.textContent = '⤢';
        if (toggleSizeText) toggleSizeText.textContent = '넓게 보기';
        chrome.storage.local.set({ popupSize: 'compact' });
      }
    });
  }

  if (btnOpenWindow) {
    btnOpenWindow.addEventListener('click', () => {
      const url = chrome.runtime.getURL('popup.html?mode=window');
      if (chrome.windows && chrome.windows.create) {
        chrome.windows.create({
          url,
          type: 'popup',
          width: 1100,
          height: 850
        });
      } else {
        window.open(url, '_blank', 'width=1100,height=850');
      }
    });
  }

  if (btnCopyPreview) {
    btnCopyPreview.addEventListener('click', async () => {
      if (!currentPost) return;
      try {
        const textToCopy = `${currentPost.title}\n\n${currentPost.content || ''}`;
        const previewHtml = renderedArticle?.innerHTML || '';
        if (navigator.clipboard && window.ClipboardItem) {
          const textBlob = new Blob([textToCopy], { type: 'text/plain' });
          const htmlBlob = new Blob([previewHtml], { type: 'text/html' });
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': textBlob,
              'text/html': htmlBlob,
            })
          ]);
        } else {
          await navigator.clipboard.writeText(textToCopy);
        }
        if (copyText) copyText.textContent = '복사 완료!';
        if (copyIcon) copyIcon.textContent = '✅';
        setTimeout(() => {
          if (copyText) copyText.textContent = '본문 복사';
          if (copyIcon) copyIcon.textContent = '📋';
        }, 1500);
      } catch (err) {
        console.error('클립보드 복사 실패:', err);
      }
    });
  }

  // ─── 계정 연동 및 자동 감지 ─────────────────────

  async function loadUserAccount() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['myUserId', 'myUserEmail'], async (res) => {
        if (res.myUserId) {
          currentUserId = res.myUserId;
          currentUserEmail = res.myUserEmail || res.myUserId.slice(0, 8);
          updateAccountUI(currentUserEmail, true);
          resolve(currentUserId);
        } else {
          // 저장된 계정이 없으면 열린 탭에서 자동 감지 시도
          const detected = await detectUserFromTabs();
          if (detected?.uid) {
            currentUserId = detected.uid;
            currentUserEmail = detected.email || detected.uid;
            chrome.storage.local.set({ myUserId: currentUserId, myUserEmail: currentUserEmail });
            updateAccountUI(currentUserEmail, true);
            resolve(currentUserId);
          } else {
            updateAccountUI('🌐 네온피터 공용 보관함 (즉시 사용 가능)', true);
            resolve('');
          }
        }
      });
    });
  }

  function updateAccountUI(text, isLinked) {
    if (userAccountText) userAccountText.textContent = text;
    if (userStatusIcon) userStatusIcon.textContent = isLinked ? '🟢' : '⚪';
    if (inputUserId && currentUserId) inputUserId.value = currentUserId;
  }

  async function detectUserFromTabs() { return null; }

  if (btnToggleAccountEdit) {
    btnToggleAccountEdit.addEventListener('click', () => {
      if (!userAccountEditBox) return;
      const isHidden = userAccountEditBox.style.display === 'none';
      userAccountEditBox.style.display = isHidden ? 'block' : 'none';
    });
  }

  if (btnAutoDetectAccount) {
    btnAutoDetectAccount.addEventListener('click', async () => {
      btnAutoDetectAccount.textContent = '감지 중...';
      const detected = await detectUserFromTabs();
      btnAutoDetectAccount.textContent = '🔍 열린 탭 자동 감지';
      if (detected?.uid) {
        currentUserId = detected.uid;
        currentUserEmail = detected.email || detected.uid;
        chrome.storage.local.set({ myUserId: currentUserId, myUserEmail: currentUserEmail });
        updateAccountUI(currentUserEmail, true);
        if (userAccountEditBox) userAccountEditBox.style.display = 'none';
        alert(`계정이 연동되었습니다!\n(${currentUserEmail})`);
        loadPostData();
      } else {
        alert('열려 있는 웹사이트 탭에서 로그인 정보를 찾지 못했습니다.\n웹사이트에 로그인한 후 다시 시도해주세요.');
      }
    });
  }

  if (btnSaveUserId) {
    btnSaveUserId.addEventListener('click', () => {
      const val = inputUserId?.value?.trim();
      if (val) {
        currentUserId = val;
        currentUserEmail = val.includes('@') ? val : `${val.slice(0, 8)}...`;
        chrome.storage.local.set({ myUserId: currentUserId, myUserEmail: currentUserEmail });
        updateAccountUI(currentUserEmail, true);
        if (userAccountEditBox) userAccountEditBox.style.display = 'none';
        alert('계정이 설정되었습니다!');
        loadPostData();
      }
    });
  }

  // 2. 네비게이션 탭 전환 (최신 글 vs 보관함)
  navLatest.addEventListener('click', () => {
    navLatest.classList.add('active');
    navArchive.classList.remove('active');
    viewLatest.style.display = 'block';
    viewArchive.style.display = 'none';
  });

  navArchive.addEventListener('click', () => {
    navArchive.classList.add('active');
    navLatest.classList.remove('active');
    viewArchive.style.display = 'block';
    viewLatest.style.display = 'none';
    loadArchivePosts();
  });

  btnReloadArchive.addEventListener('click', loadArchivePosts);

  // 회원별 vs 주제별 탭 스위처
  const btnFilterByMember = document.getElementById('btnFilterByMember');
  const btnFilterByCategory = document.getElementById('btnFilterByCategory');
  const memberMenuBar = document.getElementById('memberMenuBar');
  const categoryMenuBar = document.getElementById('categoryMenuBar');

  if (btnFilterByMember && btnFilterByCategory) {
    btnFilterByMember.addEventListener('click', () => {
      filterMode = 'member';
      btnFilterByMember.classList.add('active');
      btnFilterByCategory.classList.remove('active');
      if (memberMenuBar) memberMenuBar.style.display = 'flex';
      if (categoryMenuBar) categoryMenuBar.style.display = 'none';
      renderArchiveList(savedPostsList);
    });

    btnFilterByCategory.addEventListener('click', () => {
      filterMode = 'category';
      btnFilterByCategory.classList.add('active');
      btnFilterByMember.classList.remove('active');
      if (categoryMenuBar) categoryMenuBar.style.display = 'flex';
      if (memberMenuBar) memberMenuBar.style.display = 'none';
      renderArchiveList(savedPostsList);
    });
  }

  // 1) 회원별 메뉴판 칩 클릭 핸들러
  document.querySelectorAll('#memberMenuBar .cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#memberMenuBar .cat-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      selectedMember = btn.getAttribute('data-member') || 'all';
      renderArchiveList(savedPostsList);
    });
  });

  // 2) 주제별 메뉴판 칩 클릭 핸들러
  document.querySelectorAll('#categoryMenuBar .cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#categoryMenuBar .cat-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.getAttribute('data-cat') || 'all';
      renderArchiveList(savedPostsList);
    });
  });

  // 3. 저장된 설정 불러오기
  chrome.storage.local.get(['myNaverUrl', 'myTistoryUrl', 'cachedPost'], (res) => {
    if (res.myNaverUrl) savedUrls.naver = res.myNaverUrl;
    if (res.myTistoryUrl) savedUrls.tistory = res.myTistoryUrl;
    
    if (isNaver) {
      updateSettingTab('naver');
    } else {
      updateSettingTab('tistory');
    }

    if (res.cachedPost) {
      applyPost(res.cachedPost, '저장된 글', true);
    }
  });

  function updateSettingTab(platform) {
    activePlatform = platform;
    if (platform === 'naver') {
      tabNaver.classList.add('active');
      tabTistory.classList.remove('active');
      blogUrlInput.value = savedUrls.naver;
      blogUrlInput.placeholder = '예: https://blog.naver.com/아이디?Redirect=Write&';
    } else {
      tabTistory.classList.add('active');
      tabNaver.classList.remove('active');
      blogUrlInput.value = savedUrls.tistory;
      blogUrlInput.placeholder = '예: https://내블로그.tistory.com/manage/newpost';
    }
  }

  tabNaver.addEventListener('click', () => updateSettingTab('naver'));
  tabTistory.addEventListener('click', () => updateSettingTab('tistory'));

  btnSaveBlogUrl.addEventListener('click', () => {
    const url = blogUrlInput.value.trim();
    if (url) {
      if (activePlatform === 'naver') {
        savedUrls.naver = url;
        chrome.storage.local.set({ myNaverUrl: url });
      } else {
        savedUrls.tistory = url;
        chrome.storage.local.set({ myTistoryUrl: url });
      }
      alert('주소가 저장되었습니다!');
    }
  });

  if (btnQuickOpenTistory) {
    btnQuickOpenTistory.addEventListener('click', () => {
      openOrSwitchToEditor('tistory');
    });
  }

  if (btnOpenTistoryDirect) {
    btnOpenTistoryDirect.addEventListener('click', () => {
      openOrSwitchToEditor('tistory');
    });
  }

  if (btnOpenNaverDirect) {
    btnOpenNaverDirect.addEventListener('click', () => {
      openOrSwitchToEditor('naver');
    });
  }

  if (btnOpenBlog) {
    btnOpenBlog.addEventListener('click', () => {
      openOrSwitchToEditor(activePlatform);
    });
  }

  // ─── 서버 글 목록 API 호출 헬퍼 ──────────────────

  async function fetchServerPosts() { return null; }
  async function loadPostData() {
    loadingEl.style.display = 'block'; postContentEl.style.display = 'none';
    const data = await chrome.storage.local.get(['latest_post']);
    if (data.latest_post && data.latest_post.title) {
      applyPost(data.latest_post, '내 브라우저에서 전달한 글', true);
      loadArchivePosts(); return;
    }
    sourceDomain.textContent = '직접 전달한 글 없음';
    loadingEl.textContent = '교육 플랫폼에서 글을 만든 뒤 확장 프로그램으로 보내기/동기화를 눌러주세요.';
    btnPost.disabled = true; loadArchivePosts();
  }

  // 5. 보관함 글 목록 불러오기 & 렌더링
  function deduplicatePosts(items) {
    if (!Array.isArray(items)) return [];
    const seen = new Set();
    const unique = [];
    for (const item of items) {
      const title = (item?.title || '').trim().toLowerCase();
      if (title && !seen.has(title)) {
        seen.add(title);
        unique.push(item);
      }
    }
    return unique;
  }

  async function loadArchivePosts() {
    savedPostsList = currentPost ? [{...currentPost,id:'current',createdAt:Date.now()}] : [];
    renderArchiveList(savedPostsList);
  }

  // ─── 10대 황금 블로그 카테고리 정의 및 스마트 분류기 ─────────────────────
  const NEWS_CATEGORIES = {
    saju: { id: 'saju', label: '운세·사주', emoji: '🔮', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
    insurance: { id: 'insurance', label: '보험·보상', emoji: '💰', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    health: { id: 'health', label: '건강·의학', emoji: '🩺', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    philosophy: { id: 'philosophy', label: '철학·인문', emoji: '🏛️', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    economy: { id: 'economy', label: '경제·재테크', emoji: '📈', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    tech: { id: 'tech', label: 'IT·AI', emoji: '🤖', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    law: { id: 'law', label: '법률·부동산', emoji: '⚖️', color: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
    lifestyle: { id: 'lifestyle', label: '생활꿀팁', emoji: '📱', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    travel: { id: 'travel', label: '여행·맛집', emoji: '✈️', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    career: { id: 'career', label: '직장·취업', emoji: '💼', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  };

  const BLOG_MEMBERS = [
    '곽성진',
    '박범균',
    '방은주',
    '이현주',
    '조윤상',
    '황보순옥',
    '박정희',
    '이주빈',
    '이도겸',
    '이민우',
    '윤진희',
    '최서영',
  ];

  let filterMode = 'member'; // 'member' | 'category'
  let selectedMember = 'all';
  let selectedCategory = 'all';

  function getPostMember(post) {
    if (!post) return '';
    if (post.memberName && BLOG_MEMBERS.includes(post.memberName)) {
      return post.memberName;
    }
    if (Array.isArray(post.tags)) {
      const found = post.tags.find(t => BLOG_MEMBERS.includes(t));
      if (found) return found;
    }
    const text = `${post.title || ''} ${post.excerpt || ''}`;
    for (const m of BLOG_MEMBERS) {
      if (text.includes(m)) return m;
    }
    return '';
  }

  const CATEGORY_MAP = {
    it_tech: 'tech',
    tech: 'tech',
    itservice: 'tech',
    real_estate: 'law',
    realestate: 'law',
    law: 'law',
    economy: 'economy',
    exchange: 'economy',
    consulting: 'insurance',
    insurance: 'insurance',
    health: 'health',
    medical: 'health',
    lifestyle: 'lifestyle',
    general: 'lifestyle',
    product: 'lifestyle',
    travel: 'travel',
    restaurant: 'travel',
    career: 'career',
    education: 'career',
    business: 'career',
    saju: 'saju',
    philosophy: 'philosophy',
    beauty: 'lifestyle',
  };

  function classifyPostCategory(post) {
    if (!post) return 'tech';
    if (post.newsCategory && CATEGORY_MAP[post.newsCategory]) {
      return CATEGORY_MAP[post.newsCategory];
    }
    if (post.category && CATEGORY_MAP[post.category]) {
      return CATEGORY_MAP[post.category];
    }
    const text = `${post.title || ''} ${post.category || ''} ${(post.tags || []).join(' ')} ${post.excerpt || ''}`.toLowerCase();

    // 1. 운세·사주
    if (
      text.includes('운세') || text.includes('사주') || text.includes('띠별') ||
      text.includes('타로') || text.includes('별자리') || text.includes('팔자') ||
      text.includes('삼재') || text.includes('신년운세') || text.includes('궁합')
    ) {
      return 'saju';
    }

    // 2. 보험·보상
    if (
      text.includes('보험') || text.includes('실손') || text.includes('암보험') ||
      text.includes('보상') || text.includes('숨은 돈') || text.includes('치아보험') ||
      text.includes('자동차보험') || text.includes('보험금') || text.includes('환급')
    ) {
      return 'insurance';
    }

    // 3. 건강·의학
    if (
      text.includes('건강') || text.includes('의학') || text.includes('병원') ||
      text.includes('질환') || text.includes('혈당') || text.includes('다이어트') ||
      text.includes('영양제') || text.includes('오메가') || text.includes('유산균') ||
      text.includes('치료') || text.includes('약국') || text.includes('혈압') ||
      text.includes('비타민') || text.includes('통증') || text.includes('건강검진') ||
      text.includes('치과') || text.includes('임플란트') || text.includes('관절') ||
      text.includes('디스크') || text.includes('정형외과') || text.includes('망막') ||
      text.includes('수근관') || text.includes('하지정맥')
    ) {
      return 'health';
    }

    // 4. 철학·인문
    if (
      text.includes('철학') || text.includes('명언') || text.includes('인문') ||
      text.includes('쇼펜하우어') || text.includes('아우렐리우스') || text.includes('사색') ||
      text.includes('성찰') || text.includes('고전') || text.includes('도서') ||
      text.includes('필독서')
    ) {
      return 'philosophy';
    }

    // 5. 생활법률·부동산
    if (
      text.includes('법률') || text.includes('부동산') || text.includes('전세') ||
      text.includes('월세') || text.includes('임대차') || text.includes('계약') ||
      text.includes('등기부') || text.includes('보증금') || text.includes('소송') ||
      text.includes('층간소음') || text.includes('특약') || text.includes('청약') ||
      text.includes('맹지') || text.includes('토지') || text.includes('방수')
    ) {
      return 'law';
    }

    // 6. 여행·맛집
    if (
      text.includes('여행') || text.includes('맛집') || text.includes('드라이브') ||
      text.includes('카페') || text.includes('명소') || text.includes('숙소') ||
      text.includes('호캉스') || text.includes('관광') || text.includes('호텔') ||
      text.includes('베이커리') || text.includes('우동') || text.includes('식당') ||
      text.includes('료칸') || text.includes('캠핑') || text.includes('차박')
    ) {
      return 'travel';
    }

    // 7. 생활꿀팁
    if (
      text.includes('살림') || text.includes('다이소') || text.includes('아이폰') ||
      text.includes('갤럭시') || text.includes('꿀기능') || text.includes('카카오톡') ||
      text.includes('옷장') || text.includes('정리') || text.includes('사운드바') ||
      text.includes('베이킹') || text.includes('퍼스널') || text.includes('세탁기')
    ) {
      return 'lifestyle';
    }

    // 8. 경제·재테크
    if (
      text.includes('환율') || text.includes('증시') || text.includes('주식') ||
      text.includes('코스피') || text.includes('금리') || text.includes('재테크') ||
      text.includes('수익') || text.includes('조회수') || text.includes('매출') ||
      text.includes('머니') || text.includes('투자') || text.includes('달러') ||
      text.includes('금융') || text.includes('비트코인') || text.includes('경제') ||
      text.includes('지원금') || text.includes('절세') || text.includes('연말정산') ||
      text.includes('배당') || text.includes('etf') || text.includes('소수점')
    ) {
      return 'economy';
    }

    // 9. 직장·자기계발
    if (
      text.includes('스타트업') || text.includes('직장인') || text.includes('퇴사') ||
      text.includes('취업') || text.includes('이직') || text.includes('채용') ||
      text.includes('학교') || text.includes('교육') || text.includes('에듀테크') ||
      text.includes('담아코치') || text.includes('다마코치') || text.includes('인터뷰') ||
      text.includes('1인 기업') || text.includes('사례') || text.includes('생존기') ||
      text.includes('홍보') || text.includes('마케팅') || text.includes('자기계발') ||
      text.includes('자격증') || text.includes('루틴') || text.includes('시간관리') ||
      text.includes('독서') || text.includes('영어') || text.includes('노션') ||
      text.includes('브랜딩') || text.includes('seo')
    ) {
      return 'career';
    }

    return 'tech';
  }

  function updateCounts(items) {
    // 1) 회원별 카운트
    const mCounts = { all: items.length };
    BLOG_MEMBERS.forEach(m => { mCounts[m] = 0; });

    // 2) 주제별 카운트
    const cCounts = { all: items.length };
    Object.keys(NEWS_CATEGORIES).forEach(c => { cCounts[c] = 0; });

    items.forEach(item => {
      const member = getPostMember(item);
      if (member && mCounts[member] !== undefined) {
        mCounts[member]++;
      }
      const catKey = classifyPostCategory(item);
      if (catKey && cCounts[catKey] !== undefined) {
        cCounts[catKey]++;
      }
    });

    // 회원별 DOM 업데이트
    const allEl = document.getElementById('countAll');
    if (allEl) allEl.textContent = mCounts.all;
    BLOG_MEMBERS.forEach(m => {
      const el = document.getElementById(`count_${m}`);
      if (el) el.textContent = mCounts[m] || 0;
    });

    // 주제별 DOM 업데이트
    const catAllEl = document.getElementById('countCatAll');
    if (catAllEl) catAllEl.textContent = cCounts.all;
    Object.keys(NEWS_CATEGORIES).forEach(c => {
      const capitalized = c.charAt(0).toUpperCase() + c.slice(1);
      const el = document.getElementById(`count${capitalized}`);
      if (el) el.textContent = cCounts[c] || 0;
    });
  }

  function renderArchiveList(items) {
    savedPostsList = deduplicatePosts(items);
    const postItems = savedPostsList;
    archiveCount.textContent = postItems.length;
    updateCounts(postItems);

    let filtered = postItems;
    if (filterMode === 'member') {
      filtered = selectedMember === 'all'
        ? postItems
        : postItems.filter(it => getPostMember(it) === selectedMember);
    } else {
      filtered = selectedCategory === 'all'
        ? postItems
        : postItems.filter(it => classifyPostCategory(it) === selectedCategory);
    }

    if (filtered.length === 0) {
      const emptyMsg = filterMode === 'member'
        ? `[${escapeHtml(selectedMember)}] 회원님에게 배정된 글이 없습니다.`
        : `[${NEWS_CATEGORIES[selectedCategory]?.label || selectedCategory}] 분야에 해당하는 글이 없습니다.`;
      archiveList.innerHTML = `<div style="text-align:center;padding:28px 10px;font-size:11px;color:#94a3b8;">${emptyMsg}</div>`;
      return;
    }

    archiveList.innerHTML = filtered.map((item) => {
      const isSelected = currentPost?.title === item.title;
      const photoCount = item.images?.length || 0;
      const member = getPostMember(item);
      const catKey = classifyPostCategory(item);
      const catInfo = NEWS_CATEGORIES[catKey] || NEWS_CATEGORIES.tech;
      const originalIdx = items.indexOf(item);
      
      let millis = Date.now();
      if (item.createdAt?._seconds) {
        millis = item.createdAt._seconds * 1000;
      } else if (item.createdAt?.seconds) {
        millis = item.createdAt.seconds * 1000;
      } else if (typeof item.createdAt?.toMillis === 'function') {
        millis = item.createdAt.toMillis();
      } else if (typeof item.createdAt === 'number') {
        millis = item.createdAt;
      } else if (item.createdAt) {
        millis = new Date(item.createdAt).getTime() || Date.now();
      }

      const d = new Date(millis);
      const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      
      const memberBadge = member ? `
        <span class="cat-badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-weight:700;">
          👤 ${escapeHtml(member)}
        </span>
      ` : '';

      return `
        <div class="history-item ${isSelected ? 'active' : ''}" data-idx="${originalIdx}">
          <div class="h-title" style="display:flex;align-items:flex-start;gap:4px;flex-wrap:wrap;">
            ${memberBadge}
            <span class="cat-badge" style="background:${catInfo.bg};color:${catInfo.color};border:1px solid ${catInfo.border};">
              ${catInfo.emoji} ${catInfo.label}
            </span>
            <span style="flex:1;min-width:140px;word-break:keep-all;">${escapeHtml(item.title)}</span>
          </div>
          <div class="h-meta">
            <span>📷 ${photoCount}장 • ${(item.charCount || (item.content ? item.content.length : 0)).toLocaleString()}자</span>
            <span>${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');

    archiveList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        archiveList.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
        const idx = parseInt(el.getAttribute('data-idx') || '0', 10);
        const chosen = savedPostsList[idx];
        if (chosen) {
          applyPost(chosen, '📚 보관함에서 선택', true);
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 따뜻하고 사람이 직접 건네는 듯한 블로그 감성 캡션 생성 헬퍼
  function formatWarmBlogCaption(rawCaption, idx, postTitle = '') {
    const defaultCaptions = [
      '복잡하게 생각할 것 없이, 가장 중요한 포인트부터 편하게 짚어보았어요 💡',
      '하나씩 내 속도에 맞춰 따라 하다 보면 어느새 익숙해지실 거예요 ✨',
      '반복되는 번거로움을 덜어내고 온전히 나만의 시간에 집중하는 순간 🌿',
      '직접 경험해보며 느꼈던 유용한 작은 팁들도 함께 챙겨가셨으면 좋겠어요 😊',
    ];

    if (!rawCaption || typeof rawCaption !== 'string') {
      return defaultCaptions[idx % defaultCaptions.length];
    }

    // 1. 기계적인 접두어/기호 정제
    let c = rawCaption.trim()
      .replace(/^▲\s*/, '')
      .replace(/^\[?사진\s*\d+\]?\s*[-:·]*\s*/i, '')
      .replace(/^📷\s*/, '')
      .replace(/^사진\s*\d+\s*[-:·]*\s*/i, '')
      .trim();

    // 2. 제목이 통째로 들어있거나 너무 긴 헤드라인형 문구 감성 정제
    if (postTitle) {
      const cleanPostTitle = postTitle.replace(/^\[.*?\]\s*/, '').trim();
      if (c.includes(cleanPostTitle) || c.length > 35) {
        if (c.includes('핵심') || c.includes('한눈에') || c.includes('포인트')) {
          return '한눈에 쏙 들어오게 정리해둔 핵심 포인트예요. 천천히 살펴보세요 💡';
        }
        if (c.includes('워크플로우') || c.includes('구현') || c.includes('실무')) {
          return '직접 해보며 손에 익혔던 유용한 실전 과정이에요 ✨';
        }
        if (c.includes('생산성') || c.includes('단축') || c.includes('성과') || c.includes('자동화')) {
          return '반복되는 번거로움을 덜어내고 온전히 내 시간에 집중하는 순간 🌿';
        }
        if (c.includes('진단') || c.includes('치료') || c.includes('케어')) {
          return '불안한 마음을 덜어드리기 위해 하나하나 꼼꼼하게 살피는 중이에요 🩺';
        }
        if (c.includes('분위기') || c.includes('매장') || c.includes('공간')) {
          return '문 열고 들어서자마자 따뜻하고 아늑한 온기가 맞아주는 공간이에요 ☕';
        }
        if (c.includes('메뉴') || c.includes('요리') || c.includes('맛')) {
          return '정성 가득 담아낸 한 접시, 눈과 입이 모두 즐거워지는 순간이에요 🍽️';
        }
        return defaultCaptions[idx % defaultCaptions.length];
      }
    }

    // 3. 딱딱한 보고서식 명사형 종결어미를 다정한 대화형으로 전환
    if (c.endsWith('한눈에 보기')) {
      c = c.replace('한눈에 보기', '한눈에 보기 쉽게 정리해본 포인트예요 💡');
    } else if (c.endsWith('실전 워크플로우 구현')) {
      c = '직접 적용해보며 가장 손에 익고 유용했던 실전 과정이에요 ✨';
    } else if (c.endsWith('AI 자동화 환경')) {
      c = '차근차근 구축해보는 나만의 스마트한 업무 환경이에요 💻';
    } else if (c.endsWith('데이터 분석 성과')) {
      c = '반복 작업을 덜어내고 온전히 나만의 시간에 집중하는 순간 🌿';
    } else if (c.endsWith('꿀팁 상세 안내')) {
      c = '알아두면 든든한 꿀팁들을 모아보았어요 ✨';
    } else if (c.endsWith('성공적인 마무리')) {
      c = '이렇게 차근차근 정리하고 나니 마음까지 한결 가벼워지네요 😊';
    } else if (c.endsWith('맞춤 치료 계획')) {
      c = '궁금했던 점들을 편안하게 나누며 나에게 꼭 맞는 방법을 찾아가요 🩺';
    } else if (c.endsWith('쾌적한 원내 공간')) {
      c = '머무시는 동안 마음까지 편안해질 수 있도록 아늑하게 정돈된 공간이에요 🤍';
    } else if (c.endsWith('감성적인 매장 분위기')) {
      c = '따뜻한 온기와 은은한 조명이 머무는 내내 편안함을 주는 곳이에요 ☕';
    } else if (c.endsWith('시그니처 대표 메뉴')) {
      c = '정성스럽게 담아낸 한 접시, 눈으로 먼저 맛보는 설레는 순간이에요 🍽️';
    } else if (c.endsWith('여유로운 디저트 페어링과 포토존')) {
      c = '달콤한 디저트와 함께 도란도란 이야기를 나누기 딱 좋은 자리예요 🍰';
    }

    return c;
  }

  function formatContentToHtml(rawContent, images, postTitleContext = '') {
    if (!rawContent) return '';

    // 이미 완성된 HTML 태그 형태인지 판별
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(rawContent);
    if (hasHtmlTags) {
      return rawContent;
    }

    let md = rawContent;

    // 1. 헤딩 앞뒤 개행 정규화 (헤딩과 리스트/본문이 붙는 문제 방지)
    md = md.replace(/(^|\n)(#{1,4}\s+[^\n]+)\n([^\n])/g, '$1$2\n\n$3');

    // 2. 마크다운 테이블 -> 고품격 HTML 테이블 변환
    const parseMarkdownTables = (text) => {
      const lines = text.split('\n');
      const out = [];
      let inTable = false;
      let tableRows = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          inTable = true;
          tableRows.push(line);
        } else {
          if (inTable) {
            out.push(renderHtmlTable(tableRows));
            tableRows = [];
            inTable = false;
          }
          out.push(lines[i]);
        }
      }
      if (inTable) {
        out.push(renderHtmlTable(tableRows));
      }
      return out.join('\n');
    };

    const renderHtmlTable = (rows) => {
      if (rows.length < 2) return rows.join('\n');
      const headerCells = rows[0].split('|').slice(1, -1).map((c) => c.trim());
      const isSeparator = /^\|?(\s*:?-+:?\s*\|?)+$/.test(rows[1]);
      const bodyRowStartIndex = isSeparator ? 2 : 1;

      let tableHtml = `<div style="overflow-x:auto;margin:24px 0 20px 0;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">`;
      tableHtml += `<table style="width:100%;border-collapse:collapse;margin:0;font-size:13.5px;color:#334155;text-align:left;">`;
      tableHtml += `<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">`;
      headerCells.forEach((h) => {
        tableHtml += `<th style="padding:10px 12px;font-weight:700;color:#0f172a;white-space:nowrap;">${h}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;

      for (let r = bodyRowStartIndex; r < rows.length; r++) {
        const cells = rows[r].split('|').slice(1, -1).map((c) => c.trim());
        const bg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
        tableHtml += `<tr style="background:${bg};border-bottom:1px solid #f1f5f9;">`;
        cells.forEach((cell, idx) => {
          const isFirst = idx === 0;
          const weight = isFirst ? '600' : '400';
          const color = isFirst ? '#0f172a' : '#475569';
          tableHtml += `<td style="padding:9px 12px;font-weight:${weight};color:${color};line-height:1.5;">${cell}</td>`;
        });
        tableHtml += `</tr>`;
      }
      tableHtml += `</tbody></table></div>`;
      return tableHtml;
    };

    md = parseMarkdownTables(md);

    // 3. 체크리스트 (- [ ] / - [x]) -> 체크 카드 박스 변환
    md = md.replace(/(?:^[ \t]*-[ \t]*\[[ xX]\][ \t]*.+\n?)+/gm, (match) => {
      const items = match.trim().split('\n');
      let out = `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin:20px 0;">`;
      out += `<div style="font-weight:700;color:#0284c7;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span>📋</span> 자가진단 및 핵심 체크리스트</div>`;
      items.forEach((it) => {
        const isChecked = /\[[xX]\]/.test(it);
        const label = it.replace(/^[ \t]*-[ \t]*\[[ xX]\][ \t]*/, '');
        const icon = isChecked ? '☑' : '☐';
        const color = isChecked ? '#0284c7' : '#64748b';
        out += `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13.5px;color:#1e293b;line-height:1.5;"><span style="color:${color};font-weight:700;font-size:15px;">${icon}</span><span>${label}</span></div>`;
      });
      out += `</div>`;
      return out;
    });

    // 4. Red Flag 주의사항 경고 박스
    md = md.replace(
      /^>\s*(?:🚨|\[!WARNING\]|\[!CAUTION\])\s*(.+)$/gm,
      `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 10px 10px 0;padding:12px 16px;margin:20px 0;"><strong style="color:#b91c1c;font-size:14px;display:block;margin-bottom:4px;">🚨 주의사항 (Red Flag)</strong><p style="margin:0;color:#991b1b;font-size:13.5px;line-height:1.65;">$1</p></div>`
    );

    // 5. 핵심 포인트 요약 박스
    md = md.replace(
      /^>\s*(?:💡|\[!NOTE\]|\[!TIP\]|\[!IMPORTANT\])\s*(.+)$/gm,
      `<div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:12px 16px;margin:20px 0;"><strong style="color:#1d4ed8;font-size:14px;display:block;margin-bottom:4px;">💡 핵심 포인트 요약</strong><p style="margin:0;color:#1e3a8a;font-size:13.5px;line-height:1.65;">$1</p></div>`
    );

    // 6. 마크다운 헤딩 변환
    md = md.replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;color:#334155;margin:28px 0 12px 0;border-bottom:2px solid #f1f5f9;padding-bottom:6px;letter-spacing:-0.02em;">$1</h3>');
    md = md.replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:800;color:#0f172a;border-left:4px solid #ff5722;padding-left:10px;margin:34px 0 14px 0;letter-spacing:-0.025em;line-height:1.4;">$1</h2>');
    md = md.replace(/^# (.+)$/gm, '<h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:28px 0 14px 0;letter-spacing:-0.025em;">$1</h2>');
    
    // 7. 볼드 및 이탤릭
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;font-weight:700;">$1</strong>');
    md = md.replace(/\*(.+?)\*/g, '<em style="color:#475569;">$1</em>');
    
    // 8. 인용구
    md = md.replace(/^> (.+)$/gm, '<blockquote style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:12px 16px;margin:20px 0;color:#1e293b;font-size:14px;line-height:1.75;letter-spacing:-0.02em;">$1</blockquote>');

    // 9. 문단 분리
    const blocks = md.split(/\n\n+/).filter(b => b.trim());
    let imgIndex = 0;
    const renderedBlocks = [];

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<table') || trimmed.startsWith('<div')) {
        renderedBlocks.push(trimmed);
      } else {
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);

        const hasOrderedList = lines.length > 0 && lines.some(l => /^\d+\.\s+/.test(l));
        const isUnorderedList = lines.length > 0 && lines.every(l => /^[-*]\s+/.test(l));

        if (hasOrderedList) {
          lines.forEach(li => {
            renderedBlocks.push(`<p style="font-size:14.5px;line-height:1.85;color:#334155;margin-bottom:14px;word-break:keep-all;letter-spacing:-0.02em;">${li}</p>`);
          });
        } else if (isUnorderedList) {
          const items = lines.map(li => `<li style="margin-bottom:8px;line-height:1.8;word-break:keep-all;letter-spacing:-0.02em;color:#334155;">${li.replace(/^[-*]\s+/, '')}</li>`).join('');
          renderedBlocks.push(`<ul style="margin:14px 0 20px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#334155;letter-spacing:-0.02em;">${items}</ul>`);
        } else {
          renderedBlocks.push(`<p style="font-size:14.5px;line-height:1.85;color:#334155;margin-bottom:16px;word-break:keep-all;letter-spacing:-0.02em;">${trimmed.replace(/\n/g, '<br>')}</p>`);
        }
      }

      // 단락 중간중간 실사 이미지 배치
      if (images && images.length > 0 && imgIndex < images.length) {
        if (idx === 1 || (idx > 1 && idx % 3 === 0)) {
          const imgObj = images[imgIndex];
          const url = typeof imgObj === 'string' ? imgObj : (imgObj.url || imgObj.src || '');
          const rawCap = typeof imgObj === 'string' ? '' : (imgObj.caption || imgObj.name || '');
          const caption = formatWarmBlogCaption(rawCap, imgIndex, postTitleContext);
          const warmIcons = ['📸', '☕', '✨', '💡', '🌿'];
          const icon = warmIcons[imgIndex % warmIcons.length];
          if (url) {
            renderedBlocks.push(`
              <div class="img-wrap">
                <img src="${url}" alt="${escapeHtml(caption)}" loading="lazy" style="max-height:280px;object-fit:cover;" onerror="this.style.display='none'" />
                <div class="img-caption">${icon} ${escapeHtml(caption)}</div>
              </div>
            `);
            imgIndex++;
          }
        }
      }
    });

    // 남아있는 이미지가 있다면 끝에 추가
    while (images && imgIndex < images.length) {
      const imgObj = images[imgIndex];
      const url = typeof imgObj === 'string' ? imgObj : (imgObj.url || imgObj.src || '');
      const rawCap = typeof imgObj === 'string' ? '' : (imgObj.caption || imgObj.name || '');
      const caption = formatWarmBlogCaption(rawCap, imgIndex, postTitleContext);
      const warmIcons = ['📸', '☕', '✨', '💡', '🌿'];
      const icon = warmIcons[imgIndex % warmIcons.length];
      if (url) {
        renderedBlocks.push(`
          <div class="img-wrap">
            <img src="${url}" alt="${escapeHtml(caption)}" loading="lazy" style="max-height:280px;object-fit:cover;" onerror="this.style.display='none'" />
            <div class="img-caption">${icon} ${escapeHtml(caption)}</div>
          </div>
        `);
      }
      imgIndex++;
    }

    return renderedBlocks.join('\n');
  }

  function renderFullPreview(post) {
    if (!post || !renderedArticle) return;

    const photoCount = post.images?.length || 0;
    const charCount = post.charCount || (post.content ? post.content.length : 0);

    if (previewPhotosChip) previewPhotosChip.textContent = `📷 사진 ${photoCount}장`;
    if (previewCharsChip) previewCharsChip.textContent = `${charCount.toLocaleString()}자`;

    // 1. 상단 사진 가로 스트립 (섬네일 갤러리)
    let imagesStripHtml = '';
    if (post.images && post.images.length > 0) {
      imagesStripHtml = `
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:6px;display:flex;align-items:center;gap:4px;">
            <span>📸 첨부 실사 사진 (${post.images.length}장)</span>
          </div>
          <div class="art-photos-strip">
            ${post.images.map((img, i) => {
              const url = typeof img === 'string' ? img : (img.url || img.src || '');
              const rawCap = typeof img === 'string' ? '' : (img.caption || img.name || '');
              const cap = formatWarmBlogCaption(rawCap, i, post.title);
              return `
                <div class="photo-thumb-card">
                  <a href="${url}" target="_blank" title="새 탭에서 원본 보기">
                    <img src="${url}" alt="${escapeHtml(cap)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&q=80'" />
                  </a>
                  <p title="${escapeHtml(cap)}">${escapeHtml(cap)}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 2. 핵심 요약 박스
    let summaryHtml = '';
    if (post.excerpt) {
      summaryHtml = `
        <div class="art-summary-box">
          <strong style="display:block;margin-bottom:4px;color:#1d4ed8;font-size:12px;">📌 핵심 요약</strong>
          ${escapeHtml(post.excerpt)}
        </div>
      `;
    }

    // 3. 본문 텍스트 변환 및 렌더링
    const bodyContentHtml = formatContentToHtml(post.content, post.images, post.title);
    const bodyHtml = `<div class="rendered-body">${bodyContentHtml}</div>`;

    // 4. 자주 묻는 질문 FAQ
    let faqHtml = '';
    if (post.faqs && post.faqs.length > 0) {
      faqHtml = `
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <h3 style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:10px;">❓ 자주 묻는 질문 (FAQ)</h3>
          ${post.faqs.map(f => `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
              <p style="font-size:12.5px;font-weight:700;color:#0f172a;margin-bottom:4px;">Q. ${escapeHtml(f.question)}</p>
              <p style="font-size:12px;color:#475569;line-height:1.55;margin:0;">${escapeHtml(f.answer)}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 5. 해시태그
    let tagsHtml = '';
    if (post.tags && post.tags.length > 0) {
      tagsHtml = `
        <div class="art-tags">
          ${post.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
        </div>
      `;
    }

    const catKey = classifyPostCategory(post);
    const catInfo = NEWS_CATEGORIES[catKey] || NEWS_CATEGORIES.tech;

    const member = getPostMember(post);
    const memberHeaderBadge = member ? `
      <span class="cat-badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-size:11px;padding:3px 8px;font-weight:700;">
        👤 ${escapeHtml(member)}
      </span>
    ` : '';

    renderedArticle.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">
        ${memberHeaderBadge}
        <span class="cat-badge" style="background:${catInfo.bg};color:${catInfo.color};border:1px solid ${catInfo.border};font-size:11px;padding:3px 8px;">
          ${catInfo.emoji} ${catInfo.label}
        </span>
        ${post.category ? `<span style="font-size:11px;color:#64748b;font-weight:600;">• ${escapeHtml(post.category)}</span>` : ''}
      </div>
      <h1>${escapeHtml(post.title)}</h1>
      ${tagsHtml}
      ${imagesStripHtml}
      ${summaryHtml}
      ${bodyHtml}
      ${faqHtml}
    `;

    if (previewContentScroll) {
      previewContentScroll.scrollTop = 0;
    }
  }

  function applyPost(post, sourceText, isProd) {
    currentPost = post;
    chrome.storage.local.set({ cachedPost: post });

    sourceDomain.textContent = sourceText;
    sourceChip.textContent = isProd ? '🌐 선택된 글' : '💻 로컬 글';
    sourceChip.style.background = isProd ? '#dcfce7' : '#eff6ff';
    sourceChip.style.color = isProd ? '#15803d' : '#1d4ed8';

    const photoCount = post.images?.length || 0;
    photosChip.textContent = `📷 사진 ${photoCount}장`;

    const memberChip = document.getElementById('memberChip');
    const member = getPostMember(post);
    if (memberChip) {
      if (member) {
        memberChip.style.display = 'inline-block';
        memberChip.textContent = `👤 ${member}`;
      } else {
        memberChip.style.display = 'none';
      }
    }

    pTitleEl.textContent = currentPost.title;
    pExcerptEl.textContent = currentPost.excerpt || (currentPost.content ? currentPost.content.slice(0, 80) : '') + '...';
    loadingEl.style.display = 'none';
    postContentEl.style.display = 'block';
    
    // 우측 실시간 본문 전체 렌더링
    renderFullPreview(currentPost);

    updatePlatformButtons();
    if (isTistory || isNaver) {
      btnPost.classList.remove('btn-disabled');
      btnPost.disabled = false;
    }
  }

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const trimmed = text.trim();

        // 1. JSON 포맷 시도
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && (parsed.title || parsed.content)) {
            applyPost(parsed, '📋 클립보드 (JSON)', true);
            return;
          }
        } catch (e) {}

        // 2. 일반 텍스트 / 마크다운 스마트 파싱 (첫 줄 = 제목, 나머지 = 본문)
        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const rawTitle = lines[0].replace(/^[#*>\s]+/, '').trim();
          const contentLines = trimmed.split('\n').slice(1).join('\n').trim();

          // 태그 추출 (예: 태그: #사주, #운세 또는 태그: 사주, 운세)
          let extractedTags = ['AI자동화', '블로그'];
          const tagMatch = trimmed.match(/(?:태그|키워드|tags?)\s*[:：]\s*([^\n]+)/i);
          if (tagMatch) {
            extractedTags = tagMatch[1].split(/[,#\s]+/).filter(Boolean);
          }

          const fallbackPost = {
            title: rawTitle,
            excerpt: lines[1] ? lines[1].slice(0, 100) : rawTitle,
            content: contentLines || rawTitle,
            htmlContent: '',
            images: [],
            tags: extractedTags,
            faqs: [],
            updatedAt: Date.now(),
          };
          applyPost(fallbackPost, '📋 클립보드 (텍스트 변환)', true);
          return;
        }
      }
      alert('클립보드에 블로그 글 내용이 없습니다.');
    } catch (e) {
      alert('클립보드 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.');
    }
  });

  btnRefresh.addEventListener('click', async () => {
    btnRefresh.textContent = '동기화 중...';
    await loadPostData();
    btnRefresh.textContent = '🔄 동기화';
  });

  await loadPostData();

  // 6. 플랫폼별 100% 직통 주입 실행
  btnPost.addEventListener('click', async () => {
    if (!currentPost) {
      alert('주입할 블로그 글 데이터가 없습니다.');
      return;
    }
    if (!activeTab || !activeTab.id || (!isTistory && !isNaver)) {
      await openOrSwitchToEditor(activePlatform === 'naver' ? 'naver' : 'tistory');
      return;
    }

    const platformName = isTistory ? '티스토리' : '네이버 블로그';
    btnPostText.textContent = `⚡ ${platformName}에 작성 중...`;
    btnPost.disabled = true;

    try {
      if (isTistory) {
        // 1순위: content.js 티스토리 엔진에 다이렉트 메시지 전송
        try {
          const res = await chrome.tabs.sendMessage(activeTab.id, {
            action: 'RUN_TISTORY_AUTO_WRITE',
            post: currentPost,
          });
          if (res && res.success) {
            btnPostText.textContent = '✅ 티스토리 100% 자동 완성!';
            setTimeout(() => window.close(), 1200);
            return;
          }
        } catch (msgErr) {
          console.log('[popup] content.js 미연결, 직접 스크립트 실행으로 전환...');
        }

        // 2순위: 티스토리 직통 스크립트 실행 (MAIN 월드 TinyMCE 및 Iframe)
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: (post) => {
            // A. 제목 입력
            const titleSelectors = [
              '#post-title-inp',
              '#post-title',
              'textarea#post-title',
              'input#post-title',
              'input[name="title"]',
              'textarea[name="title"]',
              '.tit_post textarea',
              'textarea[placeholder*="제목"]',
              'input[placeholder*="제목"]',
            ];
            for (const s of titleSelectors) {
              const el = document.querySelector(s);
              if (el) {
                el.focus();
                el.value = post.title || '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                break;
              }
            }

            // B. 이미지 및 HTML 빌드
            const validImages = (post.images || []).filter((img) => {
              const u = typeof img === 'string' ? img : (img?.url || img?.src);
              return Boolean(u && typeof u === 'string' && u.startsWith('http'));
            });

            const formatWarmBlogCaption = (rawCaption, idx, postTitle = '') => {
              const defaultCaptions = [
                '복잡하게 생각할 것 없이, 가장 중요한 포인트부터 편하게 짚어보았어요 💡',
                '하나씩 내 속도에 맞춰 따라 하다 보면 어느새 익숙해지실 거예요 ✨',
                '반복되는 번거로움을 덜어내고 온전히 나만의 시간에 집중하는 순간 🌿',
                '직접 경험해보며 느꼈던 유용한 작은 팁들도 함께 챙겨가셨으면 좋겠어요 😊',
              ];

              if (!rawCaption || typeof rawCaption !== 'string') {
                return defaultCaptions[idx % defaultCaptions.length];
              }

              let c = rawCaption.trim()
                .replace(/^▲\s*/, '')
                .replace(/^\[?사진\s*\d+\]?\s*[-:·]*\s*/i, '')
                .replace(/^📷\s*/, '')
                .replace(/^사진\s*\d+\s*[-:·]*\s*/i, '')
                .trim();

              if (postTitle) {
                const cleanPostTitle = postTitle.replace(/^\[.*?\]\s*/, '').trim();
                if (c.includes(cleanPostTitle) || c.length > 35) {
                  if (c.includes('핵심') || c.includes('한눈에') || c.includes('포인트')) {
                    return '한눈에 쏙 들어오게 정리해둔 핵심 포인트예요. 천천히 살펴보세요 💡';
                  }
                  if (c.includes('워크플로우') || c.includes('구현') || c.includes('실무')) {
                    return '직접 해보며 손에 익혔던 유용한 실전 과정이에요 ✨';
                  }
                  if (c.includes('생산성') || c.includes('단축') || c.includes('성과') || c.includes('자동화')) {
                    return '반복되는 번거로움을 덜어내고 온전히 내 시간에 집중하는 순간 🌿';
                  }
                  if (c.includes('진단') || c.includes('치료') || c.includes('케어')) {
                    return '불안한 마음을 덜어드리기 위해 하나하나 꼼꼼하게 살피는 중이에요 🩺';
                  }
                  if (c.includes('분위기') || c.includes('매장') || c.includes('공간')) {
                    return '문 열고 들어서자마자 따뜻하고 아늑한 온기가 맞아주는 공간이에요 ☕';
                  }
                  if (c.includes('메뉴') || c.includes('요리') || c.includes('맛')) {
                    return '정성 가득 담아낸 한 접시, 눈과 입이 모두 즐거워지는 순간이에요 🍽️';
                  }
                  return defaultCaptions[idx % defaultCaptions.length];
                }
              }

              if (c.endsWith('한눈에 보기')) {
                c = c.replace('한눈에 보기', '한눈에 보기 쉽게 정리해본 포인트예요 💡');
              } else if (c.endsWith('실전 워크플로우 구현')) {
                c = '직접 적용해보며 가장 손에 익고 유용했던 실전 과정이에요 ✨';
              } else if (c.endsWith('AI 자동화 환경')) {
                c = '차근차근 구축해보는 나만의 스마트한 업무 환경이에요 💻';
              } else if (c.endsWith('데이터 분석 성과')) {
                c = '반복 작업을 덜어내고 온전히 나만의 시간에 집중하는 순간 🌿';
              } else if (c.endsWith('꿀팁 상세 안내')) {
                c = '알아두면 든든한 꿀팁들을 모아보았어요 ✨';
              } else if (c.endsWith('성공적인 마무리')) {
                c = '이렇게 차근차근 정리하고 나니 마음까지 한결 가벼워지네요 😊';
              } else if (c.endsWith('맞춤 치료 계획')) {
                c = '궁금했던 점들을 편안하게 나누며 나에게 꼭 맞는 방법을 찾아가요 🩺';
              } else if (c.endsWith('쾌적한 원내 공간')) {
                c = '머무시는 동안 마음까지 편안해질 수 있도록 아늑하게 정돈된 공간이에요 🤍';
              } else if (c.endsWith('감성적인 매장 분위기')) {
                c = '따뜻한 온기와 은은한 조명이 머무는 내내 편안함을 주는 곳이에요 ☕';
              } else if (c.endsWith('시그니처 대표 메뉴')) {
                c = '정성스럽게 담아낸 한 접시, 눈으로 먼저 맛보는 설레는 순간이에요 🍽️';
              } else if (c.endsWith('여유로운 디저트 페어링과 포토존')) {
                c = '달콤한 디저트와 함께 도란도란 이야기를 나누기 딱 좋은 자리예요 🍰';
              }
              return c;
            };

            const getCleanCaption = (img, idx) => {
              let raw = '';
              if (typeof img === 'object') {
                raw = img.caption || img.name || img.description || '';
              }
              return formatWarmBlogCaption(raw, idx, post.title);
            };

            const insertedIndices = new Set();
            const makeImageBlock = (img, idx) => {
              const url = typeof img === 'string' ? img : (img.url || img.src);
              const caption = getCleanCaption(img, idx);
              insertedIndices.add(idx);
              const warmIcons = ['📸', '☕', '✨', '💡', '🌿'];
              const icon = warmIcons[idx % warmIcons.length];
              return `
<figure class="imageblock alignCenter" style="text-align:center;margin:34px auto;max-width:720px;display:block;">
  <img src="${url}" alt="${caption}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,0.08);display:block;margin:0 auto;" />
  <figcaption style="font-size:13.5px;color:#64748b;margin-top:10px;line-height:1.6;display:block;text-align:center;font-weight:500;letter-spacing:-0.01em;">${icon} ${caption}</figcaption>
</figure>`;
            };

            let md = post.content || '';
            md = md.replace(/(^|\n)(#{1,4}\s+[^\n]+)\n([^\n])/g, '$1$2\n\n$3');

            // 마크다운 테이블 변환
            const parseMarkdownTables = (text) => {
              const lines = text.split('\n');
              const out = [];
              let inTable = false;
              let tableRows = [];

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('|') && line.endsWith('|')) {
                  inTable = true;
                  tableRows.push(line);
                } else {
                  if (inTable) {
                    out.push(renderHtmlTable(tableRows));
                    tableRows = [];
                    inTable = false;
                  }
                  out.push(lines[i]);
                }
              }
              if (inTable) {
                out.push(renderHtmlTable(tableRows));
              }
              return out.join('\n');
            };

            const renderHtmlTable = (rows) => {
              if (rows.length < 2) return rows.join('\n');
              const headerCells = rows[0].split('|').slice(1, -1).map((c) => c.trim());
              const isSeparator = /^\|?(\s*:?-+:?\s*\|?)+$/.test(rows[1]);
              const bodyRowStartIndex = isSeparator ? 2 : 1;

              let tableHtml = `<div style="overflow-x:auto;margin:32px 0 28px 0;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.03);">`;
              tableHtml += `<table style="width:100%;border-collapse:collapse;margin:0;font-size:14.5px;color:#334155;text-align:left;">`;
              tableHtml += `<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">`;
              headerCells.forEach((h) => {
                tableHtml += `<th style="padding:14px 16px;font-weight:700;color:#0f172a;white-space:nowrap;">${h}</th>`;
              });
              tableHtml += `</tr></thead><tbody>`;

              for (let r = bodyRowStartIndex; r < rows.length; r++) {
                const cells = rows[r].split('|').slice(1, -1).map((c) => c.trim());
                const bg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
                tableHtml += `<tr style="background:${bg};border-bottom:1px solid #f1f5f9;">`;
                cells.forEach((cell, idx) => {
                  const isFirst = idx === 0;
                  const weight = isFirst ? '600' : '400';
                  const color = isFirst ? '#0f172a' : '#475569';
                  tableHtml += `<td style="padding:13px 16px;font-weight:${weight};color:${color};line-height:1.6;">${cell}</td>`;
                });
                tableHtml += `</tr>`;
              }
              tableHtml += `</tbody></table></div>`;
              return tableHtml;
            };

            md = parseMarkdownTables(md);

            // 체크리스트
            md = md.replace(/(?:^[ \t]*-[ \t]*\[[ xX]\][ \t]*.+\n?)+/gm, (match) => {
              const items = match.trim().split('\n');
              let out = `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 22px;margin:26px 0;">`;
              out += `<div style="font-weight:800;color:#0284c7;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px;"><span>📋</span> 자가진단 및 핵심 체크리스트</div>`;
              items.forEach((it) => {
                const isChecked = /\[[xX]\]/.test(it);
                const label = it.replace(/^[ \t]*-[ \t]*\[[ xX]\][ \t]*/, '');
                const icon = isChecked ? '☑' : '☐';
                const color = isChecked ? '#0284c7' : '#64748b';
                out += `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:14.5px;color:#1e293b;line-height:1.6;"><span style="color:${color};font-weight:800;font-size:16px;">${icon}</span><span>${label}</span></div>`;
              });
              out += `</div>`;
              return out;
            });

            // Red Flag & 핵심 요약
            md = md.replace(
              /^>\s*(?:🚨|\[!WARNING\]|\[!CAUTION\])\s*(.+)$/gm,
              `<div style="background:#fef2f2;border-left:5px solid #ef4444;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;"><strong style="color:#b91c1c;font-size:15px;display:block;margin-bottom:6px;">🚨 주의사항 (Red Flag)</strong><p style="margin:0;color:#991b1b;font-size:14.5px;line-height:1.7;">$1</p></div>`
            );
            md = md.replace(
              /^>\s*(?:💡|\[!NOTE\]|\[!TIP\]|\[!IMPORTANT\])\s*(.+)$/gm,
              `<div style="background:#eff6ff;border-left:5px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;"><strong style="color:#1d4ed8;font-size:15px;display:block;margin-bottom:6px;">💡 핵심 포인트 요약</strong><p style="margin:0;color:#1e3a8a;font-size:14.5px;line-height:1.7;">$1</p></div>`
            );

            md = md.replace(/^##\s+(.+)$/gm, '<h2 style="font-size:21px;font-weight:800;color:#0f172a;border-left:5px solid #ff5722;padding-left:14px;margin:46px 0 20px 0;line-height:1.45;letter-spacing:-0.025em;">$1</h2>');
            md = md.replace(/^###\s+(.+)$/gm, '<h3 style="font-size:17.5px;font-weight:700;color:#1e293b;border-bottom:2px solid #f1f5f9;padding-bottom:8px;margin:36px 0 16px 0;line-height:1.45;letter-spacing:-0.02em;">$1</h3>');
            md = md.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;font-weight:700;">$1</strong>');
            md = md.replace(/^>\s*(.+)$/gm, '<blockquote style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:16px 20px;margin:24px 0;color:#1e293b;font-size:15px;line-height:1.75;">$1</blockquote>');

            // 이미지 치환
            validImages.forEach((img, idx) => {
              const pattern = new RegExp(`\\[IMAGE_${idx + 1}\\]`, 'gi');
              if (pattern.test(md)) {
                md = md.replace(pattern, makeImageBlock(img, idx));
              }
            });
            md = md.replace(/\*?\s*📷\s*사진\s*#?\d+\s*\*?/g, '');
            md = md.replace(/\[IMAGE_\d+\]/g, '');

            const rawBlocks = md.split(/\n\n+/).filter((b) => b.trim());
            const finalBlocks = [];
            let imgPtr = 0;

            rawBlocks.forEach((block, bIdx) => {
              const trimmed = block.trim();
              if (
                trimmed.startsWith('<h') ||
                trimmed.startsWith('<table') ||
                trimmed.startsWith('<blockquote') ||
                trimmed.startsWith('<div') ||
                trimmed.startsWith('<figure') ||
                trimmed.startsWith('<ul') ||
                trimmed.startsWith('<ol')
              ) {
                finalBlocks.push(trimmed);
              } else {
                const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
                const hasOrderedList = lines.length > 0 && lines.some((l) => /^\d+\.\s+/.test(l));
                const isUnorderedList = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l));

                if (hasOrderedList) {
                  lines.forEach((line) => {
                    finalBlocks.push(
                      `<p style="font-size:15.5px;line-height:1.85;color:#334155;margin-bottom:16px;word-break:keep-all;">${line}</p>`
                    );
                  });
                } else if (isUnorderedList) {
                  const listItems = lines
                    .map((line) => {
                      const itemContent = line.replace(/^[-*]\s+/, '');
                      return `<li style="margin-bottom:12px;line-height:1.85;word-break:keep-all;color:#334155;">${itemContent}</li>`;
                    })
                    .join('');
                  finalBlocks.push(
                    `<ul style="margin:18px 0 24px 0;padding-left:24px;font-size:15.5px;line-height:1.85;color:#334155;">${listItems}</ul>`
                  );
                } else {
                  finalBlocks.push(
                    `<p style="font-size:15.5px;line-height:1.85;color:#334155;margin-bottom:22px;word-break:keep-all;">${trimmed.replace(/\n/g, '<br>')}</p>`
                  );
                }
              }

              while (imgPtr < validImages.length && insertedIndices.has(imgPtr)) {
                imgPtr++;
              }
              if (imgPtr < validImages.length) {
                if (bIdx === 1 || (bIdx > 1 && bIdx % 3 === 0)) {
                  finalBlocks.push(makeImageBlock(validImages[imgPtr], imgPtr));
                  imgPtr++;
                }
              }
            });

            while (imgPtr < validImages.length) {
              if (!insertedIndices.has(imgPtr)) {
                finalBlocks.push(makeImageBlock(validImages[imgPtr], imgPtr));
              }
              imgPtr++;
            }

            const summaryBox = post.excerpt
              ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 22px;margin-bottom:30px;line-height:1.65;"><strong style="color:#1d4ed8;font-size:14.5px;display:block;margin-bottom:6px;">📌 핵심 요약 미리보기</strong><p style="font-size:14.5px;color:#1e3a8a;margin:0;">${post.excerpt}</p></div>`
              : '';
            const faqBox =
              post.faqs && post.faqs.length > 0 && !md.includes('자주 묻는 질문')
                ? `<div style="margin-top:44px;padding-top:28px;border-top:2px solid #f1f5f9;"><h3 style="font-size:18.5px;font-weight:800;color:#0f172a;margin-bottom:18px;">❓ 자주 묻는 질문 (FAQ)</h3>${post.faqs.map((f) => `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 22px;margin-bottom:14px;"><p style="font-size:15px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">Q. ${f.question}</p><p style="font-size:14.5px;color:#475569;margin:0;line-height:1.7;">${f.answer}</p></div>`).join('')}</div>`
              : '';
            const tagChips =
              post.tags && post.tags.length > 0
                ? `<div style="margin-top:36px;padding-top:22px;border-top:1px solid #e2e8f0;">${post.tags.map((t) => `<span style="background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;border-radius:20px;padding:6px 14px;font-size:13px;font-weight:600;display:inline-block;margin-right:8px;margin-bottom:8px;">#${t}</span>`).join('')}</div>`
                : '';

            const fullHtml = `${summaryBox}\n${finalBlocks.join('\n')}\n${faqBox}\n${tagChips}`;

            // C. MAIN 월드 TinyMCE 스크립트 주입
            try {
              const script = document.createElement('script');
              script.textContent = `
                (function() {
                  const html = ${JSON.stringify(fullHtml)};
                  let ok = false;
                  try {
                    if (window.tinymce && window.tinymce.activeEditor) {
                      window.tinymce.activeEditor.setContent(html);
                      window.tinymce.activeEditor.fire('change');
                      window.tinymce.activeEditor.fire('input');
                      if (window.tinymce.activeEditor.undoManager) {
                        window.tinymce.activeEditor.undoManager.add();
                      }
                      ok = true;
                    }
                  } catch(e) {}
                  if (!ok && window.tinymce && window.tinymce.editors) {
                    try {
                      for (const k in window.tinymce.editors) {
                        const ed = window.tinymce.editors[k];
                        if (ed && typeof ed.setContent === 'function') {
                          ed.setContent(html);
                          ed.fire('change');
                          ed.fire('input');
                          ok = true;
                        }
                      }
                    } catch(e) {}
                  }
                })();
              `;
              (document.head || document.documentElement).appendChild(script);
              script.remove();
            } catch (e) {}

            // D. Iframe 탐색 주입
            let injected = false;
            const iframes = document.querySelectorAll('iframe');
            for (const ifr of iframes) {
              try {
                const iDoc = ifr.contentDocument || ifr.contentWindow?.document;
                if (iDoc) {
                  if (ifr.contentWindow?.tinymce?.activeEditor) {
                    ifr.contentWindow.tinymce.activeEditor.setContent(fullHtml);
                    ifr.contentWindow.tinymce.activeEditor.fire('change');
                    ifr.contentWindow.tinymce.activeEditor.fire('input');
                    injected = true;
                    break;
                  }
                  const tBody = iDoc.querySelector('#tinymce, body.mce-content-body, body[contenteditable="true"]');
                  if (tBody) {
                    tBody.innerHTML = fullHtml;
                    tBody.dispatchEvent(new Event('input', { bubbles: true }));
                    tBody.dispatchEvent(new Event('change', { bubbles: true }));
                    injected = true;
                    break;
                  }
                }
              } catch (e) {}
            }

            // E. ContentEditable (주의: #editor-root는 페이지 전체 컨테이너이므로 절대 주입 금지!)
            if (!injected) {
              const editables = document.querySelectorAll('.mce-content-body, [contenteditable="true"]');
              for (const el of editables) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') continue;
                const elId = (el.id || '').toLowerCase();
                const elClass = (el.className || '').toString().toLowerCase();

                // 최상위 컨테이너나 제목 입력란은 건너뜀
                if (
                  elId === 'editor-root' ||
                  elId.includes('title') ||
                  elClass.includes('title') ||
                  el.getAttribute('placeholder')?.includes('제목') ||
                  el.getAttribute('data-placeholder')?.includes('제목')
                ) {
                  continue;
                }

                // 순수 본문 편집 영역인 경우에만 주입 후 즉시 중단
                if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
                  el.focus();
                  el.innerHTML = fullHtml;
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  el.dispatchEvent(new Event('change', { bubbles: true }));
                  injected = true;
                  break;
                }
              }
            }

            // F. CodeMirror (HTML Mode)
            if (!injected) {
              const cm = document.querySelector('.CodeMirror')?.CodeMirror;
              if (cm) {
                cm.setValue(fullHtml);
                cm.refresh();
                injected = true;
              }
            }

            // G. 태그
            if (post.tags && post.tags.length > 0) {
              const tagInput = document.querySelector(
                'input#tagText, #tagText, .tf_tag, .tag_post input, input[placeholder*="태그"]'
              );
              if (tagInput) {
                for (const tag of post.tags) {
                  tagInput.focus();
                  tagInput.value = tag;
                  tagInput.dispatchEvent(new Event('input', { bubbles: true }));
                  tagInput.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, code: 'Enter', bubbles: true })
                  );
                  tagInput.dispatchEvent(
                    new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, code: 'Enter', which: 13, bubbles: true })
                  );
                }
              }
            }
            return { success: true };
          },
          args: [currentPost],
        });

        btnPostText.textContent = '✅ 티스토리 100% 자동 완성!';
        setTimeout(() => window.close(), 1200);

      } else if (isNaver) {
        // 네이버 스마트에디터 ONE (고화질 차트 + 사진 CDN 업로드 + 가운데 정렬 엔진)
        const naverMode = document.querySelector('input[name="postAction"]:checked')?.value || 'draft';
        btnPostText.textContent = '⚡ 네이버 에디터에 자동 작성 중...';
        btnPost.disabled = true;

        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            action: 'RUN_AUTO_WRITE',
            post: currentPost,
            mode: naverMode,
          });
          btnPostText.textContent = naverMode === 'draft' ? '✅ 네이버 임시저장 완료!' : '✅ 네이버 즉시발행 완료!';
          setTimeout(() => window.close(), 1500);
        } catch (msgErr) {
          // content.js가 아직 주입되지 않은 경우 동적 주입 후 재호출
          try {
            await chrome.scripting.executeScript({
              target: { tabId: activeTab.id, allFrames: true },
              files: ['content.js'],
            });
            await new Promise((r) => setTimeout(r, 500));
            await chrome.tabs.sendMessage(activeTab.id, {
              action: 'RUN_AUTO_WRITE',
              post: currentPost,
              mode: naverMode,
            });
            btnPostText.textContent = naverMode === 'draft' ? '✅ 네이버 임시저장 완료!' : '✅ 네이버 즉시발행 완료!';
            setTimeout(() => window.close(), 1500);
          } catch (execErr) {
            console.error('네이버 자동 작성 실행 오류:', execErr);
            alert('네이버 블로그 에디터 탭을 새로고침한 후 다시 시도해 주세요.');
          }
        }
        btnPost.classList.remove('btn-disabled');
        btnPost.disabled = false;
      }
    } catch (e) {
      alert('오류 발생: ' + e.message);
      btnPost.disabled = false;
    }
  });
});
