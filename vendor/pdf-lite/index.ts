// pdf-lite: genera un PDF di una pagina A4 con righe di testo in Helvetica.
// Solo caratteri latin1: per l'euro scrivere "EUR".

export class PdfLite {
  private readonly lines: string[] = [];

  text(line: string): this {
    this.lines.push(line);
    return this;
  }

  toBuffer(): Buffer {
    const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const content = ['BT', '/F1 12 Tf', '14 TL', '50 800 Td', ...this.lines.map((l) => `(${escape(l)}) '`), 'ET'].join(
      '\n',
    );
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    let out = '%PDF-1.4\n';
    const offsets: number[] = [];
    objects.forEach((obj, i) => {
      offsets.push(Buffer.byteLength(out, 'latin1'));
      out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const xrefAt = Buffer.byteLength(out, 'latin1');
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
      out += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
    return Buffer.from(out, 'latin1');
  }
}
