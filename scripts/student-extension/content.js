// ============================================================================
// 🚀 네오앤피터 AI 블로그 원클릭 자동 포스팅 확장 프로그램 (Manifest V3)
// - neonpeter.com 웹사이트 실시간 글 데이터 연동
// - 네이버 스마트에디터 ONE 원클릭 플로팅 배너(HUD) 탑재
// - 브라우저 Canvas 860px (Retina 2x) 고화질 차트 인메모리 렌더링
// - 네이버 CDN 정식 이미지 업로드 및 가운데 정렬 자동화
// ============================================================================

(function () {
  'use strict';

  const href = window.location.href;
  const hostname = window.location.hostname;

  // 1. 네온피터 웹 플랫폼 감지 (neonpeter.com / localhost)
  const isNeonPeter = ['aiedu1.vercel.app','www.neonpeter.com','neonpeter.com'].includes(hostname);

  const hrefLower = href.toLowerCase();

  // 2. 네이버 블로그 글쓰기 에디터 창 감지 (대소문자 무관)
  const isNaverWriter =
    hostname.includes('naver.com') &&
    (hrefLower.includes('blog.naver.com') || hrefLower.includes('blog.editor.naver.com')) &&
    (hrefLower.includes('write') || hrefLower.includes('editor') || hrefLower.includes('postwrite') || hrefLower.includes('goblogwrite'));

  // 3. 티스토리 블로그 글쓰기 에디터 창 감지 (다양한 경로 지원)
  const isTistoryWriter =
    hostname.includes('tistory.com') &&
    (hrefLower.includes('/manage/newpost') || hrefLower.includes('/manage/post') || hrefLower.includes('/manage/entry/post') || hrefLower.includes('/manage/write') || hrefLower.includes('entry/write'));

  // --------------------------------------------------------------------------
  // [A] 네온피터 웹사이트에서의 동작 (글 데이터 자동 수신 및 크롬 스토리지 동기화)
  // --------------------------------------------------------------------------
  if (isNeonPeter) {
    try {
      document.documentElement.dataset.neonpeterExtension = '2.7.1';
    } catch (e) {}

    // window.postMessage 이벤트 수신
    window.addEventListener('message', async (event) => {
      if (event.source !== window || event.origin !== window.location.origin || !event.data) return;

      if (event.data.type === 'NEONPETER_SYNC_POST' && event.data.post) {
        try {
          await chrome.storage.local.set({
            latest_post: event.data.post,
            synced_at: Date.now(),
          });
          console.log('✅ [네온피터 확장] 글 데이터 크롬 스토리지 동기화 완료:', event.data.post.title);
        } catch (err) {
          console.error('[네온피터 확장] 스토리지 저장 오류:', err);
        }
      }

    });

    return; // 네온피터 페이지에서는 리스너만 등록 후 종료
  }

  // --------------------------------------------------------------------------
  // [B] 네이버 / 티스토리 블로그 에디터에서의 동작 (원클릭 플로팅 배너 및 자동 포스팅)
  // --------------------------------------------------------------------------
  if (!isNaverWriter && !isTistoryWriter) return;

  if (isNaverWriter) {
    console.log('🟢 [네온피터 확장] 네이버 블로그 에디터 프레임 감지됨');
  } else if (isTistoryWriter) {
    console.log('🟠 [네온피터 확장] 티스토리 블로그 에디터 감지됨');
  }

  // SVG -> 고해상도 PNG (860px, Retina 2x = 1720px) 브라우저 캔버스 변환기
  async function svgToPngFile(svgHtml, filename = 'chart.png', targetWidth = 860, scale = 2) {
    return new Promise((resolve, reject) => {
      try {
        let cleanSvg = svgHtml.trim();
        if (!cleanSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
          cleanSvg = cleanSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const vbMatch = cleanSvg.match(/viewBox=["']([0-9.\s-]+)["']/i);
        let origW = targetWidth;
        let origH = 450;
        if (vbMatch) {
          const parts = vbMatch[1].trim().split(/\s+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            origW = parts[2];
            origH = parts[3];
          }
        }

        const ratio = origH / origW;
        const finalW = targetWidth * scale; // 860 * 2 = 1720px
        const finalH = Math.round(finalW * ratio);

        const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = finalW;
            canvas.height = finalH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, finalW, finalH);
            URL.revokeObjectURL(url);

            canvas.toBlob((pngBlob) => {
              if (pngBlob) {
                const file = new File([pngBlob], filename, { type: 'image/png' });
                resolve(file);
              } else {
                reject(new Error('Canvas to Blob failed'));
              }
            }, 'image/png', 1.0);
          } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('SVG Image Load Failed'));
        };

        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  }

  // 외부 사진 URL -> File 객체 변환 (Unsplash, Pexels 등)
  async function urlToImageFile(url, filename = 'photo.jpg') {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const mime = blob.type || 'image/jpeg';
      const ext = mime.includes('png') ? 'png' : 'jpg';
      const finalName = filename.endsWith(ext) ? filename : `${filename}.${ext}`;
      return new File([blob], finalName, { type: mime });
    } catch (e) {
      console.warn('[네온피터 확장] 외부 사진 다운로드 실패:', url, e);
      return null;
    }
  }

  // 에디터 문서 스코프(iframe 또는 top doc) 획득
  function getEditorScope() {
    if (document.querySelector('.se-documentTitle, .se-main-container, [data-name="title"]')) {
      return { doc: document, win: window };
    }
    const iframes = document.querySelectorAll('iframe');
    for (const ifr of iframes) {
      try {
        const iDoc = ifr.contentDocument || ifr.contentWindow?.document;
        if (iDoc && iDoc.querySelector('.se-documentTitle, .se-main-container, [data-name="title"]')) {
          return { doc: iDoc, win: ifr.contentWindow };
        }
      } catch (e) {}
    }
    return { doc: document, win: window };
  }

  // 팝업 정리 (이어쓰기 취소, 도움말 닫기)
  async function dismissPopups(editorDoc) {
    const docs = [editorDoc, document];
    for (const doc of docs) {
      try {
        const cancelBtns = Array.from(doc.querySelectorAll('button')).filter((b) => {
          const t = b.textContent?.trim();
          return (t === '취소' || t === '새로 작성') && b.closest('.se-popup, .se-popup-container, .se-layer');
        });
        cancelBtns.forEach((b) => b.click());

        const cancelByClass = doc.querySelector('.se-popup-button-cancel, .se-popup-button:not(.se-popup-button-confirm)');
        if (cancelByClass) cancelByClass.click();

        const closeBtns = doc.querySelectorAll('.se-help-panel-close-button, .se-popup-close-button, button[aria-label="닫기"]');
        closeBtns.forEach((b) => b.click());
      } catch (e) {}
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  // 가운데 정렬 자동 클릭
  async function applyCenterAlignment(editorDoc) {
    await new Promise((r) => setTimeout(r, 600));
    const docs = [editorDoc, document];
    for (const doc of docs) {
      const buttons = Array.from(doc.querySelectorAll('button, .se-toolbar-button, .se-popup-button'));
      for (const b of buttons) {
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const dataName = (b.getAttribute('data-name') || '').toLowerCase();
        const dataValue = (b.getAttribute('data-value') || '').toLowerCase();
        const cls = (b.className || '').toLowerCase();
        const title = (b.getAttribute('title') || '').toLowerCase();
        if (
          (aria.includes('가운데') && !aria.includes('텍스트')) ||
          (title.includes('가운데') && !title.includes('텍스트')) ||
          dataValue === 'center' ||
          dataName.includes('align-center') ||
          cls.includes('align-center') ||
          cls.includes('se-popup-button-align-center')
        ) {
          b.click();
          return true;
        }
      }
    }
    return false;
  }

  // 이미지 파일 네이버 에디터에 주입 (네이버 CDN 정식 업로드 트리거)
  async function insertImageFile(editorDoc, file, caption = '') {
    // 1. 네이버의 숨겨진 file input 탐색
    let fileInput =
      editorDoc.querySelector('input[type="file"].se-file-uploader-input, input[type="file"][accept*="image"]') ||
      document.querySelector('input[type="file"].se-file-uploader-input, input[type="file"][accept*="image"]');

    if (fileInput) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // 2. Synthetic ClipboardEvent('paste')
      const bodyEl =
        editorDoc.querySelector(
          '.se-main-container [contenteditable="true"], .se-component-content [contenteditable="true"], article.se-canvas [contenteditable="true"], p.se-placeholder'
        ) || editorDoc.body;
      bodyEl.focus();
      const dt = new DataTransfer();
      dt.items.add(file);
      const pasteEvt = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      });
      bodyEl.dispatchEvent(pasteEvt);
    }

    // 네이버 서버 업로드 대기 (2.2초)
    await new Promise((r) => setTimeout(r, 2200));

    // 🌟 가운데 정렬 자동 적용 🌟
    await applyCenterAlignment(editorDoc);

    // 캡션 입력
    if (caption) {
      try {
        const cap = editorDoc.querySelector(
          '.se-component.se-image.se-is-selected .se-caption, .se-component.se-image:last-child .se-caption'
        );
        if (cap) {
          cap.focus();
          cap.innerText = caption;
          cap.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch (e) {}
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  // 본문 텍스트 블록 네이버 에디터에 안전 삽입
  async function insertTextBlock(editorDoc, htmlContent, plainText) {
    const bodyEl =
      editorDoc.querySelector(
        '.se-main-container [contenteditable="true"], .se-component-content [contenteditable="true"], article.se-canvas [contenteditable="true"], p.se-placeholder'
      ) || editorDoc.body;
    bodyEl.focus();

    try {
      const dt = new DataTransfer();
      dt.setData('text/html', htmlContent);
      dt.setData('text/plain', plainText);
      const pasteEvt = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      });
      bodyEl.dispatchEvent(pasteEvt);
    } catch (e) {}

    try {
      editorDoc.execCommand('insertHTML', false, htmlContent);
    } catch (e) {}

    bodyEl.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 400));
  }

  // 마크다운 및 태그 변환기
  function formatSectionHtml(mdText) {
    let html = mdText || '';
    // 말풍선 / 인용구
    html = html.replace(
      /^>\s*\[(?:말풍선|speech|인용)\]\s*(.+)$/gim,
      `<div style="margin:20px auto 14px auto;max-width:560px;text-align:center;"><div style="border:2px solid #03c75a;border-radius:14px;padding:12px 18px;background:#ffffff;display:inline-block;width:100%;box-sizing:border-box;"><p style="margin:0;font-size:15px;font-weight:bold;color:#03c75a;line-height:1.6;">$1</p></div><div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #03c75a;margin:-1px auto 10px auto;"></div></div>`
    );
    html = html.replace(
      /^>\s*(.+)$/gm,
      `<blockquote style="background:#f8fafc;border-left:4px solid #03c75a;padding:12px 16px;margin:18px 0;color:#1e293b;font-size:15px;line-height:1.7;">$1</blockquote>`
    );
    // 소제목
    html = html.replace(/^[①-⑩]\s*(.+)$/gm, `<h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:24px 0 8px 0;padding-left:8px;border-left:4px solid #03c75a;line-height:1.4;">$1</h3>`);
    html = html.replace(/^### (.+)$/gm, `<h3 style="font-size:16px;font-weight:700;color:#334155;margin:22px 0 8px 0;padding-bottom:4px;border-bottom:1px solid #eee;">$1</h3>`);
    html = html.replace(/^## (.+)$/gm, `<h2 style="font-size:19px;font-weight:800;color:#111;border-left:5px solid #03c75a;padding-left:10px;margin:28px 0 12px 0;line-height:1.4;">$1</h2>`);
    // 볼드 형광펜
    html = html.replace(/\*\*(.+?)\*\*/g, `<strong style="color:#111;font-weight:bold;background:linear-gradient(to top, #dcfce7 40%, transparent 40%);">$1</strong>`);

    // 단락 분리
    return html
      .split('\n\n')
      .filter((p) => p.trim())
      .map((p) => {
        if (p.startsWith('<h') || p.startsWith('<table') || p.startsWith('<blockquote') || p.startsWith('<div')) return p;
        return `<p style="font-size:15px;line-height:1.8;color:#333;margin-bottom:14px;word-break:keep-all;">${p.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
  }

  // --------------------------------------------------------------------------
  // 플로팅 UI 배너(HUD) 마운트 및 자동 실행
  // --------------------------------------------------------------------------
  async function initFloatingHud() {
    // 0. 에디터 캔버스가 렌더링될 때까지 최대 10초간 대기
    let hasEditor = false;
    for (let i = 0; i < 30; i++) {
      if (document.querySelector('.se-documentTitle, .se-main-container, [data-name="title"], article.se-canvas, .se-toolbar, .se-content')) {
        hasEditor = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    // 스마트에디터 ONE DOM이 없는 껍데기 프레임에서는 HUD를 띄우지 않음
    if (!hasEditor) {
      return;
    }

    let post = null;

    // 1. chrome.storage.local에서 최신 글 확인
    try {
      const storageData = await chrome.storage.local.get(['latest_post', 'synced_at']);
      if (storageData.latest_post && storageData.latest_post.title) {
        post = storageData.latest_post;
      }
    } catch (e) {}

    if (!post) {
      console.log('[네온피터 확장] 동기화된 최신 글이 없습니다.');
      return;
    }

    // 기존 HUD 제거
    const existing = document.getElementById('neonpeter-floating-hud');
    if (existing) existing.remove();

    const hud = document.createElement('div');
    hud.id = 'neonpeter-floating-hud';
    hud.style.cssText = `
      position: fixed;
      top: 18px;
      right: 24px;
      z-index: 999999999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 14px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
      border: 1px solid #334155;
      animation: npSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 600px;
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes npSlideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #neonpeter-floating-hud button:hover {
        filter: brightness(1.1);
      }
    `;
    document.head.appendChild(styleEl);

    if (isTistoryWriter) {
      hud.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="background:#ff5722;color:white;font-size:11px;font-weight:800;padding:3px 7px;border-radius:6px;box-shadow:0 2px 6px rgba(255,87,34,0.3);">티스토리 1초 완성</span>
          <div style="font-size:13px;font-weight:700;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f8fafc;" title="${post.title}">
            ${post.title}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button id="np-btn-run-tistory" style="background:#ff5722;color:white;border:none;border-radius:8px;padding:7px 13px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(255,87,34,0.35);">
            🚀 1초 자동 완성
          </button>
          <button id="np-btn-copy-tistory" style="background:#334155;color:#e2e8f0;border:none;border-radius:8px;padding:7px 11px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
            📋 본문 복사
          </button>
          <button id="np-btn-close" style="background:transparent;border:none;color:#94a3b8;font-size:15px;cursor:pointer;padding:4px 6px;">
            ✕
          </button>
        </div>
      `;

      document.body.appendChild(hud);

      document.getElementById('np-btn-close').addEventListener('click', () => {
        hud.remove();
      });

      const runBtn = document.getElementById('np-btn-run-tistory');
      runBtn.addEventListener('click', async () => {
        await executeTistoryAutoWriting(post, hud);
      });

      const copyBtn = document.getElementById('np-btn-copy-tistory');
      copyBtn.addEventListener('click', async () => {
        const fullHtml = buildTistoryFullHtml(post);
        try {
          const textToCopy = `${post.title}\n\n${post.content || ''}`;
          if (navigator.clipboard && window.ClipboardItem) {
            const textBlob = new Blob([textToCopy], { type: 'text/plain' });
            const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
            await navigator.clipboard.write([
              new ClipboardItem({ 'text/plain': textBlob, 'text/html': htmlBlob }),
            ]);
          } else {
            await navigator.clipboard.writeText(textToCopy);
          }
          copyBtn.textContent = '✅ 복사 완료!';
          setTimeout(() => {
            copyBtn.textContent = '📋 본문 복사';
          }, 2000);
        } catch (e) {}
      });
      return;
    }

    hud.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="background:#03c75a;color:white;font-size:11px;font-weight:800;padding:3px 7px;border-radius:6px;">네오앤피터 AI</span>
        <div style="font-size:13px;font-weight:700;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#f8fafc;" title="${post.title}">
          ${post.title}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <select id="np-mode-select" style="background:#1e293b;color:#cbd5e1;border:1px solid #475569;border-radius:6px;font-size:11.5px;padding:5px 6px;cursor:pointer;">
          <option value="draft" selected>💾 임시저장</option>
          <option value="publish">🚀 즉시발행</option>
        </select>
        <button id="np-btn-run" style="background:#03c75a;color:white;border:none;border-radius:8px;padding:7px 13px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(3,199,90,0.35);">
          🚀 1초 자동 완성
        </button>
        <button id="np-btn-close" style="background:transparent;border:none;color:#94a3b8;font-size:15px;cursor:pointer;padding:4px 6px;">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(hud);

    document.getElementById('np-btn-close').addEventListener('click', () => {
      hud.remove();
    });

    const runBtn = document.getElementById('np-btn-run');
    runBtn.addEventListener('click', async () => {
      const mode = document.getElementById('np-mode-select')?.value || 'draft';
      await executeAutoWriting(post, mode, hud);
    });
  }

  // --------------------------------------------------------------------------
  // 스마트에디터 ONE 전체 글쓰기 자동화 루틴
  // --------------------------------------------------------------------------
  async function executeAutoWriting(post, mode, hud) {
    const setStatus = (msg, color = '#38bdf8') => {
      hud.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:16px;">⚡</span>
          <span style="font-size:13px;font-weight:800;color:${color};">${msg}</span>
        </div>
      `;
    };

    try {
      setStatus('에디터 스코프 탐색 중...');
      const { doc: editorDoc } = getEditorScope();

      // 1. 방해 팝업 정리
      setStatus('🧹 방해 팝업(이어쓰기) 정리 중...');
      await dismissPopups(editorDoc);

      // 2. 제목 입력
      setStatus('📝 제목 입력 중...');
      let titleLoc = editorDoc.querySelector('.se-documentTitle [contenteditable="true"], .se-title-text, [data-name="title"]');
      if (titleLoc) {
        titleLoc.focus();
        try {
          const sel = editorDoc.getSelection();
          const range = editorDoc.createRange();
          range.selectNodeContents(titleLoc);
          sel.removeAllRanges();
          sel.addRange(range);
          editorDoc.execCommand('delete', false, null);
          editorDoc.execCommand('insertText', false, post.title);
        } catch (e) {
          titleLoc.innerText = post.title;
        }
        titleLoc.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: post.title }));
        titleLoc.dispatchEvent(new Event('change', { bubbles: true }));

        // 제목에서 Enter 눌러 본문으로 커서 이동
        titleLoc.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        await new Promise((r) => setTimeout(r, 400));
      }

      // 3. 본문 텍스트 및 인포그래픽/사진 파싱
      setStatus('🎨 고화질 인포그래픽 & 사진 렌더링 준비 중...');

      // 본문에서 SVG 추출
      const rawContent = post.content || post.htmlContent || '';
      const svgs = [];
      const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
      let m;
      while ((m = svgRegex.exec(rawContent)) !== null) {
        svgs.push(m[0]);
      }

      // SVG 제거된 순수 텍스트 본문
      let cleanContent = rawContent.replace(/<svg[\s\S]*?<\/svg>/gi, '\n\n');
      // 프레임워크 태그 정리
      cleanContent = cleanContent.replace(/\[(?:Interest|Attention|Desire|Action|Problem|Agitate|Solution|Before|After|Bridge|Feature|Advantage|Benefit)\]\s*/gi, '');

      // 단락 분할
      const rawSections = cleanContent.split(/\n(?=## |\d+\.\s|\*\*\[)/).filter((s) => s.trim());

      // 4. 서론 텍스트 삽입
      setStatus('✍️ 서론 및 개요 작성 중...');
      if (rawSections.length > 0) {
        const introHtml = formatSectionHtml(rawSections[0]);
        await insertTextBlock(editorDoc, introHtml, rawSections[0]);
      }

      // 5. 실사 사진 순차 주입 (가운데 정렬)
      if (post.images && post.images.length > 0) {
        for (let i = 0; i < Math.min(post.images.length, 6); i++) {
          const imgObj = post.images[i];
          const imgUrl = imgObj.url || imgObj.src;
          const caption = imgObj.caption || imgObj.name || `생생한 현장 안내 ${i + 1}`;

          if (imgUrl && imgUrl.startsWith('http')) {
            setStatus(`📷 실사 사진 업로드 중 (${i + 1}/${post.images.length})...`);
            const photoFile = await urlToImageFile(imgUrl, `naver_photo_${i + 1}.jpg`);
            if (photoFile) {
              await insertImageFile(editorDoc, photoFile, caption);
            }
          }

          // 해당 단락 텍스트 삽입
          if (rawSections[i + 1]) {
            const secHtml = formatSectionHtml(rawSections[i + 1]);
            await insertTextBlock(editorDoc, secHtml, rawSections[i + 1]);
          }
        }
      }

      // 6. 고화질 SVG 인포그래픽 차트 3종 캔버스 변환 및 주입
      if (svgs.length > 0) {
        const chartLabels = ['전략 핵심 요약 카드', '점유율 및 데이터 분석 파이차트', '단계별 실무 추진 로드맵'];
        for (let sIdx = 0; sIdx < svgs.length; sIdx++) {
          const label = chartLabels[sIdx] || `인포그래픽 차트 ${sIdx + 1}`;
          setStatus(`📊 860px 고화질 차트 생성 중 (${sIdx + 1}/${svgs.length}): ${label}...`);

          try {
            const chartFile = await svgToPngFile(svgs[sIdx], `chart_${sIdx + 1}.png`, 860, 2);
            await insertImageFile(editorDoc, chartFile, `📊 [핵심 인포그래픽] ${label}`);
          } catch (chartErr) {
            console.warn('차트 캔버스 렌더링 오류:', chartErr);
          }
        }
      }

      // 7. FAQ 및 태그 마무리
      if (post.faqs && post.faqs.length > 0) {
        setStatus('❓ FAQ 자주 묻는 질문 완성 중...');
        const faqHtml = `<div style="margin-top:30px;padding-top:16px;border-top:1px solid #e5e7eb;"><h3 style="font-size:17px;font-weight:800;color:#111;margin-bottom:12px;">❓ 자주 묻는 질문 (FAQ)</h3>${post.faqs
          .map(
            (f) =>
              `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin-bottom:8px;"><p style="font-size:14px;font-weight:bold;color:#111;margin:0 0 4px 0;">Q. ${f.question}</p><p style="font-size:13px;color:#4b5563;margin:0;line-height:1.6;">${f.answer}</p></div>`
          )
          .join('')}</div>`;
        await insertTextBlock(editorDoc, faqHtml, '');
      }

      // 8. 임시저장 또는 발행
      if (mode === 'draft') {
        setStatus('💾 안전하게 [임시저장] 실행 중...', '#22c55e');
        await new Promise((r) => setTimeout(r, 800));
        const saveBtn =
          editorDoc.querySelector('.se-document-save-btn') ||
          Array.from(document.querySelectorAll('button')).find((b) => {
            const t = b.textContent?.trim();
            return t?.startsWith('저장') && !b.closest('.se-popup');
          });
        if (saveBtn) saveBtn.click();
        setStatus('🎉 네이버 블로그에 사진·차트·서식 임시저장 완료!', '#4ade80');
      } else {
        setStatus('🚀 [발행] 진행 중...', '#38bdf8');
        const pubBtn =
          document.querySelector('button.publish_btn__m9nsq, button.se-document-publish-btn') ||
          Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === '발행');
        if (pubBtn) {
          pubBtn.click();
          await new Promise((r) => setTimeout(r, 800));
          // 태그 입력
          if (post.tags && post.tags.length > 0) {
            const tagInput = document.querySelector('input.tag_input, input[placeholder*="태그"]');
            if (tagInput) {
              for (const t of post.tags) {
                tagInput.value = t;
                tagInput.dispatchEvent(new Event('input', { bubbles: true }));
                tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                await new Promise((r) => setTimeout(r, 100));
              }
            }
          }
          const confirmBtn =
            document.querySelector('button.confirm_btn__qE1s3, button.btn_apply') ||
            Array.from(document.querySelectorAll('button')).find((b) => b.closest('.publish_layer') && b.textContent?.trim() === '발행');
          if (confirmBtn) confirmBtn.click();
          setStatus('🎉 네이버 블로그 즉시 발행 완료!', '#4ade80');
        }
      }

      setTimeout(() => {
        if (hud) hud.remove();
      }, 5000);
    } catch (err) {
      console.error('[네온피터 확장] 자동 작성 오류:', err);
      setStatus(`❌ 작성 중 오류 발생: ${err.message}`, '#f87171');
    }
  }

  // --------------------------------------------------------------------------
  // 티스토리 스마트에디터 전체 글쓰기 자동화 루틴
  // --------------------------------------------------------------------------

  function buildTistoryFullHtml(post) {
    const validImages = (post.images || []).filter((img) => {
      const u = typeof img === 'string' ? img : (img?.url || img?.src);
      return Boolean(u && typeof u === 'string' && u.startsWith('http'));
    });

    // 따뜻하고 사람이 직접 건네는 듯한 블로그 감성 캡션 생성 헬퍼
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
    };

    const getCaption = (img, idx) => {
      let raw = '';
      if (typeof img === 'object') {
        raw = img.caption || img.name || img.description || '';
      }
      return formatWarmBlogCaption(raw, idx, post.title);
    };

    const makeImageBlock = (img, idx) => {
      const url = typeof img === 'string' ? img : (img.url || img.src);
      const caption = getCaption(img, idx);
      const warmIcons = ['📸', '☕', '✨', '💡', '🌿'];
      const icon = warmIcons[idx % warmIcons.length];
      return `
<figure class="imageblock alignCenter" style="text-align:center;margin:34px auto;max-width:720px;display:block;">
  <img src="${url}" alt="${caption}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,0.08);display:block;margin:0 auto;" />
  <figcaption style="font-size:13.5px;color:#64748b;margin-top:10px;line-height:1.6;display:block;text-align:center;font-weight:500;letter-spacing:-0.01em;">${icon} ${caption}</figcaption>
</figure>`;
    };

    let md = post.content || '';

    // 1. 헤딩 앞뒤 개행 정규화
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

      let tableHtml = `<div style="overflow-x:auto;margin:32px 0 28px 0;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.03);">`;
      tableHtml += `<table style="width:100%;border-collapse:collapse;margin:0;font-size:14.5px;color:#334155;text-align:left;">`;
      tableHtml += `<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">`;
      headerCells.forEach((h) => {
        tableHtml += `<th style="padding:14px 16px;font-weight:700;color:#0f172a;white-space:nowrap;letter-spacing:-0.01em;">${h}</th>`;
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
          tableHtml += `<td style="padding:13px 16px;font-weight:${weight};color:${color};line-height:1.6;letter-spacing:-0.01em;">${cell}</td>`;
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

    // 4. Red Flag 주의사항 경고 박스
    md = md.replace(
      /^>\s*(?:🚨|\[!WARNING\]|\[!CAUTION\])\s*(.+)$/gm,
      `<div style="background:#fef2f2;border-left:5px solid #ef4444;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;"><strong style="color:#b91c1c;font-size:15px;display:block;margin-bottom:6px;">🚨 주의사항 (Red Flag)</strong><p style="margin:0;color:#991b1b;font-size:14.5px;line-height:1.7;">$1</p></div>`
    );

    // 5. 핵심 포인트 요약 박스
    md = md.replace(
      /^>\s*(?:💡|\[!NOTE\]|\[!TIP\]|\[!IMPORTANT\])\s*(.+)$/gm,
      `<div style="background:#eff6ff;border-left:5px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;"><strong style="color:#1d4ed8;font-size:15px;display:block;margin-bottom:6px;">💡 핵심 포인트 요약</strong><p style="margin:0;color:#1e3a8a;font-size:14.5px;line-height:1.7;">$1</p></div>`
    );

    // 6. 말풍선 및 인용구
    md = md.replace(
      /^>\s*\[(?:말풍선|speech|인용)\]\s*(.+)$/gim,
      `<div style="margin:28px auto 20px auto;max-width:540px;text-align:center;"><div style="border:2px solid #cbd5e1;border-radius:14px;padding:16px 22px;background:#ffffff;box-shadow:0 4px 14px rgba(0,0,0,0.04);display:inline-block;width:100%;box-sizing:border-box;"><p style="margin:0;font-size:15.5px;font-weight:bold;color:#e11d48;line-height:1.6;letter-spacing:-0.02em;">$1</p></div><div style="width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid #cbd5e1;margin:-1px auto 16px auto;"></div></div>`
    );
    md = md.replace(
      /^>\s*(.+)$/gm,
      '<blockquote style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:16px 20px;margin:24px 0;color:#1e293b;font-size:15px;line-height:1.75;letter-spacing:-0.02em;">$1</blockquote>'
    );

    // 7. 헤딩 서식
    md = md.replace(
      /^##\s+(.+)$/gm,
      '<h2 style="font-size:21px;font-weight:800;color:#0f172a;border-left:5px solid #ff5722;padding-left:14px;margin:46px 0 20px 0;line-height:1.45;letter-spacing:-0.025em;">$1</h2>'
    );
    md = md.replace(
      /^###\s+(.+)$/gm,
      '<h3 style="font-size:17.5px;font-weight:700;color:#1e293b;border-bottom:2px solid #f1f5f9;padding-bottom:8px;margin:36px 0 16px 0;line-height:1.45;letter-spacing:-0.02em;">$1</h3>'
    );
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;font-weight:700;">$1</strong>');

    // 8. 이미지 플레이스홀더 치환
    const insertedIndices = new Set();
    validImages.forEach((img, idx) => {
      const pattern = new RegExp(`\\[IMAGE_${idx + 1}\\]`, 'gi');
      if (pattern.test(md)) {
        md = md.replace(pattern, makeImageBlock(img, idx));
        insertedIndices.add(idx);
      }
    });
    md = md.replace(/\*?\s*📷\s*사진\s*#?\d+\s*\*?/g, '');
    md = md.replace(/\[IMAGE_\d+\]/g, '');

    // 9. 블록 분할 및 이미지 인터리빙
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
              `<p style="font-size:15.5px;line-height:1.85;color:#334155;margin-bottom:16px;word-break:keep-all;letter-spacing:-0.02em;">${line}</p>`
            );
          });
        } else if (isUnorderedList) {
          const listItems = lines
            .map((line) => {
              const itemContent = line.replace(/^[-*]\s+/, '');
              return `<li style="margin-bottom:12px;line-height:1.85;word-break:keep-all;letter-spacing:-0.02em;color:#334155;">${itemContent}</li>`;
            })
            .join('');
          finalBlocks.push(
            `<ul style="margin:18px 0 24px 0;padding-left:24px;font-size:15.5px;line-height:1.85;color:#334155;letter-spacing:-0.02em;">${listItems}</ul>`
          );
        } else {
          finalBlocks.push(
            `<p style="font-size:15.5px;line-height:1.85;color:#334155;margin-bottom:22px;word-break:keep-all;letter-spacing:-0.02em;">${trimmed.replace(/\n/g, '<br>')}</p>`
          );
        }
      }

      // 이미지 삽입
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

    return `${summaryBox}\n${finalBlocks.join('\n')}\n${faqBox}\n${tagChips}`;
  }

  async function executeTistoryAutoWriting(post, hud) {
    const setStatus = (msg, color = '#ff5722') => {
      if (hud) {
        hud.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${color};animation:npPulse 1s infinite;"></div>
            <span style="font-size:13px;font-weight:700;color:#f8fafc;">${msg}</span>
          </div>
        `;
      }
      console.log(`[네온피터 확장][티스토리] ${msg}`);
    };

    try {
      setStatus('⚡ 제목 입력 및 서식 변환 중...', '#ff5722');

      // 1. 제목 입력
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
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.focus();
          el.value = post.title || '';
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }

      // 2. 본문 HTML 빌드
      const fullHtml = buildTistoryFullHtml(post);

      setStatus('📝 티스토리 에디터에 본문·사진·표 주입 중...', '#f59e0b');

      // 3. 본문 주입: Strategy A - MAIN World Script Injection (TinyMCE 공식 API 직접 호출)
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

      await new Promise((r) => setTimeout(r, 250));

      // Strategy B - TinyMCE Iframe 직접 탐색 및 DOM 주입
      let tistoryInjected = false;
      const iframes = document.querySelectorAll('iframe');
      for (const ifr of iframes) {
        try {
          const iDoc = ifr.contentDocument || ifr.contentWindow?.document;
          if (iDoc) {
            if (ifr.contentWindow?.tinymce?.activeEditor) {
              ifr.contentWindow.tinymce.activeEditor.setContent(fullHtml);
              ifr.contentWindow.tinymce.activeEditor.fire('change');
              ifr.contentWindow.tinymce.activeEditor.fire('input');
              tistoryInjected = true;
              break;
            }
            const tBody = iDoc.querySelector('#tinymce, body.mce-content-body, body[contenteditable="true"]');
            if (tBody) {
              tBody.innerHTML = fullHtml;
              tBody.dispatchEvent(new Event('input', { bubbles: true }));
              tBody.dispatchEvent(new Event('change', { bubbles: true }));
              tistoryInjected = true;
              break;
            }
          }
        } catch (e) {}
      }

      // Strategy C - ContentEditable (주의: #editor-root는 페이지 전체 컨테이너이므로 절대 주입 금지!)
      if (!tistoryInjected) {
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
            tistoryInjected = true;
            break;
          }
        }
      }

      // Strategy D - CodeMirror (HTML Mode)
      if (!tistoryInjected) {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        if (cm) {
          cm.setValue(fullHtml);
          cm.refresh();
          tistoryInjected = true;
        }
      }

      // 4. 태그 입력
      if (post.tags && post.tags.length > 0) {
        setStatus('🏷️ 태그 등록 중...', '#3b82f6');
        const tagSelectors = [
          'input#tagText',
          '#tagText',
          '.tf_tag',
          '.tag_post input',
          'input[placeholder*="태그"]',
        ];
        let tagInput = null;
        for (const ts of tagSelectors) {
          tagInput = document.querySelector(ts);
          if (tagInput) break;
        }
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
            await new Promise((r) => setTimeout(r, 80));
          }
        }
      }

      setStatus('🎉 티스토리에 사진·서식·표 100% 자동 완성!', '#10b981');
      setTimeout(() => {
        if (hud) hud.remove();
      }, 4000);
    } catch (err) {
      console.error('[네온피터 확장] 티스토리 작성 오류:', err);
      setStatus(`❌ 작성 중 오류 발생: ${err.message}`, '#f87171');
    }
  }

  // 팝업에서 보낸 자동 작성 명령 수신
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'RUN_AUTO_WRITE' || request.action === 'RUN_TISTORY_AUTO_WRITE') {
      let hud = document.getElementById('neonpeter-floating-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'neonpeter-floating-hud';
        hud.style.cssText = `
          position: fixed; top: 18px; right: 24px; z-index: 999999999;
          background: #0f172a; color: #ffffff; padding: 12px 18px;
          border-radius: 14px; box-shadow: 0 16px 36px rgba(0,0,0,0.4);
          font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
        `;
        document.body.appendChild(hud);
      }

      if (isTistoryWriter || request.action === 'RUN_TISTORY_AUTO_WRITE') {
        executeTistoryAutoWriting(request.post, hud).then(() => {
          sendResponse({ success: true });
        });
      } else {
        const modeToUse = request.mode || 'draft';
        executeAutoWriting(request.post, modeToUse, hud).then(() => {
          sendResponse({ success: true });
        });
      }
      return true; // 비동기 응답 채널 유지
    }
  });

  // DOM 준비 시 HUD 마운트 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initFloatingHud, 1200));
  } else {
    setTimeout(initFloatingHud, 1200);
  }
})();
