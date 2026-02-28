"""
InnerPlay — The Last Session: Comprehensive E2E Test Suite
Tests the live deployment at https://mistral-lac.vercel.app/

Tests everything automatable:
- Page loads and content
- API endpoints
- UI elements and styling
- Responsive viewports
- Console error detection
- Navigation flow
"""

import json
import os
import sys
import time
import traceback
from dataclasses import dataclass, field
from typing import Optional

from playwright.sync_api import sync_playwright, Page, BrowserContext, ConsoleMessage

BASE_URL = "https://mistral-lac.vercel.app"
SCREENSHOT_DIR = "C:/Users/akash/Desktop/AI_projects/InnerPlay/hackathons/mistral/e2e-screenshots"

VIEWPORTS = {
    "mobile": {"width": 375, "height": 812},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1440, "height": 900},
}


@dataclass
class TestResult:
    name: str
    passed: bool
    message: str = ""
    screenshot: Optional[str] = None


@dataclass
class TestSuite:
    results: list = field(default_factory=list)
    console_errors: list = field(default_factory=list)

    def add(self, name: str, passed: bool, message: str = "", screenshot: str = None):
        self.results.append(TestResult(name, passed, message, screenshot))
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {name}" + (f" -- {message}" if message else ""))

    @property
    def total(self):
        return len(self.results)

    @property
    def passed(self):
        return sum(1 for r in self.results if r.passed)

    @property
    def failed(self):
        return sum(1 for r in self.results if not r.passed)


def screenshot(page: Page, name: str) -> str:
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    return path


def collect_console(msg: ConsoleMessage, suite: TestSuite):
    if msg.type == "error":
        text = msg.text
        # Filter out expected/noisy errors
        if any(skip in text for skip in [
            "favicon.ico",
            "the server responded with a status of 404",
            "net::ERR_",
            "Failed to load resource",  # generic network errors
        ]):
            return
        suite.console_errors.append(text)


# ════════════════════════════════════════════════
# TEST GROUPS
# ════════════════════════════════════════════════

def test_landing_page(page: Page, suite: TestSuite):
    """Test landing page (/) loads correctly with expected content."""
    print("\n--- Landing Page Tests ---")

    page.on("console", lambda msg: collect_console(msg, suite))

    # Navigate
    response = page.goto(BASE_URL + "/", wait_until="networkidle", timeout=30000)

    # 1. Page loads with 200
    suite.add(
        "Landing page returns 200",
        response is not None and response.status == 200,
        f"Status: {response.status if response else 'no response'}",
    )

    # 2. Title check
    title = page.title()
    suite.add(
        "Page title contains 'InnerPlay'",
        "InnerPlay" in title,
        f"Title: '{title}'",
    )

    suite.add(
        "Page title contains 'The Last Session'",
        "The Last Session" in title,
        f"Title: '{title}'",
    )

    # 3. H1 text
    h1 = page.locator("h1")
    h1_text = h1.text_content() if h1.count() > 0 else ""
    suite.add(
        "H1 says 'The Last Session'",
        h1_text.strip() == "The Last Session",
        f"H1: '{h1_text}'",
    )

    # 4. Subtitle text
    subtitle = page.locator("p")
    subtitle_text = subtitle.first.text_content() if subtitle.count() > 0 else ""
    suite.add(
        "Subtitle text present",
        "Close your eyes" in subtitle_text,
        f"Subtitle: '{subtitle_text}'",
    )

    # 5. Begin button/link exists
    begin_link = page.locator("a[href='/play']")
    suite.add(
        "'Begin' link exists and points to /play",
        begin_link.count() > 0,
        f"Found {begin_link.count()} Begin link(s)",
    )

    # 6. Begin button text
    if begin_link.count() > 0:
        begin_text = begin_link.first.text_content()
        suite.add(
            "'Begin' link has correct text",
            begin_text.strip().lower() == "begin",
            f"Text: '{begin_text}'",
        )

        # 7. Begin button is visible and clickable
        is_visible = begin_link.first.is_visible()
        suite.add(
            "'Begin' link is visible",
            is_visible,
        )

    # 8. Dark theme — body background color
    bg_color = page.evaluate("getComputedStyle(document.body).backgroundColor")
    suite.add(
        "Body has dark background",
        bg_color != "rgb(255, 255, 255)" and bg_color != "rgba(0, 0, 0, 0)",
        f"Background: {bg_color}",
    )

    # 9. Text color is light (for dark theme)
    text_color = page.evaluate("getComputedStyle(document.body).color")
    suite.add(
        "Body text is light-colored (dark theme)",
        text_color != "rgb(0, 0, 0)",
        f"Text color: {text_color}",
    )

    # 10. Main is centered (flex)
    main_display = page.evaluate("getComputedStyle(document.querySelector('main')).display")
    main_justify = page.evaluate("getComputedStyle(document.querySelector('main')).justifyContent")
    suite.add(
        "Main content uses flex centering",
        main_display == "flex" and main_justify == "center",
        f"display: {main_display}, justifyContent: {main_justify}",
    )

    # Screenshot
    path = screenshot(page, "01-landing-page")
    suite.add("Landing page screenshot captured", True, screenshot=path)


