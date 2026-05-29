// Client bulk-import logic — pure, framework-free so it is unit-testable and
// shared by every import method (CSV file, Excel, paste, Google Sheets).
//
// Design goals:
//  - Capture the MAXIMUM client information the platform can store (email,
//    name, phone, gender, age, weight, height, goal, notes).
//  - Accept any column order / header naming via fuzzy auto-mapping with
//    bilingual (ES/EN) synonyms, then let the user fix the mapping.
//  - Robust delimited parsing (comma / semicolon / tab) with quoted fields,
//    escaped quotes and newlines inside quotes — no external dependency.

export type ClientFieldKey =
  | 'email'
  | 'full_name'
  | 'phone'
  | 'gender'
  | 'age'
  | 'weight'
  | 'height'
  | 'goal'
  | 'notes';

export interface ClientFieldDef {
  key: ClientFieldKey;
  es: string;
  en: string;
  required: boolean;
  // Header aliases (normalized) used for auto-mapping. ES + EN + common variants.
  aliases: string[];
  // Short help shown in the format spec.
  exampleEs: string;
  exampleEn: string;
}

// Normalize a header/string for matching: lowercase, strip accents, collapse
// non-alphanumeric to single spaces, trim.
export function norm(s: string): string {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const CLIENT_FIELDS: ClientFieldDef[] = [
  {
    key: 'email', es: 'Email', en: 'Email', required: true,
    aliases: ['email', 'e mail', 'correo', 'correo electronico', 'mail', 'email address', 'direccion de correo'],
    exampleEs: 'ana@gmail.com', exampleEn: 'ana@gmail.com',
  },
  {
    key: 'full_name', es: 'Nombre completo', en: 'Full name', required: false,
    aliases: ['full name', 'nombre completo', 'nombre', 'name', 'nombre y apellidos', 'cliente', 'client', 'fullname', 'nombre apellidos'],
    exampleEs: 'Ana García', exampleEn: 'Ana García',
  },
  {
    key: 'phone', es: 'Teléfono', en: 'Phone', required: false,
    aliases: ['phone', 'telefono', 'tel', 'movil', 'mobile', 'celular', 'phone number', 'numero de telefono', 'whatsapp'],
    exampleEs: '+34 600 123 456', exampleEn: '+34 600 123 456',
  },
  {
    key: 'gender', es: 'Género', en: 'Gender', required: false,
    aliases: ['gender', 'genero', 'sexo', 'sex'],
    exampleEs: 'Mujer / Hombre / Otro', exampleEn: 'Female / Male / Other',
  },
  {
    key: 'age', es: 'Edad', en: 'Age', required: false,
    aliases: ['age', 'edad', 'years', 'anos', 'anios'],
    exampleEs: '32', exampleEn: '32',
  },
  {
    key: 'weight', es: 'Peso (kg)', en: 'Weight (kg)', required: false,
    aliases: ['weight', 'peso', 'peso kg', 'weight kg', 'kg', 'kilos'],
    exampleEs: '68', exampleEn: '68',
  },
  {
    key: 'height', es: 'Altura (cm)', en: 'Height (cm)', required: false,
    aliases: ['height', 'altura', 'estatura', 'talla', 'height cm', 'altura cm', 'cm'],
    exampleEs: '170', exampleEn: '170',
  },
  {
    key: 'goal', es: 'Objetivo', en: 'Goal', required: false,
    aliases: ['goal', 'objetivo', 'meta', 'target', 'objetivos'],
    exampleEs: 'Perder grasa', exampleEn: 'Fat loss',
  },
  {
    key: 'notes', es: 'Notas', en: 'Notes', required: false,
    aliases: ['notes', 'notas', 'observaciones', 'comentarios', 'comments', 'note', 'nota'],
    exampleEs: 'Lesión de rodilla', exampleEn: 'Knee injury',
  },
];

// ── Delimited parsing ──────────────────────────────────────────────────────

export type Delimiter = ',' | ';' | '\t';

// Guess the delimiter from the first non-empty line by counting candidates
// outside of quotes. Falls back to comma.
export function detectDelimiter(text: string): Delimiter {
  const firstLine = (text.split(/\r?\n/).find(l => l.trim().length) || '');
  const candidates: Delimiter[] = [',', ';', '\t'];
  let best: Delimiter = ',';
  let bestCount = -1;
  for (const d of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < firstLine.length; i++) {
      const ch = firstLine[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === d && !inQuotes) count++;
    }
    if (count > bestCount) { bestCount = count; best = d; }
  }
  return best;
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

// RFC-4180-ish parser: handles quoted fields, "" escaped quotes and newlines
// inside quotes. Works for CSV, semicolon-CSV and TSV.
export function parseDelimited(text: string, delimiter?: Delimiter): ParsedTable {
  const delim = delimiter || detectDelimiter(text);
  // Strip a leading BOM if present.
  const src = text.replace(/^﻿/, '');
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === delim) { record.push(field); field = ''; continue; }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      record.push(field); field = '';
      records.push(record); record = [];
      continue;
    }
    field += ch;
  }
  // Flush trailing field/record.
  if (field.length || record.length) { record.push(field); records.push(record); }

  // Drop fully-empty rows.
  const cleaned = records.filter(r => r.some(c => c != null && c.trim().length));
  if (!cleaned.length) return { headers: [], rows: [] };
  const headers = cleaned[0].map(h => (h || '').trim());
  const rows = cleaned.slice(1);
  return { headers, rows };
}

// ── Auto-mapping ───────────────────────────────────────────────────────────

