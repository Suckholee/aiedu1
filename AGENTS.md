<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI/UX 기본 규칙

폼과 입력 UI를 변경할 때는 `docs/design/ui-ux-basics.md`를 확인한다. 전화번호 입력은 공통 `PhoneInput`을 사용하며, 숫자만 입력해도 자동으로 하이픈이 표시되어야 한다.
