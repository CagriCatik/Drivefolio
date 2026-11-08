"""Build the small, local Three.js typeface used by the name sculpture.
Requires fonttools; runtime/build of the website does not require Python.
Usage: python tools/build-name-font.py /path/to/DejaVuSans-Bold.ttf
"""
import json
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

root = Path(__file__).resolve().parents[1]
font = TTFont(sys.argv[1])
glyph_set = font.getGlyphSet()
scale = 1000 / font['head'].unitsPerEm

class OutlinePen(BasePen):
    def __init__(self):
        super().__init__(glyph_set)
        self.tokens = []
        self.first = None
    def emit(self, command, *points):
        self.tokens.append(command)
        for point in points:
            self.tokens.extend(str(round(v * scale, 3)) for v in point)
    def _moveTo(self, point):
        self.first = point
        self.emit('m', point)
    def _lineTo(self, point): self.emit('l', point)
    def _qCurveToOne(self, control, end): self.emit('q', end, control)
    def _curveToOne(self, first, second, end): self.emit('b', end, first, second)
    def _closePath(self): self.emit('l', self.first)
    def _endPath(self): pass

cmap = font.getBestCmap()
glyphs = {}
for character in set('Çağrı Çatık? '):
    name = cmap[ord(character)]
    pen = OutlinePen()
    glyph_set[name].draw(pen)
    glyphs[character] = {'ha': round(font['hmtx'][name][0] * scale, 3), 'o': ' '.join(pen.tokens)}
result = {'glyphs': glyphs, 'familyName': 'Drivefolio Name', 'resolution': 1000,
          'ascender': font['hhea'].ascent * scale, 'descender': font['hhea'].descent * scale,
          'boundingBox': {'yMin': font['head'].yMin * scale, 'yMax': font['head'].yMax * scale},
          'underlineThickness': 50, 'original_font_information': 'Subset derived from DejaVu Sans Bold. See licenses/dejavu-fonts.txt.'}
(root / 'public/fonts/name-bold.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