def test_play_page(page: Page, suite: TestSuite):
    """Test play page (/play) loads and shows onboarding flow."""
    print("\n--- Play Page Tests ---")

    page.on("console", lambda msg: collect_console(msg, suite))

    response = page.goto(BASE_URL + "/play", wait_until="networkidle", timeout=30000)

    # 1. Page loads
    suite.add(
        "Play page returns 200",
        response is not None and response.status == 200,
        f"Status: {response.status if response else 'no response'}",
    )

    # 2. Onboarding shows first step
    page.wait_for_timeout(1000)  # Allow React hydration
    h2 = page.locator("h2")
    h2_text = h2.first.text_content() if h2.count() > 0 else ""
    suite.add(
        "Onboarding step 1: 'Put on headphones'",
        "headphones" in h2_text.lower(),
        f"H2: '{h2_text}'",
    )

    # 3. Continue button exists
    continue_btn = page.locator("button:has-text('Continue')")
    suite.add(
        "Continue button exists on onboarding",
        continue_btn.count() > 0,
    )

    # 4. Step indicators exist (3 dots)
    # The step indicators are div elements at the bottom
    step_dots = page.locator("div[style*='position: absolute'] > div[style*='borderRadius']")
    # Alternative approach: count child divs of the indicator container
    indicator_count = page.evaluate("""
        (() => {
            const container = document.querySelector('[style*="position: absolute"][style*="bottom"]');
            return container ? container.children.length : 0;
        })()
    """)
    suite.add(
        "3 step indicator dots present",
        indicator_count == 3,
        f"Found {indicator_count} dots",
    )

    # Screenshot onboarding step 1
    path = screenshot(page, "02-play-onboarding-step1")
    suite.add("Onboarding step 1 screenshot captured", True, screenshot=path)

    # 5. Click Continue -> step 2
    if continue_btn.count() > 0:
        continue_btn.first.click()
        page.wait_for_timeout(500)

        h2_text_2 = page.locator("h2").first.text_content() if page.locator("h2").count() > 0 else ""
        suite.add(
            "Onboarding step 2: 'Dim the lights'",
            "dim" in h2_text_2.lower() or "lights" in h2_text_2.lower(),
            f"H2: '{h2_text_2}'",
        )

        path = screenshot(page, "03-play-onboarding-step2")
        suite.add("Onboarding step 2 screenshot captured", True, screenshot=path)

        # 6. Click Continue -> step 3 (countdown)
        continue_btn2 = page.locator("button:has-text('Continue')")
        if continue_btn2.count() > 0:
            continue_btn2.first.click()
            page.wait_for_timeout(500)

            h2_text_3 = page.locator("h2").first.text_content() if page.locator("h2").count() > 0 else ""
            suite.add(
                "Onboarding step 3: 'Close your eyes'",
                "close" in h2_text_3.lower() or "eyes" in h2_text_3.lower(),
                f"H2: '{h2_text_3}'",
            )

            # Check countdown number is visible
            countdown_el = page.locator("div[style*='font-size']")
            page_text = page.text_content("body")
            has_countdown = any(str(n) in page_text for n in [1, 2, 3])
            suite.add(
                "Countdown number visible",
                has_countdown,
                f"Page contains countdown number",
            )

            path = screenshot(page, "04-play-onboarding-step3-countdown")
            suite.add("Onboarding step 3 (countdown) screenshot captured", True, screenshot=path)

            # 7. Wait for countdown to complete -> connecting state
            page.wait_for_timeout(4500)  # 3 seconds countdown + buffer

            # After onboarding, it should show "Connecting..." or an error
            body_text = page.text_content("body")
            shows_connecting_or_error = (
                "connecting" in body_text.lower()
                or "connection" in body_text.lower()
                or "error" in body_text.lower()
                or "session" in body_text.lower()
            )
            suite.add(
                "After onboarding: shows connecting/error state",
                shows_connecting_or_error,
                f"Body contains relevant status text",
            )

            path = screenshot(page, "05-play-post-onboarding")
            suite.add("Post-onboarding state screenshot captured", True, screenshot=path)


