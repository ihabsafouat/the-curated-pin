#!/usr/bin/env python3
"""Render the four original, print-ready Curated Pin launch products.

Usage:
  python scripts/build-premium-products.py /absolute/path/to/birthday-cover.png \
      /absolute/path/to/teen-cover.png

The paid workbooks intentionally remain outside public/. Free lead magnets are
published in public/downloads. All pages are US Letter, ink-conscious, and fully
vector-based except the two original premium cover photographs.
"""

from __future__ import annotations

import math
import sys
from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = letter
MARGIN = 43
CONTENT_WIDTH = WIDTH - MARGIN * 2
FOOTER_Y = 34

pdfmetrics.registerFont(TTFont("CuratedSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("CuratedSansBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("CuratedSerif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("CuratedSerifBold", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))


@dataclass(frozen=True)
class Palette:
    primary: colors.Color
    accent: colors.Color
    background: colors.Color
    panel: colors.Color
    border: colors.Color
    muted: colors.Color
    soft: colors.Color


FOREST = Palette(
    colors.HexColor("#173D34"),
    colors.HexColor("#BD6758"),
    colors.HexColor("#FCFAF6"),
    colors.HexColor("#FFFFFF"),
    colors.HexColor("#E5DED4"),
    colors.HexColor("#706C65"),
    colors.HexColor("#F2EEE7"),
)

LILAC = Palette(
    colors.HexColor("#38283F"),
    colors.HexColor("#896A9E"),
    colors.HexColor("#FBF9FC"),
    colors.HexColor("#FFFFFF"),
    colors.HexColor("#E6DFE9"),
    colors.HexColor("#746A79"),
    colors.HexColor("#F0EBF3"),
)


class EditorialWorkbook:
    def __init__(self, path: Path, title: str, palette: Palette, page_count: int, subtitle: str):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.canvas = canvas.Canvas(str(path), pagesize=letter, pageCompression=1)
        self.canvas.setTitle(title)
        self.canvas.setAuthor("The Curated Pin")
        self.canvas.setSubject(subtitle)
        self.canvas.setCreator("The Curated Pin Editorial Studio")
        self.canvas.setKeywords("birthday party planner, printable party planning, The Curated Pin")
        self.path = path
        self.title = title
        self.palette = palette
        self.expected_pages = page_count
        self.page = 0

    def text(self, value: str, x: float, y: float, size: float = 9, font: str = "CuratedSans", color: colors.Color | None = None):
        self.canvas.setFillColor(color or self.palette.primary)
        self.canvas.setFont(font, size)
        self.canvas.drawString(x, y, value)

    def right(self, value: str, x: float, y: float, size: float = 9, font: str = "CuratedSans", color: colors.Color | None = None):
        self.canvas.setFillColor(color or self.palette.primary)
        self.canvas.setFont(font, size)
        self.canvas.drawRightString(x, y, value)

    def center(self, value: str, x: float, y: float, size: float = 9, font: str = "CuratedSans", color: colors.Color | None = None):
        self.canvas.setFillColor(color or self.palette.primary)
        self.canvas.setFont(font, size)
        self.canvas.drawCentredString(x, y, value)

    def wrap(self, value: str, width: float, size: float = 9, font: str = "CuratedSans") -> list[str]:
        lines: list[str] = []
        for paragraph in value.split("\n"):
            words = paragraph.split()
            if not words:
                lines.append("")
                continue
            line = words[0]
            for word in words[1:]:
                candidate = line + " " + word
                if pdfmetrics.stringWidth(candidate, font, size) <= width:
                    line = candidate
                else:
                    lines.append(line)
                    line = word
            lines.append(line)
        return lines

    def paragraph(self, value: str, x: float, y: float, width: float, size: float = 9, leading: float = 14, font: str = "CuratedSans", color: colors.Color | None = None, max_lines: int | None = None) -> float:
        lines = self.wrap(value, width, size, font)
        if max_lines is not None:
            lines = lines[:max_lines]
        for line in lines:
            self.text(line, x, y, size, font, color)
            y -= leading
        return y

    def line(self, x1: float, y1: float, x2: float, y2: float, color: colors.Color | None = None, thickness: float = 0.65):
        self.canvas.setStrokeColor(color or self.palette.border)
        self.canvas.setLineWidth(thickness)
        self.canvas.line(x1, y1, x2, y2)

    def rect(self, x: float, y: float, w: float, h: float, fill: colors.Color | None = None, stroke: colors.Color | None = None, radius: float = 7):
        self.canvas.setFillColor(fill or self.palette.panel)
        self.canvas.setStrokeColor(stroke or self.palette.border)
        self.canvas.setLineWidth(0.65)
        self.canvas.roundRect(x, y, w, h, radius, fill=1, stroke=1)

    def label(self, value: str, x: float, y: float, color: colors.Color | None = None, size: float = 7):
        self.text(value.upper(), x, y, size, "CuratedSansBold", color or self.palette.accent)

    def checkbox(self, x: float, y: float, size: float = 8):
        self.canvas.setStrokeColor(self.palette.accent)
        self.canvas.setLineWidth(0.8)
        self.canvas.roundRect(x, y - size + 1, size, size, 1.8, fill=0, stroke=1)

    def page_base(self):
        self.page += 1
        self.canvas.setFillColor(self.palette.background)
        self.canvas.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)

    def header(self, section: str, title: str, subtitle: str) -> float:
        self.page_base()
        self.label("THE CURATED PIN", MARGIN, HEIGHT - 39, self.palette.primary, 7.7)
        self.right(section.upper(), WIDTH - MARGIN, HEIGHT - 39, 7, "CuratedSansBold", self.palette.muted)
        self.line(MARGIN, HEIGHT - 50, WIDTH - MARGIN, HEIGHT - 50)
        self.label(section, MARGIN, HEIGHT - 84)
        size = 25 if len(title) > 30 else 29
        self.text(title, MARGIN, HEIGHT - 121, size, "CuratedSerifBold", self.palette.primary)
        self.paragraph(subtitle, MARGIN, HEIGHT - 142, CONTENT_WIDTH, 8.4, 12, color=self.palette.muted, max_lines=2)
        self.line(MARGIN, HEIGHT - 167, WIDTH - MARGIN, HEIGHT - 167)
        return HEIGHT - 186

    def footer(self):
        self.line(MARGIN, FOOTER_Y + 18, WIDTH - MARGIN, FOOTER_Y + 18)
        self.label("THE CURATED PIN", MARGIN, FOOTER_Y + 4, self.palette.primary, 6.6)
        self.center("PRINT. PLAN. CELEBRATE.", WIDTH / 2, FOOTER_Y + 4, 6.2, color=self.palette.muted)
        self.right(f"{self.page:02d} / {self.expected_pages:02d}", WIDTH - MARGIN, FOOTER_Y + 4, 7, "CuratedSansBold", self.palette.accent)
        self.canvas.showPage()

    def cover(self, image_path: str, edition: str, strapline: str):
        self.page_base()
        self.label("THE CURATED PIN | PRINTABLE COLLECTION", MARGIN, HEIGHT - 40, self.palette.primary)
        self.right(edition.upper(), WIDTH - MARGIN, HEIGHT - 40, 6.7, "CuratedSansBold", self.palette.accent)
        self.line(MARGIN, HEIGHT - 51, WIDTH - MARGIN, HEIGHT - 51)
        image_width = CONTENT_WIDTH
        self.canvas.drawImage(image_path, MARGIN, 155, width=image_width, height=image_width, preserveAspectRatio=True, mask="auto")
        self.label("YOUR CELEBRATION, BEAUTIFULLY ORGANIZED", MARGIN, 132)
        self.paragraph(strapline, MARGIN, 113, CONTENT_WIDTH, 8.3, 12, color=self.palette.muted, max_lines=2)
        self.footer()

    def illustrated_cover(self, kicker: str, line_one: str, line_two: str, subtitle: str, badge: str):
        self.page_base()
        c = self.canvas
        p = self.palette
        self.label("THE CURATED PIN | FREE PRINTABLE", MARGIN, HEIGHT - 43, p.primary)
        self.line(MARGIN, HEIGHT - 57, WIDTH - MARGIN, HEIGHT - 57)
        c.setFillColor(p.soft)
        c.roundRect(MARGIN, 167, CONTENT_WIDTH, 512, 14, fill=1, stroke=0)
        c.setStrokeColor(p.accent)
        c.setLineWidth(1.0)
        for radius, x, y in [(82, 465, 574), (54, 139, 241), (29, 487, 248)]:
            c.circle(x, y, radius, fill=0, stroke=1)
        self.label(kicker, 82, 560, p.accent)
        self.text(line_one, 78, 476, 39, "CuratedSerifBold", p.primary)
        self.text(line_two, 78, 423, 39, "CuratedSerifBold", p.primary)
        self.paragraph(subtitle, 82, 366, 367, 12, 19, color=p.muted)
        self.rect(82, 238, 190, 52, p.panel, p.border, 8)
        self.center(badge, 177, 258, 8.5, "CuratedSansBold", p.primary)
        self.label("A THOUGHTFUL START, WITHOUT THE OVERWHELM", MARGIN, 133, p.accent)
        self.paragraph("Made to print, annotate on a tablet, and use only as much as your celebration needs.", MARGIN, 113, CONTENT_WIDTH, 8.1, 12, color=p.muted)
        self.footer()

    def note(self, y: float, title: str, body: str, height: float = 66) -> float:
        self.rect(MARGIN, y - height, CONTENT_WIDTH, height, self.palette.soft, self.palette.border)
        self.label(title, MARGIN + 14, y - 21)
        self.paragraph(body, MARGIN + 14, y - 39, CONTENT_WIDTH - 28, 8.0, 11, color=self.palette.muted, max_lines=2)
        return y - height - 14

    def field_grid(self, y: float, labels: list[str], columns: int = 2, box_height: float = 65, gap: float = 11) -> float:
        width = (CONTENT_WIDTH - gap * (columns - 1)) / columns
        for index, label in enumerate(labels):
            row, column = divmod(index, columns)
            x = MARGIN + column * (width + gap)
            top = y - row * (box_height + gap)
            self.rect(x, top - box_height, width, box_height)
            self.label(label, x + 12, top - 19, self.palette.muted, 6.3)
            self.line(x + 12, top - box_height + 16, x + width - 12, top - box_height + 16)
        rows = math.ceil(len(labels) / columns)
        return y - rows * box_height - max(0, rows - 1) * gap - 15

    def writing_block(self, y: float, title: str, lines: int = 4, height: float = 95) -> float:
        self.rect(MARGIN, y - height, CONTENT_WIDTH, height)
        self.label(title, MARGIN + 13, y - 19, self.palette.muted, 6.5)
        available = height - 34
        for index in range(lines):
            line_y = y - 31 - ((index + 1) * available / (lines + 0.4))
            self.line(MARGIN + 13, line_y, WIDTH - MARGIN - 13, line_y)
        return y - height - 12

    def table(self, y: float, headers: list[str], rows: int, ratios: list[float], row_height: float = 25, labels: list[str] | None = None) -> float:
        total = sum(ratios)
        widths = [CONTENT_WIDTH * value / total for value in ratios]
        self.canvas.setFillColor(self.palette.primary)
        self.canvas.roundRect(MARGIN, y - 28, CONTENT_WIDTH, 28, 5, fill=1, stroke=0)
        position = MARGIN
        for title, width in zip(headers, widths):
            self.text(title.upper(), position + 8, y - 19, 6.0, "CuratedSansBold", colors.white)
            position += width
        top = y - 31
        for index in range(rows):
            bottom = top - (index + 1) * row_height
            if index % 2 == 0:
                self.canvas.setFillColor(self.palette.panel)
                self.canvas.rect(MARGIN, bottom, CONTENT_WIDTH, row_height, fill=1, stroke=0)
            self.line(MARGIN, bottom, WIDTH - MARGIN, bottom, self.palette.border, 0.45)
            position = MARGIN
            for width in widths[:-1]:
                position += width
                self.line(position, bottom + 4, position, bottom + row_height - 4, self.palette.border, 0.45)
            if labels and index < len(labels):
                value = labels[index]
                while pdfmetrics.stringWidth(value, "CuratedSans", 7.3) > widths[0] - 15 and len(value) > 5:
                    value = value[:-2]
                self.text(value, MARGIN + 8, bottom + row_height / 2 - 2.5, 7.3, color=self.palette.primary)
        return top - rows * row_height - 15

    def checklist_panel(self, x: float, y: float, width: float, height: float, title: str, items: list[str]):
        self.rect(x, y - height, width, height)
        self.label(title, x + 14, y - 21)
        cursor = y - 44
        available = height - 57
        step = min(25, available / max(len(items), 1))
        for item in items:
            self.checkbox(x + 14, cursor)
            lines = self.wrap(item, width - 42, 7.25)
            self.text(lines[0], x + 29, cursor - 0.5, 7.25, color=self.palette.primary)
            if len(lines) > 1 and step >= 22:
                self.text(lines[1], x + 29, cursor - 10, 6.8, color=self.palette.muted)
            cursor -= step

    def twin_checklists(self, y: float, left_title: str, left: list[str], right_title: str, right: list[str], height: float = 210) -> float:
        gap = 12
        width = (CONTENT_WIDTH - gap) / 2
        self.checklist_panel(MARGIN, y, width, height, left_title, left)
        self.checklist_panel(MARGIN + width + gap, y, width, height, right_title, right)
        return y - height - 14

    def cards(self, y: float, items: list[tuple[str, str]], columns: int = 2, card_height: float = 116) -> float:
        gap = 11
        width = (CONTENT_WIDTH - gap * (columns - 1)) / columns
        for index, (title, body) in enumerate(items):
            row, column = divmod(index, columns)
            x = MARGIN + column * (width + gap)
            top = y - row * (card_height + gap)
            self.rect(x, top - card_height, width, card_height)
            self.label(f"{index + 1:02d}", x + 12, top - 19)
            self.text(title, x + 12, top - 38, 9.2, "CuratedSansBold", self.palette.primary)
            self.paragraph(body, x + 12, top - 54, width - 24, 7.25, 10.2, color=self.palette.muted, max_lines=4)
        count = math.ceil(len(items) / columns)
        return y - count * card_height - max(count - 1, 0) * gap - 15

    def prompt_cards(self, y: float, items: list[str], columns: int = 2, card_height: float = 44) -> float:
        gap = 8
        width = (CONTENT_WIDTH - gap * (columns - 1)) / columns
        for index, value in enumerate(items):
            row, column = divmod(index, columns)
            x = MARGIN + column * (width + gap)
            top = y - row * (card_height + gap)
            self.rect(x, top - card_height, width, card_height, self.palette.panel, self.palette.border, 5)
            self.label(f"{index + 1:02d}", x + 9, top - 17, self.palette.accent, 6.2)
            self.paragraph(value, x + 33, top - 16, width - 43, 7.4, 10, color=self.palette.primary, max_lines=2)
        count = math.ceil(len(items) / columns)
        return y - count * card_height - max(count - 1, 0) * gap - 13

    def progress_steps(self, y: float, items: list[tuple[str, str]]) -> float:
        for index, (title, explanation) in enumerate(items):
            top = y - index * 78
            self.canvas.setFillColor(self.palette.soft)
            self.canvas.circle(MARGIN + 16, top - 14, 15, fill=1, stroke=0)
            self.center(f"{index + 1:02d}", MARGIN + 16, top - 17, 7.5, "CuratedSansBold", self.palette.accent)
            self.text(title, MARGIN + 43, top - 12, 10, "CuratedSansBold", self.palette.primary)
            self.paragraph(explanation, MARGIN + 43, top - 31, CONTENT_WIDTH - 48, 7.8, 11, color=self.palette.muted, max_lines=3)
            self.line(MARGIN + 43, top - 61, WIDTH - MARGIN, top - 61)
        return y - len(items) * 78 - 5

    def dot_grid(self, y: float, title: str, height: float = 255) -> float:
        self.rect(MARGIN, y - height, CONTENT_WIDTH, height)
        self.label(title, MARGIN + 14, y - 22)
        self.canvas.setFillColor(self.palette.border)
        for row in range(int((height - 54) // 15)):
            for column in range(int((CONTENT_WIDTH - 34) // 15)):
                self.canvas.circle(MARGIN + 18 + column * 15, y - 45 - row * 15, 0.65, fill=1, stroke=0)
        return y - height - 13

    def finish(self):
        if self.page != self.expected_pages:
            raise RuntimeError(f"{self.path.name}: expected {self.expected_pages} pages, rendered {self.page}")
        self.canvas.save()
        print(f"Rendered {self.path.relative_to(ROOT)}: {self.page} pages")


def birthday_workbook(cover: str):
    book = EditorialWorkbook(ROOT / "launch-assets/products/ultimate-birthday-party-planner.pdf", "Ultimate Birthday Party Planner", FOREST, 29, "A premium, reusable 29-page birthday celebration planning workbook")
    book.cover(cover, "THE COMPLETE PARTY EDITION", "A practical, beautifully organized system for the budget, guest list, food, activities and the moments that matter.")

    y = book.header("A calmer beginning", "How to use this planner", "Build a celebration around people and priorities, not a mountain of purchases.")
    y = book.progress_steps(y - 2, [
        ("Begin with the people", "Choose the guest count, setting, access needs and one feeling you want the celebration to have."),
        ("Name the real budget", "Set a total you can live with. Reserve a little room for small surprises before making any purchases."),
        ("Pick one anchor moment", "Choose one shared activity, food experience or meaningful ritual. Everything else can stay pleasantly simple."),
        ("Plan the practical details", "Use only the worksheets that help. A calm host is worth more than a perfectly coordinated napkin."),
        ("Leave room to enjoy it", "Confirm the essentials, ask for help and protect breathing room in the party-day schedule."),
    ])
    book.note(y, "THE CURATED RULE", "Decisions first. Shopping second. Good company always.")
    book.footer()

    y = book.header("01 | Foundations", "The one-page party brief", "Write down the decisions that will guide every other choice.")
    y = book.field_grid(y, ["Celebrant + age", "Date + start / finish", "Expected guest count", "Venue / address", "Total working budget", "Main activity", "Accessibility notes", "The feeling we want"], 2, 68)
    book.writing_block(y, "One sentence that captures this celebration", 3, 88)
    book.footer()

    y = book.header("02 | Foundations", "Vision and non-negotiables", "Decide what deserves energy and what can be beautifully optional.")
    y = book.field_grid(y, ["The guest of honor cares most about", "Our first spending priority", "Our second spending priority", "The thing we can happily skip"], 2, 78)
    y = book.writing_block(y, "What do we want guests to remember?", 4, 113)
    book.twin_checklists(y, "KEEP THE PLAN", ["Comfortable seating", "Enough food + water", "A realistic timeline", "A clear welcome"], "RELEASE THE PRESSURE", ["An oversized theme", "Matching everything", "Too many activities", "Last-minute upgrades"], 133)
    book.footer()

    y = book.header("03 | Money", "The complete budget map", "Allocate your total before small purchases start making decisions for you.")
    y = book.field_grid(y, ["Maximum total budget", "Contingency set aside"], 2, 64)
    y = book.table(y, ["Category", "Planned", "Actual", "Difference"], 10, [2.7, 1, 1, 1], 27, ["Venue / rental", "Food + drinks", "Cake / dessert", "Activities", "Decor + flowers", "Invitations", "Favors", "Photography", "Transport", "Contingency"])
    book.note(y, "A SMALL BUFFER HELPS", "Consider leaving a modest portion unassigned until the final week.")
    book.footer()

    y = book.header("04 | Money", "Detailed expense tracker", "Track every purchase in one place and mark what has already been paid.")
    y = book.table(y, ["Purchase / vendor", "Category", "Amount", "Paid"], 15, [2.8, 1.5, 1, .7], 27)
    book.field_grid(y, ["Total committed", "Remaining balance"], 2, 61)
    book.footer()

    y = book.header("05 | Guests", "The guest-list dashboard", "Duplicate this page if your guest list needs more breathing room.")
    y = book.table(y, ["Guest / household", "Contact", "Invited", "RSVP"], 15, [2.5, 2, .8, .8], 27)
    book.field_grid(y, ["Invitations sent", "Confirmed guests"], 2, 61)
    book.footer()

    y = book.header("06 | Guests", "RSVPs, comfort and dietary notes", "Keep personal information private and ask before sharing dietary details.")
    y = book.table(y, ["Guest", "Dietary / access needs", "Follow-up", "Done"], 11, [1.5, 2.5, 1.2, .6], 27)
    y = book.note(y, "FOOD SAFETY FIRST", "Confirm allergies directly, prevent cross-contact, and check ingredients with the people involved.")
    book.field_grid(y, ["Final head count due", "Outstanding replies"], 2, 63)
    book.footer()

    y = book.header("07 | Setting", "Choose the right venue", "Compare the practical realities, not just the photographs.")
    y = book.table(y, ["Consideration", "Option A", "Option B", "Option C"], 10, [2.1, 1, 1, 1], 27, ["Rental / minimum spend", "Travel + parking", "Indoor capacity", "Weather backup", "Toilets + step-free access", "Food / cake rules", "Setup + cleanup time", "Noise restrictions", "Guest comfort", "Overall fit"])
    y = book.field_grid(y, ["Preferred venue", "Booking / deposit due"], 2, 65)
    book.writing_block(y, "Questions to ask before confirming", 2, 67)
    book.footer()

    y = book.header("08 | Setting", "Venue and hosting logistics", "Gather the unglamorous details that quietly make a party feel effortless.")
    y = book.field_grid(y, ["Access / key contact", "Arrival and setup window", "Parking / transit", "Toilets + changing space", "Power / speaker location", "Tables + seating", "Waste / recycling plan", "Pickup / closing time"], 2, 65)
    book.note(y, "HOSTING CHECK", "Assign one person to greet, one to watch timing and one to help reset the space.")
    book.footer()

    y = book.header("09 | Visual direction", "Theme, mood and atmosphere", "One clear visual idea feels more considered than ten competing decorations.")
    y = book.field_grid(y, ["Theme / simple concept", "Two or three colors", "One standout focal point", "Texture / flowers / light"], 2, 74)
    y = book.dot_grid(y, "Visual notes, color swatches and the one hero moment", 222)
    book.note(y, "THE EDIT", "Borrow, reuse or adapt what you already own before buying another themed bundle.")
    book.footer()

    y = book.header("10 | Visual direction", "Decor and supply inventory", "Keep what is available separate from what truly needs to be purchased.")
    y = book.table(y, ["Item / zone", "Have", "Borrow", "Buy", "Notes"], 14, [2, .7, .8, .7, 1.7], 27)
    book.note(y, "ONE STRONG MOMENT", "A thoughtful entrance, table or activity backdrop can carry the entire visual story.")
    book.footer()

    y = book.header("11 | Communications", "Invitations and follow-up", "Guests only need clear, useful information delivered at the right moment.")
    y = book.field_grid(y, ["Invitation send date", "RSVP deadline", "Venue + arrival details", "What guests should bring"], 2, 68)
    y = book.twin_checklists(y, "INCLUDE ON THE INVITE", ["Date and start / end time", "Address + access notes", "RSVP contact", "Food or allergy question", "Dress / activity notes", "Parent pickup details"], "FOLLOW-UP TIMELINE", ["Send invitation", "Check unanswered RSVPs", "Share final reminders", "Confirm dietary needs", "Send parking details", "Thank guests afterward"], 193)
    book.writing_block(y, "Message draft / useful details", 2, 70)
    book.footer()

    y = book.header("12 | Food", "The guest-count-led menu", "Build the menu around timing, appetite and what is realistic to serve.")
    y = book.field_grid(y, ["Confirmed adults / children", "Food service time"], 2, 65)
    y = book.table(y, ["Menu item", "Serves", "Prep / pickup", "Dietary notes"], 10, [2.2, .8, 1.5, 1.6], 27)
    book.twin_checklists(y, "DON'T FORGET", ["Water + cups", "Napkins / plates", "Serving tools"], "MAKE IT EASIER", ["One anchor dish", "One simple snack", "One clear dessert"], 110)
    book.footer()

    y = book.header("13 | Food", "Serving and shopping quantities", "Use your confirmed count and the party length as your starting point.")
    y = book.field_grid(y, ["Expected guests", "Meal or snack window", "Known food restrictions", "Extra servings planned"], 2, 65)
    y = book.table(y, ["Food / drink", "Per-person plan", "Total needed", "Assigned to"], 8, [2, 1.3, 1, 1.5], 28)
    book.note(y, "PRACTICAL, NOT PRESCRIPTIVE", "Appetites vary. Confirm ingredients and quantity needs with your guests and food provider.")
    book.footer()

    y = book.header("14 | Food", "Cake, dessert and candles", "Give the celebration moment a plan of its own.")
    y = book.field_grid(y, ["Dessert / bakery", "Flavor + guest count", "Collection / delivery", "Allergy-safe alternative", "Candles + lighter", "Cake stand / serving knife"], 2, 75)
    y = book.twin_checklists(y, "BEFORE THE PARTY", ["Confirm pickup time", "Confirm spelling", "Plan safe storage", "Check serving equipment"], "WHEN IT IS TIME", ["Clear the moment", "Gather the guests", "Ask about photos", "Serve safely"], 141)
    book.writing_block(y, "Cake message / serving notes", 2, 68)
    book.footer()

    y = book.header("15 | Activities", "The anchor-activity planner", "One good shared activity beats a schedule packed with things nobody chose.")
    y = book.field_grid(y, ["Main activity", "Best age / access fit", "Expected duration", "Supplies required", "Who can lead it", "Low-energy alternative"], 2, 69)
    y = book.writing_block(y, "Three simple steps to explain it", 3, 94)
    book.note(y, "AN INVITATION, NOT A DEMAND", "Participation should always be optional. Offer a comfortable quiet or conversation space.")
    book.footer()

    y = book.header("16 | Activities", "The original party-games bank", "Flexible, low-prep ideas that adapt to different ages and group sizes.")
    book.cards(y, [
        ("Color hunt", "Call out a color and invite guests to find an object or photograph it."),
        ("One-word story", "Build a silly story around the circle, one word per willing player."),
        ("Paper-tower lab", "Use paper cups or scrap paper to create the tallest stable tower."),
        ("Soundtrack switch", "Change the song and invite anyone interested to invent a new move."),
        ("Mystery sketch", "Draw a surprise prompt while teammates make friendly guesses."),
        ("Kindness bingo", "Notice small kind acts or shared interests instead of racing to win."),
        ("Photo prompt", "Offer a simple creative prompt and let people opt in or out."),
        ("Quiet corner", "Keep cards, coloring or conversation prompts available without pressure."),
    ], card_height=102)
    book.footer()

    y = book.header("17 | Activities", "Games and activity scorecard", "Track options, supplies, accessibility and how each activity actually went.")
    y = book.table(y, ["Activity", "Supplies", "Time", "Lead", "Ready"], 13, [2, 1.7, .8, 1.1, .7], 27)
    book.note(y, "GOOD GAME DESIGN", "Make instructions short, avoid elimination, and build in a dignified way to opt out.")
    book.footer()

    y = book.header("18 | Purchasing", "The master shopping list", "Sort purchases by where they will come from, not by a dozen tiny lists.")
    y = book.table(y, ["Item", "Store / source", "Quantity", "Budget", "Done"], 15, [2.2, 1.8, .9, .9, .7], 27)
    book.field_grid(y, ["Final shopping trip", "Spending ceiling"], 2, 61)
    book.footer()

    y = book.header("19 | Purchasing", "Orders, rentals and deliveries", "Keep dates, deposits and collection details visible.")
    y = book.table(y, ["Vendor / order", "Due / arrival", "Balance", "Contact", "OK"], 12, [2, 1.35, .9, 1.4, .5], 28)
    y = book.field_grid(y, ["Earliest collection", "Last item to confirm"], 2, 65)
    book.note(y, "SAVE CONFIRMATIONS", "Keep order confirmations, pickup names and vendor contact numbers together.")
    book.footer()

    y = book.header("20 | Finishing touches", "Gifts, favors and small details", "Choose meaningful, useful details rather than obligatory clutter.")
    y = book.field_grid(y, ["Gift / no-gift wording", "Favor idea (optional)", "Thank-you approach", "Photo-sharing preference"], 2, 69)
    y = book.table(y, ["Detail", "Owner", "Cost", "Ready"], 7, [2.7, 1.4, .9, .7], 27)
    book.note(y, "PERMISSION TO SKIP", "Favors are optional. A warm goodbye, a shared photo or a sincere note can be plenty.")
    book.footer()

    y = book.header("21 | Countdown", "Your four-week countdown", "A simple planning rhythm that keeps decisions moving without taking over.")
    y = book.twin_checklists(y, "FOUR WEEKS BEFORE", ["Choose date + guest count", "Set the full budget", "Select venue / setting", "Choose one main activity", "Start the guest list", "Book key suppliers"], "THREE WEEKS BEFORE", ["Send clear invitations", "Confirm venue details", "Sketch the menu", "Check dietary needs", "Plan the key visual moment", "Borrow before buying"], 197)
    y = book.twin_checklists(y, "TWO WEEKS BEFORE", ["Follow up on RSVPs", "Confirm food + dessert", "Order essentials", "Outline the timeline", "Choose a weather backup", "Ask for practical help"], "ONE WEEK BEFORE", ["Lock the final head count", "Shop or confirm delivery", "Share useful guest details", "Prep activity supplies", "Review access needs", "Protect a quiet margin"], 197)
    book.note(y, "STILL A CELEBRATION", "If a week disappears, prioritize people, food, access and one meaningful shared moment.")
    book.footer()

    y = book.header("22 | Countdown", "The final seven days", "Assign each small task a home so it does not follow you around all week.")
    y = book.table(y, ["Day", "One or two priorities", "Owner", "Complete"], 7, [1, 3.0, 1.1, .9], 39, ["Day 7", "Day 6", "Day 5", "Day 4", "Day 3", "Day 2", "Day 1"])
    y = book.writing_block(y, "Anything that can be delegated", 3, 100)
    book.note(y, "USEFUL QUESTION", "If this did not happen, would anyone's comfort, safety or enjoyment actually change?")
    book.footer()

    y = book.header("23 | Countdown", "Twenty-four hours to go", "Confirm essentials, remove unnecessary tasks and give tomorrow some room.")
    y = book.twin_checklists(y, "TONIGHT", ["Confirm arrival + weather", "Check guest count", "Prep food safely", "Charge phone / speaker", "Stage activity materials", "Set out serving supplies", "Confirm pickup details", "Choose comfortable clothes"], "TOMORROW MORNING", ["Check venue access", "Collect cake or food", "Set up key zones", "Fill water station", "Review allergy notes", "Brief your helpers", "Leave an empty buffer", "Eat something yourself"], 245)
    y = book.field_grid(y, ["Most important call / pickup", "Who can help if plans change"], 2, 71)
    book.writing_block(y, "Last little reminders", 3, 84)
    book.footer()

    y = book.header("24 | Party day", "The real-life run of show", "Think in generous blocks, not an anxious minute-by-minute schedule.")
    y = book.table(y, ["Time", "Moment / activity", "Lead", "Supplies / notes"], 12, [1, 2.4, 1.1, 2], 28, ["", "", "", "", "", "", "", "", "", "", "", ""])
    y = book.field_grid(y, ["Guest arrival window", "Expected wrap-up time"], 2, 65)
    book.note(y, "BUILD IN A BREATH", "Allow a short buffer before the main activity and before cake, pickups or cleanup.")
    book.footer()

    y = book.header("25 | Party day", "The setup and guest-flow map", "Sketch where people arrive, eat, settle in and move between activities.")
    y = book.dot_grid(y, "Sketch the room, garden, tables, quiet zone and access routes", 302)
    book.twin_checklists(y, "MARK THESE ZONES", ["Entrance + welcome", "Water / food", "Main activity", "Quiet seating"], "KEEP PATHS CLEAR", ["Toilets + access route", "Emergency exit", "Pickup / handoff", "Waste + cleanup"], 145)
    book.footer()

    y = book.header("26 | Party day", "Weather, comfort and backup", "A calm fallback is more useful than a perfect forecast.")
    y = book.field_grid(y, ["Weather check / decision time", "Indoor or sheltered fallback", "Accessibility backup", "Key emergency contact", "Food allergy plan", "Quiet / decompression space"], 2, 69)
    y = book.twin_checklists(y, "PRACTICAL BACKUPS", ["Extra water", "Simple first-aid kit", "Layers / shade", "Backup activity", "Charged phone"], "WHO HANDLES WHAT", ["Guest updates", "Venue changes", "Food questions", "Transport changes", "Early pickups"], 160)
    book.note(y, "FOR ANY URGENT HEALTH ISSUE", "Follow your local emergency procedures and the care instructions agreed with guests or guardians.")
    book.footer()

    y = book.header("27 | Afterward", "The thoughtful wrap-up", "Capture what worked, thank the people who helped and leave the rest behind.")
    y = book.field_grid(y, ["The moment we loved most", "A detail worth repeating", "A helpful person to thank", "Something we can skip next time"], 2, 74)
    y = book.table(y, ["Guest / helper", "Thank-you note", "Sent"], 5, [1.7, 3.2, .6], 28)
    y = book.writing_block(y, "A note to the person we celebrated", 3, 103)
    book.note(y, "THE BEST PART", "A good party is not measured by how much was purchased. It is measured by how it felt.", 61)
    book.footer()
    book.finish()


def teen_workbook(cover: str):
    book = EditorialWorkbook(ROOT / "launch-assets/products/teen-birthday-party-planner-games-pack.pdf", "The Teen Party Playbook + Games Pack", LILAC, 27, "A premium 27-page teen party planner with original low-pressure printable games")
    book.cover(cover, "THE TEEN PARTY + GAMES EDITION", "Twenty-seven pages of good-vibe planning, original printable games and party ideas people can actually choose to enjoy.")

    y = book.header("Start here", "A party that feels like them", "No forced fun, no embarrassing games and no schedule that leaves no room to hang out.")
    y = book.progress_steps(y - 2, [
        ("Ask for the vibe", "Decide together whether this feels cozy, creative, energetic, dressed-up, outdoorsy or completely low-key."),
        ("Choose the people", "Plan a guest count, access needs, pickup boundaries and a social setting that feels comfortable."),
        ("Pick one anchor", "One movie, creative station, spa setup, food experience or backyard activity gives the night shape."),
        ("Leave optional space", "Keep games and photos opt-in. Conversation, quiet time and simply hanging out all count."),
        ("Protect the good parts", "Set clear boundaries, respect photo consent and avoid turning the party into a performance."),
    ])
    book.note(y, "THE TEEN-PARTY RULE", "The best plan makes it easy to join in - and just as easy to step back.")
    book.footer()

    y = book.header("01 | The vibe", "The one-page teen party brief", "Get the real preferences down before anyone buys a theme.")
    y = book.field_grid(y, ["Celebrant + age", "Date + start / finish", "Who is invited", "Comfortable guest count", "Total budget", "Venue / access", "The one anchor activity", "What would make it feel right"], 2, 67)
    book.writing_block(y, "The non-negotiable boundary or preference", 3, 86)
    book.footer()

    y = book.header("02 | The vibe", "Find the energy, not the theme", "Circle, highlight or annotate the words that actually fit.")
    y = book.cards(y, [("COZY", "Soft lighting, blankets, favorite snacks, an easy movie and room to breathe."), ("CREATIVE", "Craft table, disposable cameras, simple art prompts and a playlist."), ("ENERGETIC", "Backyard movement, a friendly tournament and a flexible snack station."), ("DRESSED-UP", "A simple color story, dinner details, mirror photos and one strong moment."), ("LOW-KEY", "A small guest list, familiar people, food delivery and zero forced schedule."), ("OUTDOORS", "Fresh air, shade, blankets, portable food and a real weather backup.")], card_height=119)
    book.field_grid(y, ["Our top two vibe words", "One thing we absolutely do not want"], 2, 69)
    book.footer()

    y = book.header("03 | The people", "Guest list, comfort and boundaries", "Check access needs privately and make room for different social batteries.")
    y = book.table(y, ["Guest", "Invited", "RSVP", "Dietary / access notes"], 10, [1.7, .8, .8, 2.4], 28)
    y = book.twin_checklists(y, "BEFORE THE PARTY", ["Confirm parent / guardian details", "Agree on start + finish", "Ask about food needs", "Check step-free access"], "DURING THE PARTY", ["Offer a quiet space", "Ask before sharing photos", "Make games optional", "Respect pickup arrangements"], 155)
    book.footer()

    y = book.header("04 | The budget", "Spend on the parts that matter", "Put the budget beside the experience you actually want.")
    y = book.field_grid(y, ["Total available", "Money kept for surprises"], 2, 66)
    y = book.table(y, ["Category", "Planned", "Spent", "Notes"], 9, [1.8, .9, .9, 2], 28, ["Venue / activity", "Food + drinks", "Cake / dessert", "Decor / lighting", "Game supplies", "Photo details", "Transport", "Sleepover supplies", "Contingency"])
    book.note(y, "MAKE THE TRADE", "Would you rather spend on a stronger shared activity or more decorations? Choose once.")
    book.footer()

    y = book.header("05 | The flow", "A timeline with room to breathe", "Arrival, one shared moment and space to settle in is enough.")
    y = book.table(y, ["Time", "Moment", "What is optional", "Who handles it"], 10, [1, 2.1, 2.0, 1.3], 31, ["", "", "", "", "", "", "", "", "", ""])
    y = book.field_grid(y, ["Arrival / welcome window", "Pickup / quiet finish"], 2, 65)
    book.note(y, "PROTECT SOCIAL SPACE", "Allow unscheduled time before or after the anchor activity. That is often the favorite part.")
    book.footer()

    y = book.header("06 | The setting", "Rooms, zones and good flow", "The right setup gives people more than one comfortable way to participate.")
    y = book.dot_grid(y, "Map the welcome area, snack station, activity, seating and quiet zone", 300)
    book.twin_checklists(y, "KEY ZONES", ["Arrival + bags", "Food + water", "Shared activity", "Comfortable seating"], "PLAN AHEAD", ["Clear access routes", "Charging / power", "Music volume", "Pickup meeting point"], 149)
    book.footer()

    y = book.header("07 | The anchor", "Choose one genuinely good activity", "Pick a shared experience that guests can join without being put on the spot.")
    y = book.cards(y, [("MOVIE NIGHT", "Comfortable seating, a jointly chosen film and a snack bar."), ("SLEEPOVER", "A cozy setup, clear boundaries and a realistic morning plan."), ("SPA / RESET", "Opt-in self-care stations with ingredient and sensitivity checks."), ("BACKYARD", "One friendly outdoor game, shade, water and a weather backup."), ("CREATIVE STUDIO", "A simple craft, playlist and the freedom to make something personal."), ("KARAOKE / PLAYLIST", "Low-pressure requests, optional participation and volume boundaries.")], card_height=115)
    book.field_grid(y, ["Our chosen anchor", "Our easier backup"], 2, 72)
    book.footer()

    for section, title, subtitle, fields, left, right in [
        ("08 | Blueprint", "The movie-night blueprint", "Let the film support the hangout, not control it.", ["Film choice + runtime", "Screen / sound setup", "Seating + blankets", "Snack-bar plan"], ["Offer two film options", "Check age suitability", "Add a subtitles option", "Keep lights adjustable", "Offer non-screen seating"], ["Popcorn + easy snacks", "Cold drinks + water", "Dietary alternatives", "Napkins / bowls", "Pause / bathroom break"]),
        ("09 | Blueprint", "The sleepover blueprint", "Clear expectations make the whole night feel easier.", ["Sleeping arrangement", "Arrival + pickup times", "Food + breakfast", "Quiet-hours agreement"], ["Confirm guardian contacts", "Check medical / food needs", "Offer a private change space", "Keep phone chargers visible", "Agree on morning pickup"], ["Blankets + clean bedding", "Simple bedtime snacks", "Bathroom essentials", "Water + night lights", "Low-key morning activity"]),
        ("10 | Blueprint", "The spa-night blueprint", "Think calm textures, self-care and zero pressure to participate.", ["Opt-in stations", "Ingredient / sensitivity check", "Towels + clean tools", "Music + lighting"], ["Confirm allergies first", "Avoid shared makeup tools", "Offer fragrance-free options", "Never pressure participation", "Keep an easy hand-wash area"], ["Fresh towels", "Simple masks or hand care", "Cucumber / fruit water", "Quiet seating", "Individual take-home items"]),
        ("11 | Blueprint", "The backyard-party blueprint", "Give the outdoors a relaxed plan and a real weather fallback.", ["Outdoor activity", "Shade / shelter", "Water + food setup", "Indoor fallback"], ["Check weather timing", "Plan accessible routes", "Offer shade + seating", "Keep water available", "Agree on volume limits"], ["Reusable cups", "Blankets / simple seating", "One friendly game", "Outdoor-safe lighting", "Easy cleanup supplies"]),
        ("12 | Blueprint", "The creative-studio blueprint", "Make something, share a playlist and keep every skill level welcome.", ["Creative project", "Supplies per guest", "Cleanup / table protection", "Optional showcase"], ["Choose an easy entry point", "Prepare a simple example", "Offer seated alternatives", "Keep sharing optional", "Allow time to finish"], ["Art / craft materials", "Table covers", "Individual storage bags", "Playlist + speakers", "A cleanup basket"]),
    ]:
        y = book.header(section, title, subtitle)
        y = book.field_grid(y, fields, 2, 76)
        y = book.twin_checklists(y, "MAKE IT WORK", left, "SUPPLIES / DETAILS", right, 184)
        book.writing_block(y, "Our version / anything to remember", 3, 86)
        book.footer()

    y = book.header("13 | Food", "The snack-bar and easy-food plan", "Low-mess, easy-to-reach food usually wins.")
    y = book.field_grid(y, ["Guest count", "Food window"], 2, 65)
    y = book.table(y, ["Food / drink", "Quantity", "Dietary option", "Prep / pickup"], 10, [1.9, .9, 1.8, 1.4], 28)
    book.twin_checklists(y, "KEEP IT EASY", ["Water always visible", "One substantial option", "Labels for allergens"], "BEFORE SERVING", ["Ask about restrictions", "Prevent cross-contact", "Offer enough seating"], 106)
    book.footer()

    y = book.header("14 | Atmosphere", "Playlist, lighting and the details", "A few intentional details create a vibe without buying a whole new identity.")
    y = book.field_grid(y, ["Playlist / music owner", "Volume agreement", "Lighting / soft glow", "One simple focal point", "Photo corner (optional)", "Comfortable quiet zone"], 2, 70)
    y = book.writing_block(y, "Three songs or artists that fit", 3, 93)
    book.note(y, "GOOD VIBE CHECK", "Skip anything that makes a guest the joke, records them without consent or creates social pressure.")
    book.footer()

    y = book.header("15 | Photo moments", "A photo plan with real consent", "Photos are an invitation. Nobody owes the camera a performance.")
    y = book.cards(y, [("THE EASY MIRROR", "A clear mirror, good light and an entirely optional photo moment."), ("THE DETAIL SHOT", "Photograph the cake, table, shoes, playlist or a favorite small detail."), ("THE FRIEND FRAME", "Ask first, offer to retake and respect an immediate no."), ("THE BLUR / FLASH", "Creative lights or motion can create atmosphere without showing faces.")], card_height=118)
    y = book.twin_checklists(y, "BEFORE YOU SHARE", ["Ask the people in the photo", "Confirm public vs private", "Remove location details", "Respect a changed mind"], "OPTIONAL PROMPTS", ["Favorite party detail", "Hands / shoes / colors", "A silly object close-up", "A group-free mood shot"], 150)
    book.footer()

    y = book.header("16 | Printable game", "This or That: the good-vibe edition", "Cut into cards or simply read aloud. Passing is always allowed.")
    y = book.prompt_cards(y, ["Sunrise plans or midnight snacks?", "Movie marathon or game night?", "Big group or closest friends?", "Sweet snacks or salty snacks?", "Outdoor picnic or cozy room?", "Playlist control or surprise songs?", "Fancy outfit or perfect hoodie?", "One big trip or tiny adventures?", "Craft night or karaoke night?", "Text invitation or handwritten card?", "Cake slices or dessert bar?", "Photos of people or party details?", "Colorful lights or candle glow?", "Dance floor or snack station?", "Planning ahead or going with it?", "Beach evening or mountain morning?", "Board games or friendly challenges?", "Stay up late or best breakfast?"], 2, 43)
    book.note(y, "MAKE IT YOURS", "Skip any prompt that does not fit. No one needs to explain their answer.", 58)
    book.footer()

    y = book.header("17 | Printable game", "Would You Rather: zero-awkwardness", "Original, low-pressure conversation starters for any comfortable group.")
    y = book.prompt_cards(y, ["Host a rooftop movie or a garden picnic?", "Have unlimited books or concert tickets?", "Learn one dance or one magic trick?", "Plan the playlist or design the snack bar?", "Travel by train or take a long road trip?", "Create a photo booth or a craft table?", "Have a day at the beach or in the snow?", "Make the cake or choose every topping?", "Watch a comfort film or a mystery?", "Find a hidden cafe or a secret bookshop?", "Get the best seat or the best soundtrack?", "Design a tiny room or a huge garden?", "Know every song or every movie quote?", "Spend a day painting or taking photos?", "Have an extra weekend or extra holiday?", "Keep a journal or make a time capsule?"], 2, 45)
    book.note(y, "THE HOUSE RULE", "Keep it friendly, never single anyone out, and invite people to pass without explaining.")
    book.footer()

    y = book.header("18 | Printable game", "The consent-first photo hunt", "Capture details, colors and atmosphere - only photograph people who agree.")
    y = book.prompt_cards(y, ["Something that matches the vibe", "The smallest beautiful detail", "An unexpected reflection", "Your favorite color in the room", "A dramatic shadow", "Three objects making a pattern", "The best-looking snack", "A playlist-inspired detail", "Something with a great texture", "A creative close-up", "A star, sparkle or little light", "One thing that feels like the host", "A candid detail with no faces", "The coziest corner", "A matching color pair", "Your favorite moment - with permission"], 2, 45)
    book.note(y, "PHOTO BOUNDARY", "Get permission before taking or posting images of people. No secret photos or forced poses.")
    book.footer()

    y = book.header("19 | Printable game", "The one-minute challenge lab", "Friendly, seated-friendly ideas with no messy food, unsafe stunts or elimination.")
    y = book.cards(y, [("PAPER TOWER", "Build the tallest stable tower using only scrap paper."), ("COLOR SORT", "Sort a small bowl of safe, clean objects by color."), ("SONG GUESS", "Name a familiar song from a very short intro."), ("DOODLE DASH", "Sketch one friendly prompt while others guess."), ("CUP PATTERN", "Copy a simple cup pattern using a printed example."), ("WORD CHAIN", "Take turns adding related words without racing anyone."), ("MEMORY TRAY", "Study a tray of objects, then recall as many as you can."), ("KINDNESS ROUND", "Find as many shared interests as possible in one minute.")], card_height=100)
    book.note(y, "KEEP IT ACCESSIBLE", "Adapt standing tasks, avoid allergens, and make every challenge completely optional.", 56)
    book.footer()

    y = book.header("20 | Printable game", "The friendly mini-tournament", "Use it for cards, safe games, trivia or a completely made-up creative challenge.")
    y = book.field_grid(y, ["Game / activity", "Host / helper"], 2, 66)
    y = book.table(y, ["Round", "Players / teams", "Result", "Next step"], 8, [1, 2.5, 1.2, 1.7], 31, ["Match 1", "Match 2", "Match 3", "Match 4", "Semi 1", "Semi 2", "Final", "Wildcard"])
    book.note(y, "FRIENDLY FORMAT", "Offer teams, seated versions or a cheering role. A rematch matters more than eliminating anyone.")
    book.footer()

    y = book.header("21 | Printable game", "The emoji-mood decoder", "Use the word clues to describe a scene, then let everyone guess or create their own.")
    y = book.prompt_cards(y, ["Stars + blankets + movie = ?", "Flowers + paint + music = ?", "Moon + snacks + stories = ?", "Camera + mirror + sparkle = ?", "Cake + candles + wishes = ?", "Sunshine + lawn + lemonade = ?", "Headphones + lights + dancing = ?", "Popcorn + sofa + mystery = ?", "Notebook + pen + best ideas = ?", "Rain + window + warm cocoa = ?", "Picnic + sunset + good friends = ?", "Confetti + laughter + no pressure = ?"], 2, 51)
    y = book.writing_block(y, "Make up your own three clue words", 2, 74)
    book.note(y, "NO WRONG ANSWERS", "These are conversation prompts, not a test. Different interpretations are part of the fun.", 58)
    book.footer()

    y = book.header("22 | Printable game", "The conversation-starter deck", "Easy questions people can answer lightly, deeply or not at all.")
    y = book.prompt_cards(y, ["What is your ideal lazy afternoon?", "Which tiny thing always improves your day?", "What snack deserves more attention?", "What is the best movie-night setup?", "Which place would you love to explore?", "What song feels like the weekend?", "What would your perfect room include?", "What is a skill you would try just for fun?", "What season has the best atmosphere?", "Which fictional place would you visit?", "What is one trend you genuinely enjoy?", "What makes a hangout feel comfortable?", "What color feels most like your mood?", "What is your dream low-key celebration?", "Which activity would you teach a friend?", "What is one thing worth celebrating?"] , 2, 45)
    book.note(y, "ALWAYS OPTIONAL", "Skip personal questions, protect privacy, and let people participate in their own way.")
    book.footer()

    y = book.header("23 | Printable game", "The reusable challenge scoreboard", "Record friendly points, team names or creative category votes.")
    y = book.field_grid(y, ["Activity / game", "Host / timekeeper"], 2, 64)
    y = book.table(y, ["Player / team", "Round 1", "Round 2", "Round 3", "Total"], 10, [2, 1, 1, 1, .8], 28)
    book.note(y, "BEST USE", "Celebrate surprising ideas, good sportsmanship and the people who helped everyone join in.")
    book.footer()

    y = book.header("24 | Ready to go", "Setup, shopping and a calm finish", "Close the loop without turning the final hour into a production.")
    y = book.twin_checklists(y, "SHOP / COLLECT", ["Food + drinks", "Dietary alternatives", "Main activity supplies", "Chargers / speaker", "Simple light or decor", "Cake / dessert", "Cleanup supplies"], "SET UP", ["Welcome / bag area", "Visible water station", "Comfortable seating", "Anchor activity", "Quiet alternative", "Photo boundaries", "Clear pickup plan"], 222)
    y = book.field_grid(y, ["Someone who can help", "The detail we can skip"], 2, 70)
    book.writing_block(y, "Final reminders", 3, 92)
    book.footer()

    y = book.header("25 | Afterward", "Keep the good part", "Capture the things that actually mattered and let everything else go.")
    y = book.field_grid(y, ["Favorite moment", "Funniest little detail", "A friend to thank", "A plan worth repeating", "Something to skip next time", "Photo-sharing agreement"], 2, 73)
    y = book.writing_block(y, "A note for future-you", 4, 119)
    book.note(y, "THE WHOLE POINT", "A memorable party feels comfortable, chosen and shared. The rest is just decoration.")
    book.footer()
    book.finish()


def birthday_freebie():
    book = EditorialWorkbook(ROOT / "public/downloads/birthday-party-quick-start-kit.pdf", "Birthday Party Quick-Start Kit", FOREST, 10, "A premium free 10-page birthday-party planning starter kit")
    book.illustrated_cover("THE THOUGHTFUL STARTER EDITION", "Birthday Party", "Quick-Start Kit", "Ten beautifully useful pages for deciding what matters, gathering the details and planning one calmer celebration.", "10 PRACTICAL PRINTABLE PAGES")

    y = book.header("01 | Begin", "A calmer way to get started", "The entire plan becomes easier once these four decisions have a home.")
    y = book.progress_steps(y, [("Choose the people", "Start with who the celebration is for, the guest count and any comfort or access needs."), ("Set one honest number", "Name the total budget before you pick decorations, extras or a complicated menu."), ("Choose one good moment", "Plan one shared activity, meal or little ritual that feels right for the guest of honor."), ("Leave the rest optional", "Use only the pages you need. A simple celebration can still feel generous and memorable.")])
    y = book.writing_block(y, "The one thing we want this party to feel like", 3, 96)
    book.note(y, "THE CURATED RULE", "Decisions first. Shopping second. Good company always.")
    book.footer()

    y = book.header("02 | The brief", "Your one-page party snapshot", "Fill in the details you will come back to again and again.")
    y = book.field_grid(y, ["Celebrant + age", "Date + time", "Expected guest count", "Venue / setting", "Total available budget", "Main activity", "Food / access notes", "The feeling we want"], 2, 67)
    book.writing_block(y, "The one detail that matters most", 3, 85)
    book.footer()

    y = book.header("03 | The money", "A simple, usable budget", "Keep the important decisions visible before you start spending.")
    y = book.field_grid(y, ["Working total", "Small contingency"], 2, 66)
    y = book.table(y, ["Category", "Planned", "Spent", "Still needed"], 9, [2, 1, 1, 1.2], 28, ["Venue", "Food + drinks", "Cake / dessert", "Main activity", "Decor", "Invitations", "Optional favors", "Transport", "Contingency"])
    book.note(y, "PRIORITY CHECK", "Put most of your energy into comfort, access, enough food and the one shared moment.")
    book.footer()

    y = book.header("04 | The guests", "Guest list and useful notes", "Keep contact information and personal needs private.")
    y = book.table(y, ["Guest / household", "Contact", "RSVP", "Food / access notes"], 13, [1.8, 1.5, .7, 1.8], 28)
    book.field_grid(y, ["Confirmed total", "Follow-ups still needed"], 2, 69)
    book.footer()

    y = book.header("05 | The menu", "The no-drama food plan", "Let your actual guest count shape the menu.")
    y = book.field_grid(y, ["Guest count", "Meal / snack timing"], 2, 68)
    y = book.table(y, ["Food or drink", "Quantity", "Dietary notes", "Buy / prep"], 9, [2, 1, 1.8, 1.3], 28)
    book.twin_checklists(y, "DON'T FORGET", ["Water + cups", "Serving tools", "Napkins", "Clear allergy labels"], "MAKE IT SIMPLE", ["One main option", "One easy snack", "One dessert", "Enough comfortable seats"], 133)
    book.footer()

    y = book.header("06 | The fun", "One good shared activity", "A focused plan makes more space for people to enjoy one another.")
    y = book.field_grid(y, ["Main activity", "Age / access fit", "Supplies required", "Who can help", "Expected time", "Quiet / easier alternative"], 2, 71)
    y = book.writing_block(y, "How we will explain or set it up", 3, 105)
    book.note(y, "HOSTING KINDLY", "Keep participation optional, avoid elimination games and offer a quiet place to sit.")
    book.footer()

    y = book.header("07 | The list", "Your master shopping list", "Write it once, group it logically and stop carrying it all in your head.")
    y = book.table(y, ["Item", "Store / source", "Qty", "Budget", "Done"], 14, [2, 1.8, .7, .9, .7], 27)
    book.note(y, "BEFORE BUYING", "Check what you already own, borrow what you can, and skip what does not change the experience.")
    book.footer()

    y = book.header("08 | The day", "A party-day flow that breathes", "Plan the major moments, then leave room for real life.")
    y = book.table(y, ["Time", "Moment", "Who / what is needed"], 11, [1, 2.1, 2.6], 29)
    y = book.field_grid(y, ["Guests arrive", "Wrap-up / pickup"], 2, 69)
    book.note(y, "THE BUFFER", "Leave a little unscheduled room before food, the main activity and the goodbye.")
    book.footer()

    y = book.header("09 | Next steps", "You already have what matters", "A celebration can be thoughtful, organized and still feel like a real life.")
    y = book.twin_checklists(y, "YOU NOW HAVE", ["A clear party snapshot", "One working budget", "A useful guest list", "An achievable food plan", "One anchor activity", "A practical shopping list", "A flexible day-of timeline"], "WANT THE COMPLETE SYSTEM?", ["Detailed venue comparisons", "A full expense tracker", "Invitations + RSVP follow-up", "An original games bank", "Four-week countdown pages", "Room layout + backup plans", "Thank-you + reflection pages"], 235)
    y = book.writing_block(y, "What matters most at our celebration", 3, 102)
    book.note(y, "THE NEXT EDIT", "Find the full 29-page Ultimate Birthday Party Planner at the-curated-pin.netlify.app/shop.")
    book.footer()
    book.finish()


def teen_freebie():
    book = EditorialWorkbook(ROOT / "public/downloads/teen-birthday-party-planning-kit.pdf", "Teen Birthday Party Planning Kit", LILAC, 8, "A premium free 8-page teen birthday party starter kit")
    book.illustrated_cover("THE GOOD-VIBE STARTER EDITION", "The Teen Party", "Planning Kit", "Eight thoughtful pages for choosing the right vibe, protecting the budget and planning a celebration that feels like them.", "8 GOOD-VIBE PRINTABLE PAGES")

    y = book.header("01 | Start here", "Find the vibe, not the pressure", "Ask what sounds enjoyable before anybody buys a party theme.")
    y = book.cards(y, [("COZY", "Blankets, soft light, favorite snacks and a movie that does not need to run the whole night."), ("CREATIVE", "An easy craft table, a shared playlist and room to make something personal."), ("ENERGETIC", "A friendly backyard activity, water, shade and plenty of flexible space."), ("LOW-KEY", "A small group, simple food, familiar people and no forced activities.")], card_height=119)
    y = book.field_grid(y, ["Our chosen vibe", "One thing we definitely do not want"], 2, 75)
    book.note(y, "THE RULE", "Games, photos and sharing should always be optional.")
    book.footer()

    y = book.header("02 | The people", "Guests, budget and boundaries", "Put the non-negotiables on paper before choosing the fun extras.")
    y = book.field_grid(y, ["Celebrant + age", "Date + hours", "Comfortable guest count", "Total available budget", "Main location", "Food / access needs", "Pickup / guardian contact", "One clear boundary"], 2, 67)
    book.writing_block(y, "Who needs a follow-up / important details", 3, 86)
    book.footer()

    y = book.header("03 | The anchor", "Choose one shared moment", "Give the celebration shape without packing every minute.")
    y = book.cards(y, [("MOVIE / SLEEPOVER", "Comfortable seats, snack choices, realistic quiet hours and a clear pickup plan."), ("SPA / RESET", "Optional stations, clean tools, sensitivity checks and a quiet alternative."), ("BACKYARD HANGOUT", "A flexible outdoor game, water, shade and an actual rain plan."), ("CREATIVE STUDIO", "One easy craft, a good playlist and no pressure to show the result.")], card_height=117)
    y = book.field_grid(y, ["Chosen activity", "Easy backup"], 2, 75)
    book.note(y, "PROTECT THE HANGOUT", "Leave room before or after the activity for food, conversation and quiet time.")
    book.footer()

    y = book.header("04 | Food", "The simple snack-bar plan", "Start with what people can actually eat and how long they will stay.")
    y = book.field_grid(y, ["Confirmed guest count", "Food / snack window"], 2, 65)
    y = book.table(y, ["Food or drink", "Quantity", "Dietary notes", "Prep / pickup"], 9, [1.8, .9, 1.7, 1.5], 28)
    book.twin_checklists(y, "KEEP AVAILABLE", ["Water", "Substantial food", "A simple dessert", "Clear allergen notes"], "KEEP EASY", ["Reusable cups", "Easy napkins", "Seated options", "One helper"], 133)
    book.footer()

    y = book.header("05 | The flow", "A timeline that still feels free", "Three or four major moments are plenty.")
    y = book.table(y, ["Time", "Moment", "Optional alternative", "Notes"], 10, [1, 1.9, 1.9, 1.4], 29)
    y = book.field_grid(y, ["Arrival / settling in", "Pickup / closing time"], 2, 69)
    book.note(y, "A LITTLE SPACE", "Unscheduled time, water, seating and a quiet corner make every plan easier.")
    book.footer()

    y = book.header("06 | Optional fun", "A tiny low-pressure games sampler", "Three original ideas. Nobody has to join.")
    y = book.cards(y, [("THIS OR THAT", "Movie night or game night? Sweet snacks or salty snacks? Cozy room or backyard hangout?"), ("DETAIL PHOTO HUNT", "Find your favorite color, a good texture and one party detail - with real photo consent."), ("PAPER-TOWER LAB", "Use scrap paper to build a tiny tower. Try it seated, in a team, or not at all."), ("GOOD-VIBE QUESTION", "What would your ideal relaxed afternoon look like? Passing is always a complete answer.")], card_height=115)
    y = book.writing_block(y, "Our own optional activity", 3, 93)
    book.note(y, "THE FULL PLAYBOOK", "The complete edition adds original printable cards, blueprints, a photo hunt and score sheets.")
    book.footer()

    y = book.header("07 | Next steps", "The vibe is already the plan", "You do not need to turn a birthday into a perfectly styled performance.")
    y = book.twin_checklists(y, "YOUR STARTER KIT COVERS", ["A teen-approved vibe", "Guests, budget + boundaries", "One flexible anchor activity", "A practical snack plan", "A schedule with space", "Three optional game ideas"], "THE COMPLETE PLAYBOOK ADDS", ["Five detailed party blueprints", "Printable This-or-That cards", "Would-You-Rather prompts", "A consent-first photo hunt", "Friendly challenges + bracket", "Scoreboards + setup pages"], 216)
    y = book.writing_block(y, "One thing we are genuinely excited about", 3, 112)
    book.note(y, "GET THE COMPLETE 27-PAGE EDITION", "Find The Teen Party Playbook + Games Pack at the-curated-pin.netlify.app/shop.")
    book.footer()
    book.finish()


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-premium-products.py BIRTHDAY_COVER.png TEEN_COVER.png")
    birthday_cover, teen_cover = map(Path, sys.argv[1:])
    for item in (birthday_cover, teen_cover):
        if not item.is_file():
            raise FileNotFoundError(item)
    birthday_workbook(str(birthday_cover))
    teen_workbook(str(teen_cover))
    birthday_freebie()
    teen_freebie()


if __name__ == "__main__":
    main()
