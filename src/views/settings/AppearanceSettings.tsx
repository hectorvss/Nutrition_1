import React, { useState, useEffect } from 'react';
import { Palette, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AppearanceSettings() {
  const { settings, updateTheme, isLoading } = useTheme();
  const { t } = useLanguage();

  const hexToHSL = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const [showCustom, setShowCustom] = useState(() => {
    const presets = [ '#10b981','#3b82f6','#0d9488','#8b5cf6','#f43f5e','#f59e0b','#64748b','#0f172a' ];
    return !presets.includes(settings.theme_color);
  });
  const [customColor, setCustomColor] = useState(settings.theme_color);

  useEffect(() => {
    if (showCustom && customColor !== settings.theme_color) {
      const timer = setTimeout(() => {
        updateTheme({ theme_color: customColor });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [customColor, showCustom, updateTheme, settings.theme_color]);

  if (isLoading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const presets = [
    { name: t('soft_green'), color: '#10b981' },
    { name: t('deep_blue'), color: '#3b82f6' },
    { name: t('teal'), color: '#0d9488' },
    { name: t('purple'), color: '#8b5cf6' },
    { name: t('rose'), color: '#f43f5e' },
    { name: t('amber'), color: '#f59e0b' },
    { name: t('slate'), color: '#64748b' },
    { name: t('dark'), color: '#0f172a' },
  ];

  const isPresetSelected = presets.some(p => p.color === settings.theme_color);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          border: 3px solid #ffffff;
          cursor: pointer;
          margin-top: -4px;
        }
        input[type=range]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #ffffff;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          cursor: pointer;
        }
      `}</style>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('theme_color')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('theme_color_desc')}</p>
            </div>
            {showCustom && (
              <button
                onClick={() => setShowCustom(false)}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                {t('close_custom', { defaultValue: 'Cerrar' })}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-9 gap-4 items-center">
            {presets.map((theme) => (
              <button
                key={theme.color}
                onClick={() => {
                  updateTheme({ theme_color: theme.color });
                  setCustomColor(theme.color);
                  setShowCustom(false);
                }}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`w-12 h-12 rounded-full transition-all border-4 ${
                    settings.theme_color === theme.color
                      ? 'border-white ring-2 ring-emerald-500 shadow-md scale-110'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: theme.color }}
                />
                <span className={`text-xs font-medium ${settings.theme_color === theme.color ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                  {theme.name}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="group flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${!isPresetSelected || showCustom ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500 ring-offset-2' : 'border-slate-300 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <span className={`text-xs transition-colors ${!isPresetSelected || showCustom ? 'text-emerald-600 font-bold' : 'text-slate-500 group-hover:text-emerald-500'}`}>
                {t('custom', { defaultValue: 'Personalizado' })}
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-t border-slate-100 bg-slate-50/50"
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row items-start gap-12">
                  <div className="flex flex-col items-center gap-4 shrink-0 mx-auto lg:mx-0">
                    <div
                      className="w-40 h-40 rounded-[3rem] shadow-2xl border-8 border-white transition-transform duration-500 hover:rotate-3"
                      style={{ backgroundColor: customColor }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-mono font-black text-slate-800 uppercase tracking-tighter">{customColor}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('live_preview')}</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('hex_color_code')}</label>
                          <div className="w-8 h-8 rounded-lg shadow-inner border border-slate-100" style={{ backgroundColor: customColor }} />
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold text-lg">#</span>
                          <input
                            type="text"
                            value={customColor.startsWith('#') ? customColor.substring(1).toUpperCase() : customColor.toUpperCase()}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.length <= 6 && /^[0-9A-Fa-f]*$/.test(val)) {
                                setCustomColor(`#${val}`);
                              }
                            }}
                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-mono font-bold text-xl text-slate-900 transition-all outline-none"
                            placeholder="000000"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('hue_label')}</label>
                          <span className="text-xs font-mono font-bold text-slate-400">{Math.round(hexToHSL(customColor).h)}°</span>
                        </div>
                        <input
                          type="range" min="0" max="360"
                          value={hexToHSL(customColor).h}
                          onChange={(e) => {
                            const hsl = hexToHSL(customColor);
                            setCustomColor(hslToHex(parseInt(e.target.value), hsl.s, hsl.l));
                          }}
                          className="w-full h-3 rounded-full appearance-none cursor-pointer shadow-inner"
                          style={{
                            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('saturation_label')}</label>
                          <span className="text-xs font-mono font-bold text-slate-400">{Math.round(hexToHSL(customColor).s)}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={hexToHSL(customColor).s}
                          onChange={(e) => {
                            const hsl = hexToHSL(customColor);
                            setCustomColor(hslToHex(hsl.h, parseInt(e.target.value), hsl.l));
                          }}
                          className="w-full h-3 rounded-full appearance-none cursor-pointer shadow-inner"
                          style={{
                            background: `linear-gradient(to right, #808080, ${hslToHex(hexToHSL(customColor).h, 100, 50)})`
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('brightness_label')}</label>
                          <span className="text-xs font-mono font-bold text-slate-400">{Math.round(hexToHSL(customColor).l)}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={hexToHSL(customColor).l}
                          onChange={(e) => {
                            const hsl = hexToHSL(customColor);
                            setCustomColor(hslToHex(hsl.h, hsl.s, parseInt(e.target.value)));
                          }}
                          className="w-full h-3 rounded-full appearance-none cursor-pointer shadow-inner"
                          style={{
                            background: `linear-gradient(to right, #000000, ${hslToHex(hexToHSL(customColor).h, 100, 50)}, #ffffff)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Moon className="w-5 h-5 text-slate-400" />
            {t('dark_mode')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t('appearance_desc')}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            className="sr-only peer"
            type="checkbox"
            checked={settings.dark_mode}
            onChange={() => updateTheme({ dark_mode: !settings.dark_mode })}
          />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </div>
  );
}
