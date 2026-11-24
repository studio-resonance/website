#!/usr/bin/env python3
"""サイトのHTMLを生成するスクリプト。

使い方:  python3 build/build.py
- 実績は build/works.json を編集する（上にあるものほど新しい／トップに表示）
- 生成物は public/ に書き出され、Netlify は public/ をそのまま公開する
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
DOMAIN = "https://re-son.jp"
TOP_LIMIT = 6  # トップページに表示する実績の件数
CATEGORIES = ["CM（TV・WEB）", "TV番組", "行政", "PR動画", "採用動画", "セミナー・講演会収録", "YouTube"]

e = html.escape
works = json.loads((ROOT / "build" / "works.json").read_text(encoding="utf-8"))

for w in works:
    for c in w["categories"]:
        assert c in CATEGORIES, f"未定義のカテゴリ: {c}"


def head(title, description, path, noindex=False):
    url = DOMAIN + path
    robots = '\n<meta name="robots" content="noindex">' if noindex else ""
    return f"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">{robots}
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="株式会社スタジオレゾナンス">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{DOMAIN}/images/ogp.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap">
<link rel="stylesheet" href="/css/style.css">
<script>document.documentElement.classList.add('js')</script>
"""


HEADER = """<header class="header" id="header">
  <div class="wrap header-inner">
    <a class="logo" href="/">STUDIO RESONANCE</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="メニューを開く">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav" id="site-nav" aria-label="メインメニュー">
      <a href="/works/">WORKS</a>
      <a href="/#service">SERVICE</a>
      <a href="/#company">COMPANY</a>
      <a class="btn btn-accent" href="/#contact">お問い合わせ</a>
    </nav>
  </div>
</header>
"""

FOOTER = """<footer class="footer pattern-dark" data-header="dark">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-name">株式会社スタジオレゾナンス</p>
      <p class="footer-addr">沖縄県那覇市首里汀良町2-7-20 あしゃぎガーデン102</p>
    </div>
    <nav aria-label="フッターメニュー">
      <a href="/works/">WORKS</a><a href="/#service">SERVICE</a><a href="/#company">COMPANY</a><a href="/#contact">CONTACT</a><a href="/privacy/">プライバシーポリシー</a>
    </nav>
    <p class="copy">© 2026 STUDIO RESONANCE Inc.</p>
  </div>
</footer>
<script src="/js/main.js" defer></script>
</body>
</html>
"""


def card(w, index):
    title = e(w["title"])
    if "instagram" in w:
        ig = w["instagram"]
        thumb = (f'<div class="thumb thumb-ig"><iframe src="https://www.instagram.com/reel/{ig}/embed/" '
                 f'title="{title}（Instagram）" loading="lazy" scrolling="no" allowtransparency="true"></iframe></div>')
    else:
        yt = w["youtube"]
        thumb = (f'<button type="button" class="thumb" data-yt="{yt}" aria-label="再生：{title}">'
                 f'<img src="https://i.ytimg.com/vi/{yt}/hqdefault.jpg" alt="" loading="lazy">'
                 f'<span class="play" aria-hidden="true"></span></button>')
    rows = f"<dt>クライアント</dt><dd>{e(w['client'])}</dd>"
    if w.get("agency"):
        rows += f"<dt>広告代理店</dt><dd>{e(w['agency'])}</dd>"
    if w.get("extra"):
        rows += f"<dt>{e(w['extra'][0])}</dt><dd>{e(w['extra'][1])}</dd>"
    rows += f"<dt>担当</dt><dd>{e(w['role'])}</dd>"
    return f"""      <article class="work reveal" data-cat="{e('|'.join(w['categories']))}">
        {thumb}
        <span class="cat">{e('／'.join(w['categories']))}</span>
        <h3 class="title">{title}</h3>
        <dl class="credit">{rows}</dl>
      </article>"""


def filters():
    btns = ['<button type="button" data-filter="all" aria-pressed="true">すべて</button>']
    btns += [f'<button type="button" data-filter="{e(c)}" aria-pressed="false">{e(c)}</button>' for c in CATEGORIES]
    return ('<div class="filters" role="group" aria-label="カテゴリで絞り込み">\n        '
            + "\n        ".join(btns) + "\n      </div>")


