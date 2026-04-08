import React from 'react';
import { ArrowLeft, Save, Edit3, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RecipeCreateProps {
  onCancel: () => void;
}

export default function RecipeCreate({ onCancel }: RecipeCreateProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={onCancel} className="text-slate-500 hover:text-emerald-600 text-sm flex items-center gap-1 mb-1">
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_library')}
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{t('create_new_recipe')}</h2>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold">{t('save_draft')}</button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold">
            <Save className="w-5 h-5" />
            {t('save_recipe')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" />
                {t('basic_information')}
              </h3>
              <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('recipe_title')}</label>
                <input className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder={t('recipe_title_placeholder')} type="text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
                  <select className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                    <option>{t('category_lunch_dinner')}</option>
                    <option>{t('category_breakfast')}</option>
                    <option>{t('category_snack')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('prep_time_min')}</label>
                  <input className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm" type="number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('recipe_image')}</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <ImageIcon className="w-10 h-10 text-emerald-500 mb-3" />
                  <span className="text-sm font-medium text-slate-600">{t('click_upload_drag_drop')}</span>
                  <span className="text-xs text-slate-400 mt-1">{t('image_format_hint')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