def test_navigation_flow(page: Page, suite: TestSuite):
    """Test navigation from landing to play page."""
    print("\n--- Navigation Flow Tests ---")

    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=30000)

    # Click Begin link
    begin_link = page.locator("a[href='/play']")
    if begin_link.count() > 0:
        begin_link.first.click()
        page.wait_for_load_state("networkidle", timeout=15000)

        suite.add(
            "Clicking 'Begin' navigates to /play",
            "/play" in page.url,
            f"URL: {page.url}",
        )

        path = screenshot(page, "06-navigation-to-play")
        suite.add("Navigation to play screenshot captured", True, screenshot=path)
    else:
        suite.add("Clicking 'Begin' navigates to /play", False, "Begin link not found")


def test_api_signed_url(page: Page, suite: TestSuite):
    """Test GET /api/signed-url endpoint."""
    print("\n--- API: /api/signed-url Tests ---")

    response = page.goto(BASE_URL + "/api/signed-url", wait_until="networkidle", timeout=15000)
    status = response.status if response else 0
    body_text = page.text_content("body") if response else ""

    # Should return 200 with signedUrl (or 500 if config missing — both valid test info)
    suite.add(
        "GET /api/signed-url responds",
        status in [200, 500],
        f"Status: {status}",
    )

    if status == 200:
        try:
            data = json.loads(body_text)
            has_signed_url = "signedUrl" in data
            suite.add(
                "Response contains 'signedUrl' key",
                has_signed_url,
                f"Keys: {list(data.keys())}",
            )
        except json.JSONDecodeError:
            suite.add("Response is valid JSON", False, f"Body: {body_text[:200]}")
    elif status == 500:
        try:
            data = json.loads(body_text)
            suite.add(
                "/api/signed-url returns error (config missing on server)",
                "error" in data,
                f"Error: {data.get('error', 'unknown')}",
            )
        except json.JSONDecodeError:
            suite.add("/api/signed-url response is JSON", False, f"Body: {body_text[:200]}")


def test_api_game_state_get(page: Page, suite: TestSuite):
    """Test GET /api/game-state?cid=test endpoint."""
    print("\n--- API: GET /api/game-state Tests ---")

    response = page.goto(
        BASE_URL + "/api/game-state?cid=test-e2e-123",
        wait_until="networkidle",
        timeout=15000,
    )
    status = response.status if response else 0
    body_text = page.text_content("body") if response else ""

    suite.add(
        "GET /api/game-state?cid=test returns 200",
        status == 200,
        f"Status: {status}",
    )

    if status == 200:
        try:
            data = json.loads(body_text)
            suite.add(
                "Response has 'phase' field",
                "phase" in data,
                f"phase: {data.get('phase')}",
            )
            suite.add(
                "Response has 'trustLevel' field",
                "trustLevel" in data,
                f"trustLevel: {data.get('trustLevel')}",
            )
            suite.add(
                "Response has 'gameOver' field",
                "gameOver" in data,
                f"gameOver: {data.get('gameOver')}",
            )
            suite.add(
                "Default trust level is 3",
                data.get("trustLevel") == 3,
                f"trustLevel: {data.get('trustLevel')}",
            )
            suite.add(
                "Default gameOver is false",
                data.get("gameOver") == False,
                f"gameOver: {data.get('gameOver')}",
            )
        except json.JSONDecodeError:
            suite.add("Response is valid JSON", False, f"Body: {body_text[:200]}")


def test_api_game_state_get_no_cid(page: Page, suite: TestSuite):
    """Test GET /api/game-state without cid returns 400."""
    print("\n--- API: GET /api/game-state (no cid) Tests ---")

    response = page.goto(
        BASE_URL + "/api/game-state",
        wait_until="networkidle",
        timeout=15000,
    )
    status = response.status if response else 0

    suite.add(
        "GET /api/game-state without cid returns 400",
        status == 400,
        f"Status: {status}",
    )


