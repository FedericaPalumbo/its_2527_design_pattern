// tiny-xml: parser XML minimale. Gestisce elementi, attributi e testo.
// Non gestisce CDATA, commenti e namespace.

export interface XmlNode {
  name: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text: string;
}

function unescape(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export function parseXml(source: string): XmlNode {
  const src = source.replace(/<\?xml[^>]*\?>/, '').trim();
  let pos = 0;

  function parseNode(): XmlNode {
    const open = /^<([A-Za-z_][\w.-]*)((?:\s+[\w.-]+="[^"]*")*)\s*(\/?)>/.exec(src.slice(pos));
    if (!open) {
      throw new Error(`tiny-xml: tag atteso alla posizione ${pos}`);
    }
    pos += open[0].length;
    const node: XmlNode = { name: open[1], attrs: {}, children: [], text: '' };
    for (const attr of open[2].matchAll(/([\w.-]+)="([^"]*)"/g)) {
      node.attrs[attr[1]] = unescape(attr[2]);
    }
    if (open[3] === '/') return node;
    while (pos < src.length) {
      if (src.startsWith(`</${node.name}>`, pos)) {
        pos += node.name.length + 3;
        node.text = node.text.trim();
        return node;
      }
      if (src[pos] === '<') {
        node.children.push(parseNode());
      } else {
        const next = src.indexOf('<', pos);
        if (next === -1) break;
        node.text += unescape(src.slice(pos, next));
        pos = next;
      }
    }
    throw new Error(`tiny-xml: tag ${node.name} non chiuso`);
  }

  return parseNode();
}
