import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto("file://" + __import__("os").path.abspath("proposal-v3.html") + "", wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        await pg.pdf(path="Agro_Trade_Commercial_Proposal_v3.pdf", format="A4", print_background=True, prefer_css_page_size=True)
        await b.close()
asyncio.run(main())