def works_grid(limit=None):
    attr = f' data-limit="{limit}"' if limit else ""
    cards = "\n".join(card(w, i) for i, w in enumerate(works))
    return f'<div class="works-grid"{attr}>\n{cards}\n    </div>'


def write(path, text):
    p = PUBLIC / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")


# ---------------------------------------------------------------- トップページ
index_body = (ROOT / "build" / "index.body.html").read_text(encoding="utf-8")
index_body = index_body.replace("{{WORKS_FILTERS}}", filters()).replace("{{WORKS_GRID}}", works_grid(TOP_LIMIT))
write("index.html",
      head("株式会社スタジオレゾナンス｜沖縄の映像制作会社",
           "株式会社スタジオレゾナンスは、沖縄・那覇を拠点に企画・撮影・編集まで一貫して手がける映像制作会社です。企業PR・ブランドムービー、採用動画、セミナー収録、広告・SNS動画、YouTube番組制作に対応します。",
           "/")
      + """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"株式会社スタジオレゾナンス","alternateName":"STUDIO RESONANCE","url":"https://re-son.jp/","foundingDate":"2022-02","address":{"@type":"PostalAddress","postalCode":"903-0806","addressRegion":"沖縄県","addressLocality":"那覇市","streetAddress":"首里汀良町2-7-20 あしゃぎガーデン102","addressCountry":"JP"}}
</script>
</head>
<body>
""" + HEADER + index_body + FOOTER)

# ---------------------------------------------------------------- 実績一覧
write("works/index.html",
      head("制作実績｜株式会社スタジオレゾナンス",
           "株式会社スタジオレゾナンスの制作実績一覧。CM、TV番組、行政のPR・採用動画、セミナー・講演会収録、YouTube番組など。",
           "/works/")
      + "</head>\n<body>\n" + HEADER + f"""<main class="page-works">
<section class="sec pattern-light">
  <div class="wrap">
    <div class="sec-head reveal">
      <div>
        <h1 class="sec-en">WORKS</h1>
        <p class="sec-ja">制作実績</p>
      </div>
      {filters()}
    </div>
    {works_grid()}
    <div class="more reveal"><a class="btn btn-accent" href="/#contact">映像の相談をする</a></div>
  </div>
</section>
</main>
""" + FOOTER)


# ---------------------------------------------------------------- 下層ページ
def simple_page(path, title, description, body, noindex=False):
    write(path, head(f"{title}｜株式会社スタジオレゾナンス", description, "/" + path.replace("index.html", ""), noindex)
          + "</head>\n<body>\n" + HEADER
          + f'<main class="page pattern-light">\n  <div class="wrap">\n{body}\n  </div>\n</main>\n' + FOOTER)


simple_page("privacy/index.html", "プライバシーポリシー", "株式会社スタジオレゾナンスのプライバシーポリシー。",
            (ROOT / "build" / "privacy.body.html").read_text(encoding="utf-8"))
simple_page("thanks/index.html", "送信完了", "お問い合わせを受け付けました。", """    <h1>THANK YOU</h1>
    <p class="page-sub">送信完了</p>
    <p>お問い合わせいただき、ありがとうございます。内容を確認のうえ、3営業日以内にご返信いたします。</p>
    <p>3営業日を過ぎても返信がない場合は、お手数ですが再度お問い合わせください。</p>
    <p class="page-actions"><a class="btn btn-dark" href="/">トップページへ戻る</a></p>""", noindex=True)
simple_page("404.html", "ページが見つかりません", "お探しのページが見つかりませんでした。", """    <h1>404</h1>
    <p class="page-sub">お探しのページが見つかりませんでした。</p>
    <p class="page-actions"><a class="btn btn-dark" href="/">トップページへ戻る</a></p>""", noindex=True)

write("sitemap.xml", f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{DOMAIN}/</loc></url>
  <url><loc>{DOMAIN}/works/</loc></url>
  <url><loc>{DOMAIN}/privacy/</loc></url>
</urlset>
""")
print("built:", len(works), "works")