def test_api_game_state_post(page: Page, suite: TestSuite):
    """Test POST /api/game-state endpoint via browser fetch."""
    print("\n--- API: POST /api/game-state Tests ---")

    # Navigate to base first (need a page context for fetch)
    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=15000)

    # POST with conversationId
    result = page.evaluate("""
        async () => {
            try {
                const res = await fetch('/api/game-state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ conversationId: 'e2e-test-' + Date.now() }),
                });
                const data = await res.json();
                return { status: res.status, data };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }
    """)

    suite.add(
        "POST /api/game-state returns 200",
        result.get("status") == 200,
        f"Status: {result.get('status')}, Data: {json.dumps(result.get('data', result.get('error', '')))}",
    )

    if result.get("status") == 200:
        suite.add(
            "POST /api/game-state returns { ok: true }",
            result.get("data", {}).get("ok") == True,
            f"Data: {result.get('data')}",
        )

    # POST without conversationId — should return 400
    result_no_cid = page.evaluate("""
        async () => {
            try {
                const res = await fetch('/api/game-state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await res.json();
                return { status: res.status, data };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }
    """)

    suite.add(
        "POST /api/game-state without conversationId returns 400",
        result_no_cid.get("status") == 400,
        f"Status: {result_no_cid.get('status')}",
    )


def test_api_llm_chat_completions(page: Page, suite: TestSuite):
    """Test POST /api/llm/chat/completions endpoint."""
    print("\n--- API: POST /api/llm/chat/completions Tests ---")

    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=15000)

    # Test with valid messages — should return SSE stream
    result = page.evaluate("""
        async () => {
            try {
                const res = await fetch('/api/llm/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: 'You are Elara.' },
                            { role: 'user', content: 'Hello, I am the therapist.' }
                        ],
                        stream: true,
                        model: 'mistral-large-latest'
                    }),
                });
                const contentType = res.headers.get('content-type');
                const text = await res.text();
                return {
                    status: res.status,
                    contentType,
                    bodyLength: text.length,
                    bodyPreview: text.substring(0, 500),
                    hasDataPrefix: text.startsWith('data:'),
                    hasDone: text.includes('[DONE]'),
                };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }
    """)

    status = result.get("status", 0)
    suite.add(
        "POST /api/llm/chat/completions returns 200",
        status == 200,
        f"Status: {status}" + (f", Error: {result.get('error')}" if result.get("error") else ""),
    )

    if status == 200:
        content_type = result.get("contentType", "")
        suite.add(
            "Response Content-Type is text/event-stream",
            "text/event-stream" in content_type,
            f"Content-Type: {content_type}",
        )

        suite.add(
            "Response body starts with 'data:'",
            result.get("hasDataPrefix", False),
            f"Preview: {result.get('bodyPreview', '')[:100]}",
        )

        suite.add(
            "Response body contains [DONE]",
            result.get("hasDone", False),
            f"Body length: {result.get('bodyLength', 0)}",
        )

    # Test with invalid body — should return 400
    result_bad = page.evaluate("""
        async () => {
            try {
                const res = await fetch('/api/llm/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invalid: true }),
                });
                return { status: res.status };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }
    """)

    suite.add(
        "POST /api/llm/chat/completions with invalid body returns 400",
        result_bad.get("status") == 400,
        f"Status: {result_bad.get('status')}",
    )


def test_api_choice(page: Page, suite: TestSuite):
    """Test POST /api/choice endpoint."""
    print("\n--- API: POST /api/choice Tests ---")

    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=15000)

    # POST without required fields — should return 400
    result = page.evaluate("""
        async () => {
            try {
                const res = await fetch('/api/choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await res.json();
                return { status: res.status, data };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }
    """)

    suite.add(
        "POST /api/choice without fields returns 400",
        result.get("status") == 400,
        f"Status: {result.get('status')}",
    )

    # POST with non-existent session — should return 404
    result_404 = page.evaluate("""
        async () => {
            try {
                const res = await fetch('/api/choice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId: 'nonexistent-session',
                        beatId: 'fake-beat',
                        optionId: 'fake-option'
                    }),
                });
                const data = await res.json();
                return { status: res.status, data };
            } catch (e) {
                return { status: 0, error: e.message };
            }
        }
    """)

    suite.add(
        "POST /api/choice with nonexistent session returns 404",
        result_404.get("status") == 404,
        f"Status: {result_404.get('status')}",
    )


