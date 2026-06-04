import { describe, expect, it } from 'vitest';
import {
  autoMapColumns,
  buildClientRows,
  googleSheetCsvUrl,
  parseDelimited,
  templateHeaders,
} from './clientImport';

describe('clientImport parsing', () => {
  it('parses semicolon CSV and auto-maps Spanish headers', () => {
    const parsed = parseDelimited('Email;Nombre completo;Edad;Peso (kg)\nana@test.com;Ana Garcia;32;68,5\n');
    const mapping = autoMapColumns(parsed.headers);
    const result = buildClientRows(parsed.rows, mapping, { isEs: true });

    expect(parsed.headers).toEqual(['Email', 'Nombre completo', 'Edad', 'Peso (kg)']);
    expect(result.errors).toEqual([]);
    expect(result.valid[0]).toMatchObject({
      email: 'ana@test.com',
      full_name: 'Ana Garcia',
      age: 32,
      weight: 68.5,
    });
  });

  it('keeps quoted delimiters and newlines inside fields', () => {
    const parsed = parseDelimited('Email,Notes\nana@test.com,"Knee injury, mild\nPrefers mornings"\n');
    const mapping = autoMapColumns(parsed.headers);
    const result = buildClientRows(parsed.rows, mapping, { isEs: false });

    expect(result.valid[0].notes).toContain('Knee injury, mild\nPrefers mornings');
  });

  it('reports invalid rows and drops duplicates in the file', () => {
    const parsed = parseDelimited('Email,Full name\nbad-email,Bad\nana@test.com,Ana\nana@test.com,Ana Copy\n,Missing\n');
    const mapping = autoMapColumns(parsed.headers);
    const result = buildClientRows(parsed.rows, mapping, { isEs: false });

    expect(result.valid).toHaveLength(1);
    expect(result.duplicatesInFile).toBe(1);
    expect(result.errors.map(e => e.reason)).toEqual(['Invalid email', 'Missing email']);
  });

  it('builds bilingual template headers', () => {
    expect(templateHeaders(true)).toContain('Nombre completo');
    expect(templateHeaders(false)).toContain('Full name');
  });

  it('converts public Google Sheets links to CSV export URLs', () => {
    const url = googleSheetCsvUrl('https://docs.google.com/spreadsheets/d/abc-123/edit#gid=456');
    expect(url).toBe('https://docs.google.com/spreadsheets/d/abc-123/export?format=csv&gid=456');
    expect(googleSheetCsvUrl('https://example.com/not-a-sheet')).toBeNull();
  });
});
