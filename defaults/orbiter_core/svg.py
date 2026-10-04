"""Restricted shape-only SVG reader for Decky's frozen Python.

No XML/HTML modules, entities, text, external references or active SVG content.
Rebuild accepted shapes instead of passing upstream markup to the browser.
"""
import re

TAGS = {'svg', 'g', 'path', 'circle', 'rect', 'polygon', 'polyline', 'line', 'ellipse'}
ATTRS = {'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
         'stroke-linejoin', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity',
         'stroke-opacity', 'transform', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y',
         'x1', 'x2', 'y1', 'y2', 'width', 'height', 'points'}
ATTRIBUTE = re.compile(r'''\s+([A-Za-z][A-Za-z0-9:_-]*)\s*=\s*(["'])([^<>]*?)\2''')


def safe_svg(raw):
    if not isinstance(raw, str) or len(raw) > 40_000 or re.search(r'[&\x00-\x08\x0b\x0c\x0e-\x1f]', raw):
        return None
    output, stack = [], []
    position, nodes = 0, 0
    for token in re.finditer(r'<[^<>]*>', raw):
        if raw[position:token.start()].strip():
            return None
        position = token.end()
        text = token.group(0)
        closing = re.fullmatch(r'</([A-Za-z]+)\s*>', text)
        if closing:
            tag = closing.group(1)
            if not stack or stack.pop() != tag:
                return None
            output.append('</' + tag + '>')
            continue
        opening = re.fullmatch(r'<([A-Za-z]+)((?:\s[^<>]*?)?)(/?)>', text)
        if not opening:
            return None
        tag, attributes, empty = opening.groups()
        nodes += 1
        if tag not in TAGS or nodes > 512 or len(stack) >= 32:
            return None
        if not stack and (output or tag != 'svg') or stack and tag == 'svg':
            return None
        clean, seen, offset = {}, set(), 0
        for attribute in ATTRIBUTE.finditer(attributes):
            if attributes[offset:attribute.start()].strip():
                return None
            offset = attribute.end()
            key, _, value = attribute.groups()
            if key in seen:
                return None
            seen.add(key)
            if key in ATTRS and not re.search(r'url\s*\(|https?:|javascript:|\\', value, re.I):
                clean[key] = '#ebe4d4' if value == 'currentColor' else value
        if attributes[offset:].strip():
            return None
        if tag == 'svg':
            clean['xmlns'] = 'http://www.w3.org/2000/svg'
            clean.setdefault('fill', '#ebe4d4')
        # Attribute values are quoted anew, never interpreted as markup.
        encoded = ''.join(' ' + key + '="' + value.replace('"', '&quot;') + '"' for key, value in clean.items())
        output.append('<' + tag + encoded + ('/>' if empty else '>'))
        if not empty:
            stack.append(tag)
    if not output or stack or raw[position:].strip():
        return None
    return ''.join(output)
