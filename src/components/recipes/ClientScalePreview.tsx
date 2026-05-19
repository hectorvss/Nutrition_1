import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useClient } from '../../context/ClientContext';
import { fetchWithAuth } from '../../api';
import Select from '../ui/Select';

interface ScaleIngredient { name: string; amount?: string | number; unit?: string; }

interface ClientScalePreviewProps {
  ingredients: ScaleIngredient[];
  calories: number;
}

// Daily-calorie baseline a recipe is authored for. The per-client scale ratio
// is clientPlanKcal / SCALE_REFERENCE_KCAL.
const SCALE_REFERENCE_KCAL = 2000;

const unitShort = (u?: string): string => {
  const v = (u || '').toLowerCase();
  if (v === 'grams' || v === 'gram' || v === 'g') return 'g';
  if (v === 'unit' || v === 'units') return ' u';
  return v ? ' ' + v : '';
};

/** Sum the daily calories of a nutrition plan's data_json (single-day or weekly). */
const computePlanKcal = (dataJson: any): number => {
  let dj = dataJson;
  if (typeof dj === 'string') {
    try { dj = JSON.parse(dj); } catch { return 0; }
  }
  if (!dj || typeof dj !== 'object') return 0;
  let meals: any[] = [];
  if (Array.isArray(dj.meals)) {
    meals = dj.meals;
  } else if (dj.days && typeof dj.days === 'object') {
    const firstDay: any = Object.values(dj.days)[0];
    meals = (firstDay && firstDay.meals) || [];
  }
  let total = 0;
  meals.forEach((m: any) => {
    (m?.items || []).forEach((it: any) => {
      total += (Number(it?.calories) || 0) * (Number(it?.quantity) || 1);
    });
  });
  return Math.round(total);
};

/**
 * Client Scale Preview — lets a manager pick a client and see the recipe's
 * ingredients and calories scaled to that client's nutrition-plan target.
 * Self-contained: works both while creating/editing a recipe and on the
 * default recipe detail view.
 */
export default function ClientScalePreview({ ingredients, calories }: ClientScalePreviewProps) {
  const { t } = useLanguage();
  const { clients } = useClient();
  const [scaleClientId, setScaleClientId] = useState('');
  const [clientPlanKcal, setClientPlanKcal] = useState<number | null>(null);
  const [scaleLoading, setScaleLoading] = useState(false);

  // Load the selected client's nutrition plan and derive their daily kcal target.
  useEffect(() => {
    if (!scaleClientId) { setClientPlanKcal(null); return; }
    let cancelled = false;
    setScaleLoading(true);
    (async () => {
      try {
        const plan = await fetchWithAuth(`/manager/clients/${scaleClientId}/nutrition-plan`);
        if (!cancelled) setClientPlanKcal(plan ? computePlanKcal(plan.data_json) : 0);
      } catch {
        if (!cancelled) setClientPlanKcal(0);
      } finally {
        if (!cancelled) setScaleLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [scaleClientId]);

  const calNum = Number(calories) || 0;
  const scaleRatio = clientPlanKcal && clientPlanKcal > 0 ? clientPlanKcal / SCALE_REFERENCE_KCAL : null;
  const scaledIngredients = (ingredients || [])
    .filter(i => i.name?.trim() && i.amount != null && String(i.amount).trim() !== ''
      && !Number.isNaN(Number(i.amount)) && Number(i.amount) > 0)
    .map(i => ({ name: i.name.trim(), unit: i.unit || '', original: Number(i.amount) }));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500">science</span>
          {t('client_scale_preview')}
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">{t('scale_preview_desc')}</p>
      </div>
      <div className="p-8 space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('select_client')}</label>
          <Select
            value={scaleClientId}
            onChange={(v) => setScaleClientId(v)}
            placeholder={t('select_client')}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm font-bold text-slate-900"
            options={clients.map(c => ({ value: c.id, label: c.name }))}
          />
        </div>

        {!scaleClientId ? (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center text-xs font-medium text-slate-400">
            {t('scale_select_client_hint')}
          </div>
        ) : scaleLoading ? (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center text-xs font-medium text-slate-400">
            {t('loading')}
          </div>
        ) : !scaleRatio ? (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-center text-xs font-medium text-amber-600">
            {t('scale_no_plan')}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('scaled_values')}</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                {t('scale_ratio_label', { ratio: scaleRatio.toFixed(2) })}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mb-4">
              {t('scale_client_target', { kcal: clientPlanKcal ?? 0 })}
            </p>
            <div className="space-y-4">
              {scaledIngredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">{ing.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-300 text-xs">{ing.original}{unitShort(ing.unit)}</span>
                    <span className="text-emerald-600">{Math.round(ing.original * scaleRatio)}{unitShort(ing.unit)}</span>
                  </div>
                </div>
              ))}
              {calNum > 0 && (
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">{t('calories')}</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-300 text-xs">{calNum}</span>
                    <span className="text-emerald-600">{Math.round(calNum * scaleRatio)} kcal</span>
                  </div>
                </div>
              )}
              {scaledIngredients.length === 0 && calNum === 0 && (
                <p className="text-xs text-slate-400 font-medium">{t('scale_no_data')}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled
          title={t('scale_apply_soon')}
          className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed"
        >
          {t('apply_scale')}
        </button>
      </div>
    </div>
  );
}
