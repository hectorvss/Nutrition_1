import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SupplementCreateProps {
  onBack: () => void;
}

export default function SupplementCreate({ onBack }: SupplementCreateProps) {
  const { t } = useLanguage();
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 h-full overflow-y-auto p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Header & Navigation */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <button 
                onClick={onBack}
                className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2 text-sm font-bold mb-3"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {t('library_title')}
              </button>
              <h2 className="text-3xl font-bold text-slate-900">{t('create_supplement')}</h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">{t('supplement_form_desc')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all"
              >
                {t('cancel')}
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                {t('add_to_library')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8 pb-20">
              {/* Basic Information */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">edit_note</span>
                  {t('basic_information')}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('supplement_name')}</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                        placeholder={t('supplement_name_placeholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('brand_label')}</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                        placeholder={t('brand_placeholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('supplement_type')}</label>
                    <select className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all appearance-none">
                      <option value="">{t('select_type')}</option>
                      <option value="protein">{t('protein_powder')}</option>
                      <option value="vitamin">{t('vitamin_mineral')}</option>
                      <option value="pre-workout">{t('pre_workout')}</option>
                      <option value="creatine">{t('creatine')}</option>
                      <option value="amino-acids">{t('amino_acids')}</option>
                      <option value="fat-burner">{t('fat_burner')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('description_notes')}</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium min-h-[120px] transition-all"
                      placeholder={t('supplement_notes_placeholder')}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Tracking Details */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">timer</span>
                  {t('tracking_details')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('serving_size')}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        className="w-full pl-4 pr-20 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                        placeholder="1"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-tight">{t('scoop_unit')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('recommended_timing')}</label>
                    <select className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all appearance-none">
                      <option value="anytime">{t('timing_anytime')}</option>
                      <option value="morning">{t('timing_morning')}</option>
                      <option value="pre-workout">{t('timing_pre_workout')}</option>
                      <option value="intra-workout">{t('timing_intra_workout')}</option>
                      <option value="post-workout">{t('timing_post_workout')}</option>
                      <option value="bedtime">{t('timing_before_bed')}</option>
                      <option value="meal">{t('timing_with_meal')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('primary_ingredient')}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold transition-all"
                      placeholder={t('primary_ingredient_placeholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Data */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">analytics</span>
                  {t('technical_data')}
                </h3>
                <div className="space-y-5">
                  <p className="text-xs text-slate-400 font-medium">{t('values_per_serving_help')}</p>
                  {[
                    { label: t('calories'), unit: 'kcal' },
                    { label: t('protein_g'), unit: 'g' },
                    { label: t('carbs_g'), unit: 'g' },
                    { label: t('fat_g'), unit: 'g' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-600">{item.label}</span>
                      <div className="w-24">
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 text-right text-sm bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none text-slate-900 font-bold"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Rating */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">star</span>
                  {t('quality_rating')}
                </h3>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <button key={i} className="text-amber-400 hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[32px] fill-1">star</span>
                      </button>
                    ))}
                    <button className="text-slate-200 hover:text-amber-400 hover:scale-110 transition-all">
                      <span className="material-symbols-outlined text-[32px]">star</span>
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('four_out_of_five')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
