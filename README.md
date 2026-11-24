# 株式会社スタジオレゾナンス 公式サイト（https://re-son.jp）

Netlify で公開している静的サイトです。`main` ブランチへ反映すると自動で公開されます（`public/` をそのまま公開）。

## 更新のしかた
- 実績：`build/works.json` を編集 → `python3 build/build.py` で `public/` を再生成
- トップページ本文：`build/index.body.html`
- プライバシーポリシー：`build/privacy.body.html`
- 見た目：`public/css/style.css`、動き：`public/js/main.js`
- 共通のヘッダー・フッター、実績カード、カテゴリ一覧は `build/build.py`

`public/` 内の HTML は生成物なので直接編集しないこと。