def test_responsive_viewports(context_factory, suite: TestSuite):
    """Test pages at different viewport sizes."""
    print("\n--- Responsive Viewport Tests ---")

    for vp_name, vp_size in VIEWPORTS.items():
        print(f"  Testing viewport: {vp_name} ({vp_size['width']}x{vp_size['height']})")

        context = context_factory(viewport=vp_size)
        page = context.new_page()

        try:
            # Landing page
            response = page.goto(BASE_URL + "/", wait_until="networkidle", timeout=20000)
            suite.add(
                f"Landing loads at {vp_name} ({vp_size['width']}x{vp_size['height']})",
                response is not None and response.status == 200,
                f"Status: {response.status if response else 'no response'}",
            )

            # Check Begin link is visible
            begin = page.locator("a[href='/play']")
            is_visible = begin.first.is_visible() if begin.count() > 0 else False
            suite.add(
                f"Begin link visible at {vp_name}",
                is_visible,
            )

            # Check nothing overflows horizontally
            overflow = page.evaluate("""
                () => document.documentElement.scrollWidth > document.documentElement.clientWidth
            """)
            suite.add(
                f"No horizontal overflow at {vp_name}",
                not overflow,
            )

            path = screenshot(page, f"07-responsive-landing-{vp_name}")
            suite.add(f"Landing screenshot at {vp_name}", True, screenshot=path)

            # Play page
            response2 = page.goto(BASE_URL + "/play", wait_until="networkidle", timeout=20000)
            page.wait_for_timeout(1000)  # React hydration

            suite.add(
                f"Play page loads at {vp_name}",
                response2 is not None and response2.status == 200,
            )

            path2 = screenshot(page, f"08-responsive-play-{vp_name}")
            suite.add(f"Play screenshot at {vp_name}", True, screenshot=path2)

        finally:
            page.close()
            context.close()


def test_console_errors(page: Page, suite: TestSuite):
    """Dedicated test to check for JavaScript console errors on both pages."""
    print("\n--- Console Error Tests ---")

    errors_landing = []
    errors_play = []

    def collect_landing(msg):
        if msg.type == "error":
            text = msg.text
            if not any(skip in text for skip in ["favicon", "net::ERR_"]):
                errors_landing.append(text)

    def collect_play(msg):
        if msg.type == "error":
            text = msg.text
            if not any(skip in text for skip in ["favicon", "net::ERR_"]):
                errors_play.append(text)

    # Landing page
    page.on("console", collect_landing)
    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(2000)

    suite.add(
        "No JS console errors on landing page",
        len(errors_landing) == 0,
        f"Errors: {errors_landing}" if errors_landing else "Clean",
    )

    # Remove old listener, navigate to play
    page.remove_listener("console", collect_landing)
    page.on("console", collect_play)
    page.goto(BASE_URL + "/play", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(2000)

    suite.add(
        "No JS console errors on play page (initial load)",
        len(errors_play) == 0,
        f"Errors: {errors_play}" if errors_play else "Clean",
    )


def test_meta_tags(page: Page, suite: TestSuite):
    """Test meta tags and HTML structure."""
    print("\n--- Meta Tags & HTML Structure Tests ---")

    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=20000)

    # Check lang attribute
    lang = page.evaluate("document.documentElement.lang")
    suite.add(
        "HTML lang attribute is 'en'",
        lang == "en",
        f"lang: '{lang}'",
    )

    # Check meta description
    description = page.evaluate("""
        () => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.content : null;
        }
    """)
    suite.add(
        "Meta description exists",
        description is not None and len(description) > 0,
        f"Description: '{description}'",
    )

    # Check viewport meta
    viewport_meta = page.evaluate("""
        () => {
            const meta = document.querySelector('meta[name="viewport"]');
            return meta ? meta.content : null;
        }
    """)
    suite.add(
        "Viewport meta tag exists",
        viewport_meta is not None,
        f"Viewport: '{viewport_meta}'",
    )


