import React from 'react';
import { ArrowLeft, Save, Edit3, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';

interface RecipeCreateProps {
  onCancel: () => void;
}

export default function RecipeCreate({ onCancel }: RecipeCreateProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={onCancel} className="text-slate-500 hover:text-emerald-600 text-sm flex items-center gap-1 mb-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Create New Recipe</h2>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-semibold">Save Draft</button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold">
            <Save className="w-5 h-5" />
            Save Recipe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-500" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipe Title</label>
                <input className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm" placeholder="e.g. Mediterranean Quinoa Bowl" type="text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                    <option>Lunch/Dinner</option>
                    <option>Breakfast</option>
                    <option>Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prep Time (min)</label>
                  <input className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm" type="number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipe Image</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <ImageIcon className="w-10 h-10 text-emerald-500 mb-3" />
                  <span className="text-sm font-medium text-slate-600">Click to upload or drag and drop</span>
                  <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
