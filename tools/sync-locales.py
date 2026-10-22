#!/usr/bin/env python3
"""Generate the five localized, crawlable pages from the root site source."""

from __future__ import annotations

from html import escape
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ("es", "ca", "en", "fr", "it")
DESCRIPTIONS = {
    "es": "Siete músicos compartiendo un mismo escenario, dando nueva vida a clásicos del rock y del pop con energía, personalidad y un sonido propio. The Navies — Música en directo",
    "ca": "Set músics compartint un mateix escenari, donant nova vida als clàssics del rock i del pop amb energia, personalitat i un so propi. The Navies — Música en directe",
    "en": "Seven musicians sharing one stage, bringing rock and pop classics to life with energy, personality and a sound of our own. The Navies — Live Music",
    "fr": "Sept musiciens sur une même scène, donnant vie aux classiques du rock et de la pop avec énergie, personnalité et un son unique. The Navies — Musique live",
    "it": "Sette musicisti su un unico palco, dando nuova vita ai classici rock e pop con energia, personalità e un sound tutto nostro. The Navies — Musica dal vivo",
}
OG_LOCALES = {"es": "es_ES", "ca": "ca_ES", "en": "en_GB", "fr": "fr_FR", "it": "it_IT"}
EMAILS = {
    "es": "contacto@thenavies.com",
    "ca": "contacte@thenavies.com",
    "en": "contact@thenavies.com",
    "fr": "contact@thenavies.com",
    "it": "contatto@thenavies.com",
}


def matching_brace(text: str, opening: int) -> int:
    depth = 0
    quote = None
    escaped = False
    for index in range(opening, len(text)):
        char = text[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in ("'", '"', "`"):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
    raise ValueError("Unclosed JavaScript object")


def decode_js_string(value: str) -> str:
    replacements = {"n": "\n", "r": "\r", "t": "\t", "'": "'", '"': '"', "\\": "\\"}
    return re.sub(r"\\(.)", lambda match: replacements.get(match.group(1), match.group(1)), value)


def parse_pairs(fragment: str) -> dict[str, str]:
    pattern = re.compile(r"([A-Za-z_$][\w$]*)\s*:\s*'((?:\\.|[^'\\])*)'", re.S)
    return {key: decode_js_string(value) for key, value in pattern.findall(fragment)}


def load_translations(script: str) -> dict[str, dict[str, str]]:
    translations = {language: {} for language in LANGUAGES}
    marker = script.index("const translations =")
    opening = script.index("{", marker)
    block = script[opening + 1 : matching_brace(script, opening)]
    for language in LANGUAGES:
        match = re.search(rf"\b{language}\s*:\s*\{{", block)
        if not match:
            raise ValueError(f"Missing base translations for {language}")
        language_opening = opening + 1 + match.end() - 1
        language_block = script[language_opening + 1 : matching_brace(script, language_opening)]
        translations[language].update(parse_pairs(language_block))
    assigns = re.compile(r"Object\.assign\(translations\.(es|ca|en|fr|it),\s*\{(.*?)\}\);", re.S)
    for language, fragment in assigns.findall(script):
        translations[language].update(parse_pairs(fragment))
    return translations


def translate_elements(document: str, translations: dict[str, str]) -> str:
    for attribute, allow_html in (("data-i18n-html", True), ("data-i18n", False)):
        keys = set(re.findall(rf'{attribute}="([^"]+)"', document))
        for key in keys:
            if key not in translations:
                continue
            value = translations[key] if allow_html else escape(translations[key], quote=False)
            pattern = re.compile(
                rf'(<(?P<tag>[a-zA-Z][\w:-]*)\b(?=[^>]*\b{attribute}="{re.escape(key)}")[^>]*>).*?(</(?P=tag)>)',
                re.S,
            )
            document = pattern.sub(lambda match: f"{match.group(1)}{value}{match.group(3)}", document)
    return document


def localize(source: str, language: str, translations: dict[str, str]) -> str:
    document = source
    document = re.sub(r'<html lang="[^"]+">', f'<html lang="{language}">', document, count=1)
    document = document.replace("<head>", f'<head>\n  <script>window.__naviesForcedLanguage="{language}"</script>', 1)
    document = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{escape(DESCRIPTIONS[language], quote=True)}">',
        document,
        count=1,
    )
    document = re.sub(
        r'<meta property="og:locale" content="[^"]*">',
        f'<meta property="og:locale" content="{OG_LOCALES[language]}">',
        document,
        count=1,
    )
    document = re.sub(
        r'<link rel="canonical" href="[^"]+">',
        f'<link rel="canonical" href="https://thenavies.com/{language}/">',
        document,
        count=1,
    )
    document = re.sub(
        r'\n\s*<script>try\{const p=location\.pathname,b=.*?</script>',
        "",
        document,
        count=1,
        flags=re.S,
    )
    for asset in ("favicon.svg", "manifest.webmanifest", "script.js", "portal.js", "styles.css", "subpages.css", "icons/"):
        document = document.replace(f'href="{asset}', f'href="../{asset}')
        document = document.replace(f'src="{asset}', f'src="../{asset}')
    document = translate_elements(document, translations)

    trigger = re.search(r'(<button class="language-trigger".*?</button>)', document, re.S)
    if trigger:
        localized_trigger = re.sub(r"flag-[a-z]{2}", f"flag-{language}", trigger.group(1), count=1)
        localized_trigger = re.sub(r"<strong>[A-Z]{2}</strong>", f"<strong>{language.upper()}</strong>", localized_trigger, count=1)
        document = document[: trigger.start()] + localized_trigger + document[trigger.end() :]
    document = re.sub(
        r'(data-language="(es|ca|en|fr|it)" aria-selected=")[^"]+(")',
        lambda match: f'{match.group(1)}{"true" if match.group(2) == language else "false"}{match.group(3)}',
        document,
    )
    document = re.sub(
        r'<a class="email-link" href="mailto:[^"]+">.*?</a>',
        f'<a class="email-link" href="mailto:{EMAILS[language]}">{EMAILS[language]} <span>↗</span></a>',
        document,
        count=1,
        flags=re.S,
    )
    return document


def write_search_files() -> None:
    urls = ["https://thenavies.com/"] + [f"https://thenavies.com/{language}/" for language in LANGUAGES]
    sitemap_entries = "\n".join(f"  <url><loc>{url}</loc></url>" for url in urls)
    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{sitemap_entries}
</urlset>
'''
    (ROOT / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (ROOT / "robots.txt").write_text("User-agent: *\nAllow: /\n\nSitemap: https://thenavies.com/sitemap.xml\n", encoding="utf-8")


def main() -> None:
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "script.js").read_text(encoding="utf-8")
    translations = load_translations(script)
    for language in LANGUAGES:
        target = ROOT / language / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(localize(source, language, translations[language]), encoding="utf-8")
    write_search_files()
    print("Updated localized pages: " + ", ".join(LANGUAGES))


if __name__ == "__main__":
    main()
