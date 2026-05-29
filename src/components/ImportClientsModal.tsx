import { useEffect, useMemo, useState } from 'react';
import {
  X, Upload, FileDown, Download, ArrowLeft, ArrowRight, CheckCircle2,
  AlertTriangle, Loader2, FileSpreadsheet, ClipboardPaste, Link2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithAuth } from '../api';
import Select from './ui/Select';
import {
  CLIENT_FIELDS, type ClientFieldKey, type ParsedTable,
  parseDelimited, autoMapColumns, buildClientRows, buildTemplate,
  templateHeaders, templateExampleRow, googleSheetCsvUrl,
} from '../lib/clientImport';

export type ImportMethod = 'csv' | 'excel' | 'paste' | 'gsheet';

interface Props {
  open: boolean;
  method: ImportMethod;
  onClose: () => void;
  onImported: (createdCount: number) => void;
}

interface ImportRowResult {
  email: string;
  status: 'created' | 'duplicate' | 'limit' | 'error';
  reason?: string;
}
interface ImportResponse {
  created: number;
  skipped: number;
  failed: number;
  results: ImportRowResult[];
}

type Step = 'input' | 'mapping' | 'result';

const METHOD_META: Record<ImportMethod, { icon: any; es: string; en: string }> = {
  csv:    { icon: FileDown,        es: 'CSV',                en: 'CSV' },
  excel:  { icon: FileSpreadsheet, es: 'Excel',              en: 'Excel' },
  paste:  { icon: ClipboardPaste,  es: 'Pegar datos',        en: 'Paste data' },
  gsheet: { icon: Link2,           es: 'Google Sheets',      en: 'Google Sheets' },
};