def test_css_animations(page: Page, suite: TestSuite):
    """Test that CSS animations are defined."""
    print("\n--- CSS Animation Tests ---")

    page.goto(BASE_URL + "/play", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(1000)

    # Check that breathe animation exists in stylesheets
    has_breathe = page.evaluate("""
        () => {
            const sheets = document.styleSheets;
            for (let i = 0; i < sheets.length; i++) {
                try {
                    const rules = sheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].name === 'breathe') return true;
                    }
                } catch(e) {}
            }
            return false;
        }
    """)
    suite.add(
        "CSS @keyframes 'breathe' exists",
        has_breathe,
    )

    has_pulse = page.evaluate("""
        () => {
            const sheets = document.styleSheets;
            for (let i = 0; i < sheets.length; i++) {
                try {
                    const rules = sheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].name === 'pulse') return true;
                    }
                } catch(e) {}
            }
            return false;
        }
    """)
    suite.add(
        "CSS @keyframes 'pulse' exists",
        has_pulse,
    )

    has_fade_in = page.evaluate("""
        () => {
            const sheets = document.styleSheets;
            for (let i = 0; i < sheets.length; i++) {
                try {
                    const rules = sheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].name === 'fadeIn') return true;
                    }
                } catch(e) {}
            }
            return false;
        }
    """)
    suite.add(
        "CSS @keyframes 'fadeIn' exists",
        has_fade_in,
    )

    # Check that onboarding has fade-in class
    fade_in_el = page.locator(".fade-in")
    suite.add(
        "Onboarding has 'fade-in' class applied",
        fade_in_el.count() > 0,
        f"Found {fade_in_el.count()} elements with .fade-in",
    )


def test_accessibility_basics(page: Page, suite: TestSuite):
    """Basic accessibility checks."""
    print("\n--- Accessibility Basics Tests ---")

    page.goto(BASE_URL + "/", wait_until="networkidle", timeout=20000)

    # Check heading hierarchy
    h1_count = page.locator("h1").count()
    suite.add(
        "Landing page has exactly one H1",
        h1_count == 1,
        f"H1 count: {h1_count}",
    )

    # Check links have text
    links = page.locator("a")
    all_links_have_text = True
    for i in range(links.count()):
        text = links.nth(i).text_content()
        if not text or not text.strip():
            all_links_have_text = False
            break
    suite.add(
        "All links have text content",
        all_links_have_text,
    )

    # Play page
    page.goto(BASE_URL + "/play", wait_until="networkidle", timeout=20000)
    page.wait_for_timeout(1000)

    # Check buttons have text
    buttons = page.locator("button")
    all_buttons_have_text = True
    for i in range(buttons.count()):
        text = buttons.nth(i).text_content()
        if not text or not text.strip():
            all_buttons_have_text = False
            break
    suite.add(
        "All buttons on play page have text content",
        all_buttons_have_text,
    )


# ════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("InnerPlay — The Last Session: E2E Test Suite")
    print(f"Target: {BASE_URL}")
    print(f"Screenshots: {SCREENSHOT_DIR}")
    print("=" * 60)

    os.makedirs(SCREENSHOT_DIR, exist_ok=True)

    suite = TestSuite()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        def context_factory(**kwargs):
            return browser.new_context(**kwargs)

        # Default context for most tests
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        try:
            # Page tests
            test_landing_page(page, suite)
            test_meta_tags(page, suite)
            test_css_animations(page, suite)
            test_play_page(page, suite)
            test_navigation_flow(page, suite)
            test_accessibility_basics(page, suite)

            # API tests
            test_api_signed_url(page, suite)
            test_api_game_state_get(page, suite)
            test_api_game_state_get_no_cid(page, suite)
            test_api_game_state_post(page, suite)
            test_api_llm_chat_completions(page, suite)
            test_api_choice(page, suite)

            # Console error tests (dedicated pass)
            test_console_errors(page, suite)

        except Exception as e:
            suite.add(f"CRITICAL: Test execution error", False, f"{type(e).__name__}: {e}")
            traceback.print_exc()

        finally:
            page.close()
            context.close()

        # Responsive tests (need separate contexts per viewport)
        try:
            test_responsive_viewports(context_factory, suite)
        except Exception as e:
            suite.add("CRITICAL: Responsive test error", False, f"{type(e).__name__}: {e}")
            traceback.print_exc()

        browser.close()

    # ── Report ──────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total:  {suite.total}")
    print(f"Passed: {suite.passed}")
    print(f"Failed: {suite.failed}")
    print(f"Pass Rate: {suite.passed / suite.total * 100:.1f}%" if suite.total > 0 else "N/A")

    if suite.failed > 0:
        print("\n--- FAILURES ---")
        for r in suite.results:
            if not r.passed:
                print(f"  FAIL: {r.name}")
                if r.message:
                    print(f"        {r.message}")

    screenshots_captured = [r for r in suite.results if r.screenshot]
    if screenshots_captured:
        print(f"\n--- SCREENSHOTS ({len(screenshots_captured)}) ---")
        for r in screenshots_captured:
            print(f"  {r.screenshot}")

    if suite.console_errors:
        print(f"\n--- CONSOLE ERRORS ({len(suite.console_errors)}) ---")
        for err in suite.console_errors:
            print(f"  {err}")

    print("\n" + "=" * 60)

    return 0 if suite.failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