// For each importable field, find the best-matching column index (or null).
// Exact normalized alias match wins; otherwise a contains-match.
export function autoMapColumns(headers: string[]): Record<ClientFieldKey, number | null> {
  const normHeaders = headers.map(norm);
  const used = new Set<number>();
  const mapping = {} as Record<ClientFieldKey, number | null>;

  const pick = (predicate: (h: string) => boolean): number | null => {
    for (let i = 0; i < normHeaders.length; i++) {
      if (used.has(i)) continue;
      if (predicate(normHeaders[i])) { used.add(i); return i; }
    }
    return null;
  };

  for (const f of CLIENT_FIELDS) {
    const aliases = f.aliases;
    // Pass 1: exact alias match.
    let idx = pick(h => aliases.includes(h));
    // Pass 2: header contains an alias (or vice versa) — guarded so very short
    // aliases like "cm"/"kg" don't grab unrelated columns.
    if (idx == null) {
      idx = pick(h => aliases.some(a => a.length >= 3 && (h === a || h.includes(a) || a.includes(h))));
    }
    mapping[f.key] = idx;
  }
  return mapping;
}

// ── Validation + payload building ──────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ClientImportRow {
  email: string;
  full_name?: string;
  phone?: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  notes?: string;
}

export interface RowError {
  rowNumber: number; // 1-based, matches the data row (excludes header)
  email: string;
  reason: string;
}

export interface BuildResult {
  valid: ClientImportRow[];
  errors: RowError[];
  duplicatesInFile: number;
}

function toNumber(raw: string): number | undefined {
  if (raw == null) return undefined;
  const cleaned = raw.toString().trim().replace(/[^0-9.,-]/g, '').replace(',', '.');
  if (!cleaned) return undefined;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeGender(raw: string, isEs: boolean): string | undefined {
  const v = norm(raw);
  if (!v) return undefined;
  if (['female', 'f', 'mujer', 'm f', 'femenino', 'fem', 'woman'].includes(v)) return isEs ? 'Mujer' : 'Female';
  if (['male', 'hombre', 'masculino', 'masc', 'man', 'h', 'v', 'varon'].includes(v)) return isEs ? 'Hombre' : 'Male';
  if (['other', 'otro', 'otra', 'nb', 'no binario', 'non binary', 'x'].includes(v)) return isEs ? 'Otro' : 'Other';
  // Unknown value: keep the raw trimmed string so info is not lost.
  return raw.trim();
}

// Turn parsed rows + a field→column mapping into validated client payloads.
// Rows missing/invalid email become errors; duplicate emails within the file
// are dropped (first wins) and counted.
export function buildClientRows(
  rows: string[][],
  mapping: Record<ClientFieldKey, number | null>,
  opts: { isEs: boolean },
): BuildResult {
  const valid: ClientImportRow[] = [];
  const errors: RowError[] = [];
  const seen = new Set<string>();
  let duplicatesInFile = 0;

  const cell = (row: string[], key: ClientFieldKey): string => {
    const idx = mapping[key];
    if (idx == null) return '';
    return (row[idx] ?? '').toString().trim();
  };

  rows.forEach((row, i) => {
    const rowNumber = i + 1;
    const email = cell(row, 'email').toLowerCase();
    if (!email) {
      errors.push({ rowNumber, email: '', reason: opts.isEs ? 'Falta el email' : 'Missing email' });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      errors.push({ rowNumber, email, reason: opts.isEs ? 'Email no válido' : 'Invalid email' });
      return;
    }
    if (seen.has(email)) { duplicatesInFile++; return; }
    seen.add(email);

    const payload: ClientImportRow = { email };
    const fullName = cell(row, 'full_name');
    if (fullName) payload.full_name = fullName;
    const phone = cell(row, 'phone');
    if (phone) payload.phone = phone;
    const gender = normalizeGender(cell(row, 'gender'), opts.isEs);
    if (gender) payload.gender = gender;
    const age = toNumber(cell(row, 'age'));
    if (age != null) payload.age = Math.round(age);
    const weight = toNumber(cell(row, 'weight'));
    if (weight != null) payload.weight = weight;
    const height = toNumber(cell(row, 'height'));
    if (height != null) payload.height = height;
    const goal = cell(row, 'goal');
    if (goal) payload.goal = goal;
    const notes = cell(row, 'notes');
    if (notes) payload.notes = notes;

    valid.push(payload);
  });

  return { valid, errors, duplicatesInFile };
}

// ── Template generation ────────────────────────────────────────────────────

export function templateHeaders(isEs: boolean): string[] {
  return CLIENT_FIELDS.map(f => (isEs ? f.es : f.en));
}

export function templateExampleRow(isEs: boolean): string[] {
  return CLIENT_FIELDS.map(f => (isEs ? f.exampleEs : f.exampleEn));
}

// Build a CSV/TSV string (with example row) for download.
export function buildTemplate(isEs: boolean, delimiter: Delimiter = ','): string {
  const esc = (v: string) => {
    const needsQuote = v.includes(delimiter) || v.includes('"') || v.includes('\n');
    const s = v.replace(/"/g, '""');
    return needsQuote ? `"${s}"` : s;
  };
  const headers = templateHeaders(isEs).map(esc).join(delimiter);
  const example = templateExampleRow(isEs).map(esc).join(delimiter);
  return `﻿${headers}\n${example}\n`;
}

// Convert a Google Sheets share/edit URL to its CSV export URL. Returns null if
// it doesn't look like a Sheets URL.
export function googleSheetCsvUrl(url: string): string | null {
  const m = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!m) return null;
  const id = m[1];
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}