export default function ImportClientsModal({ open, method, onClose, onImported }: Props) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const [step, setStep] = useState<Step>('input');
  const [table, setTable] = useState<ParsedTable | null>(null);
  const [mapping, setMapping] = useState<Record<ClientFieldKey, number | null>>({} as any);
  const [sendEmail, setSendEmail] = useState(true);
  const [pasteText, setPasteText] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);

  // Reset everything when (re)opened or when the method changes.
  useEffect(() => {
    if (!open) return;
    setStep('input');
    setTable(null);
    setMapping({} as any);
    setSendEmail(true);
    setPasteText('');
    setSheetUrl('');
    setBusy(false);
    setError(null);
    setResult(null);
  }, [open, method]);

  const meta = METHOD_META[method];

  // ── Parsing helpers ───────────────────────────────────────────────────────
  const ingestTable = (parsed: ParsedTable) => {
    if (!parsed.headers.length || !parsed.rows.length) {
      setError(isEs ? 'No se encontraron filas de datos en el archivo.' : 'No data rows found in the file.');
      return;
    }
    setMapping(autoMapColumns(parsed.headers));
    setTable(parsed);
    setStep('mapping');
    setError(null);
  };

  const handleFile = async (file: File) => {
    setBusy(true); setError(null);
    try {
      if (method === 'excel') {
        const buf = await file.arrayBuffer();
        const XLSX = await import('xlsx'); // lazy — keeps it out of the main bundle
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: '' });
        const nonEmpty = aoa.filter(r => Array.isArray(r) && r.some(c => String(c ?? '').trim().length));
        if (!nonEmpty.length) { setError(isEs ? 'La hoja está vacía.' : 'The sheet is empty.'); return; }
        ingestTable({
          headers: nonEmpty[0].map(h => String(h ?? '').trim()),
          rows: nonEmpty.slice(1).map(r => r.map(c => String(c ?? ''))),
        });
      } else {
        const text = await file.text();
        ingestTable(parseDelimited(text));
      }
    } catch (e: any) {
      setError(e?.message || (isEs ? 'No se pudo leer el archivo.' : 'Could not read the file.'));
    } finally {
      setBusy(false);
    }
  };

  const handlePaste = () => {
    if (!pasteText.trim()) { setError(isEs ? 'Pega primero los datos.' : 'Paste the data first.'); return; }
    ingestTable(parseDelimited(pasteText));
  };

  const handleSheet = async () => {
    const exportUrl = googleSheetCsvUrl(sheetUrl.trim());
    if (!exportUrl) {
      setError(isEs ? 'La URL no parece de Google Sheets.' : "That doesn't look like a Google Sheets URL.");
      return;
    }
    setBusy(true); setError(null);
    try {
      // Fetched through the backend to dodge CORS and keep the sheet public-read only.
      const data = await fetchWithAuth('/manager/clients/import/fetch-sheet', {
        method: 'POST', body: JSON.stringify({ url: exportUrl }),
      });
      if (!data?.csv) throw new Error(data?.error || 'No data');
      ingestTable(parseDelimited(data.csv));
    } catch (e: any) {
      setError(e?.message || (isEs
        ? 'No se pudo leer la hoja. Asegúrate de que es pública (cualquiera con el enlace).'
        : 'Could not read the sheet. Make sure it is shared as public (anyone with the link).'));
    } finally {
      setBusy(false);
    }
  };

  // ── Template download ───────────────────────────────────────────────────
  const downloadTemplate = async () => {
    const filename = `plantilla-clientes${method === 'excel' ? '.xlsx' : '.csv'}`;
    if (method === 'excel') {
      const XLSX = await import('xlsx');
      const aoa = [templateHeaders(isEs), templateExampleRow(isEs)];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
      XLSX.writeFile(wb, filename);
      return;
    }
    const delim = method === 'paste' ? '\t' : ',';
    const csv = buildTemplate(isEs, delim as any);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Validation preview ────────────────────────────────────────────────────
  const built = useMemo(() => {
    if (!table) return null;
    return buildClientRows(table.rows, mapping, { isEs });
  }, [table, mapping, isEs]);

  const emailMapped = mapping.email != null;

  // ── Import ──────────────────────────────────────────────────────────────
  const runImport = async () => {
    if (!built || !built.valid.length) return;
    setBusy(true); setError(null);
    try {
      const data: ImportResponse = await fetchWithAuth('/manager/clients/import', {
        method: 'POST',
        body: JSON.stringify({ rows: built.valid, sendEmail }),
      });
      setResult(data);
      setStep('result');
    } catch (e: any) {
      setError(e?.message || (isEs ? 'Error al importar.' : 'Import failed.'));
    } finally {
      setBusy(false);
    }
  };

  const downloadErrorReport = () => {
    if (!result) return;
    const failedRows = result.results.filter(r => r.status === 'error' || r.status === 'limit');
    const rows = [
      ['email', isEs ? 'estado' : 'status', isEs ? 'motivo' : 'reason'],
      ...failedRows.map(r => [r.email, r.status, r.reason || '']),
    ];
    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'errores-importacion.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <meta.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEs ? 'Importar clientes' : 'Import clients'} · {isEs ? meta.es : meta.en}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'input' && (isEs ? 'Paso 1 de 3 · Carga tus datos' : 'Step 1 of 3 · Load your data')}
                {step === 'mapping' && (isEs ? 'Paso 2 de 3 · Revisa las columnas' : 'Step 2 of 3 · Review columns')}
                {step === 'result' && (isEs ? 'Paso 3 de 3 · Resultado' : 'Step 3 of 3 · Result')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: INPUT ── */}
          {step === 'input' && (
            <div className="space-y-5">
              {/* Format spec */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {isEs ? 'Columnas esperadas' : 'Expected columns'}
                  </span>
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isEs ? 'Descargar plantilla' : 'Download template'}
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {CLIENT_FIELDS.map(f => (
                    <div key={f.key} className="px-4 py-2 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{isEs ? f.es : f.en}</span>
                        {f.required
                          ? <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">{isEs ? 'Obligatorio' : 'Required'}</span>
                          : <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{isEs ? 'Opcional' : 'Optional'}</span>}
                      </div>
                      <span className="text-xs text-slate-400 truncate">{isEs ? f.exampleEs : f.exampleEn}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
                  {method === 'paste'
                    ? (isEs ? 'Separa las columnas por tabulador (copia/pega directo desde Excel o Google Sheets). La primera fila son los encabezados.' : 'Separate columns by tab (copy/paste straight from Excel or Google Sheets). First row is the header.')
                    : method === 'excel'
                    ? (isEs ? 'Primera hoja del libro. La primera fila debe ser los encabezados. El orden de columnas da igual: lo mapeas en el paso 2.' : 'First sheet of the workbook. First row must be the headers. Column order does not matter: you map it in step 2.')
                    : method === 'gsheet'
                    ? (isEs ? 'La hoja debe estar compartida como "cualquiera con el enlace". La primera fila son los encabezados.' : 'The sheet must be shared as "anyone with the link". First row is the header.')
                    : (isEs ? 'Acepta separador coma, punto y coma o tabulador. La primera fila son los encabezados. El orden de columnas da igual.' : 'Accepts comma, semicolon or tab separator. First row is the header. Column order does not matter.')}
                </div>
              </div>

              {/* Input control */}
              {(method === 'csv' || method === 'excel') && (
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-colors">
                  <Upload className="w-7 h-7 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {isEs ? 'Selecciona un archivo' : 'Choose a file'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {method === 'excel' ? '.xlsx, .xls' : '.csv, .tsv, .txt'}
                  </span>
                  <input
                    type="file"
                    accept={method === 'excel' ? '.xlsx,.xls' : '.csv,.tsv,.txt,text/csv'}
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = ''; }}
                  />
                </label>
              )}

              {method === 'paste' && (
                <div className="space-y-3">
                  <textarea
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    rows={8}
                    placeholder={isEs ? 'Pega aquí las filas copiadas desde Excel / Google Sheets…' : 'Paste rows copied from Excel / Google Sheets here…'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-3 font-mono focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handlePaste}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" /> {isEs ? 'Continuar' : 'Continue'}
                  </button>
                </div>
              )}

              {method === 'gsheet' && (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/…"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2.5 px-3 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSheet}
                    disabled={busy}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {isEs ? 'Leer hoja' : 'Read sheet'}
                  </button>
                </div>
              )}

              {busy && (method === 'csv' || method === 'excel') && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> {isEs ? 'Leyendo…' : 'Reading…'}</div>
              )}
            </div>
          )}

          {/* ── STEP 2: MAPPING ── */}
          {step === 'mapping' && table && built && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isEs
                  ? 'Asigna cada campo de cliente a una columna de tu archivo. Detectamos las columnas automáticamente; ajústalas si hace falta.'
                  : 'Match each client field to a column from your file. We auto-detected them; tweak if needed.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLIENT_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      {isEs ? f.es : f.en}
                      {f.required && <span className="text-emerald-600">*</span>}
                    </label>
                    <Select
                      value={mapping[f.key] == null ? '' : String(mapping[f.key])}
                      onChange={(v) => setMapping(m => ({ ...m, [f.key]: v === '' ? null : Number(v) }))}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-2 px-3 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">{isEs ? '— Sin asignar —' : '— Not mapped —'}</option>
                      {table.headers.map((h, i) => (
                        <option key={i} value={String(i)}>{h || `${isEs ? 'Columna' : 'Column'} ${i + 1}`}</option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>

              {!emailMapped && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {isEs ? 'Debes asignar la columna de Email para continuar.' : 'You must map the Email column to continue.'}
                </div>
              )}

              {/* Preview */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {isEs ? 'Vista previa' : 'Preview'} ({Math.min(5, built.valid.length)}/{built.valid.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        {CLIENT_FIELDS.filter(f => mapping[f.key] != null).map(f => (
                          <th key={f.key} className="px-3 py-2 font-bold whitespace-nowrap">{isEs ? f.es : f.en}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {built.valid.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                          {CLIENT_FIELDS.filter(f => mapping[f.key] != null).map(f => (
                            <td key={f.key} className="px-3 py-1.5 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                              {String((row as any)[f.key] ?? '') || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {built.valid.length === 0 && (
                        <tr><td className="px-3 py-3 text-slate-400" colSpan={9}>{isEs ? 'No hay filas válidas.' : 'No valid rows.'}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Validation summary */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {built.valid.length} {isEs ? 'listos' : 'ready'}
                </span>
                {built.errors.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> {built.errors.length} {isEs ? 'con error' : 'with errors'}
                  </span>
                )}
                {built.duplicatesInFile > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {built.duplicatesInFile} {isEs ? 'duplicados en el archivo' : 'duplicates in file'}
                  </span>
                )}
              </div>

              {built.errors.length > 0 && (
                <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {built.errors.slice(0, 30).map((er, i) => (
                    <div key={i} className="px-3 py-1.5 flex items-center justify-between gap-2">
                      <span className="text-slate-500">{isEs ? 'Fila' : 'Row'} {er.rowNumber}{er.email ? ` · ${er.email}` : ''}</span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">{er.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Send-email option */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{isEs ? 'Enviar email de invitación' : 'Send invite email'}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{isEs ? 'Se enviarán las credenciales a cada cliente importado.' : 'Credentials will be emailed to each imported client.'}</p>
                </div>
                <button
                  type="button" role="switch" aria-checked={sendEmail}
                  onClick={() => setSendEmail(v => !v)}
                  className={`w-12 h-6 rounded-full relative shrink-0 transition-colors ${sendEmail ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${sendEmail ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: RESULT ── */}
          {step === 'result' && result && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{result.created}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Creados' : 'Created'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <div className="text-2xl font-black text-slate-600 dark:text-slate-300">{result.skipped}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Omitidos' : 'Skipped'}</div>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-2xl font-black text-red-600 dark:text-red-400">{result.failed}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Fallidos' : 'Failed'}</div>
                </div>
              </div>

              {(result.skipped > 0 || result.failed > 0) && (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {result.results.filter(r => r.status !== 'created').map((r, i) => (
                    <div key={i} className="px-3 py-1.5 flex items-center justify-between gap-2">
                      <span className="text-slate-600 dark:text-slate-300 truncate">{r.email}</span>
                      <span className={`font-semibold ${r.status === 'duplicate' ? 'text-slate-400' : 'text-red-600 dark:text-red-400'}`}>
                        {r.status === 'duplicate' ? (isEs ? 'Ya existía' : 'Already exists')
                          : r.status === 'limit' ? (isEs ? 'Límite del plan' : 'Plan limit')
                          : (r.reason || (isEs ? 'Error' : 'Error'))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {result.failed > 0 && (
                <button onClick={downloadErrorReport} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  <FileDown className="w-3.5 h-3.5" /> {isEs ? 'Descargar informe de errores' : 'Download error report'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {step === 'mapping' ? (
            <button onClick={() => { setStep('input'); setError(null); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4" /> {isEs ? 'Atrás' : 'Back'}
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            {step === 'result' ? (
              <button
                onClick={() => { onImported(result?.created || 0); onClose(); }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
              >
                {isEs ? 'Hecho' : 'Done'}
              </button>
            ) : step === 'mapping' ? (
              <button
                onClick={runImport}
                disabled={busy || !emailMapped || !built || built.valid.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isEs ? `Importar ${built?.valid.length || 0} clientes` : `Import ${built?.valid.length || 0} clients`}
              </button>
            ) : (
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
