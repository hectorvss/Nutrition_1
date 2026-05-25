import React, { useEffect, useState } from 'react';
import { X, Award, GraduationCap, Globe, Languages, Sparkles, Mail, MapPin, Briefcase, Star, Linkedin, Twitter, Instagram } from 'lucide-react';
import { fetchWithAuth } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

interface CoachProfile {
  user_id: string;
  email?: string | null;
  full_name?: string | null;
  professional_title?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  years_experience?: number | null;
  specialties?: string[];
  certifications?: string[];
  education?: string | null;
  languages_spoken?: string[];
  philosophy?: string | null;
  website_url?: string | null;
  achievements?: string[];
  services_offered?: string[];
  linkedin_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Read-only popup the client opens from the chat header ("Ver perfil del
 * coach"). Renders every public field the manager has filled in their
 * Settings → Profile page. Hides the sections that have no data so the
 * modal stays compact when the coach hasn't filled out the extended info
 * yet.
 */
export default function CoachProfileModal({ open, onClose }: Props) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await fetchWithAuth('/client/coach-profile');
        if (!mounted) return;
        setProfile(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || t('error_loading_data'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  if (!open) return null;

  const arr = (v?: string[] | null) => Array.isArray(v) ? v.filter(Boolean) : [];

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean header — no gradient banner; matches the rest of the client
            portal's understated card aesthetic. */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 ring-2 ring-emerald-500/15 flex items-center justify-center text-xl font-bold text-slate-400">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (profile?.full_name?.charAt(0) || 'C').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">
              {t('your_coach', { defaultValue: 'Tu coach' })}
            </p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate leading-tight">
              {profile?.full_name || t('your_coach')}
            </h1>
            {profile?.professional_title && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {profile.professional_title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t('close', { defaultValue: 'Cerrar' })}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading && (
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && profile && (
            <>
              {profile.bio && (
                <Section title={t('about_me', { defaultValue: 'Sobre mí' })}>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{profile.bio}</p>
                </Section>
              )}

              {/* Quick stats row */}
              {(profile.years_experience != null || arr(profile.languages_spoken).length > 0 || profile.website_url) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {profile.years_experience != null && (
                    <Stat icon={Briefcase} label={t('experience', { defaultValue: 'Experiencia' })} value={t('years_count', { count: profile.years_experience, defaultValue: `${profile.years_experience} años` })} />
                  )}
                  {arr(profile.languages_spoken).length > 0 && (
                    <Stat icon={Languages} label={t('languages_spoken', { defaultValue: 'Idiomas' })} value={arr(profile.languages_spoken).join(' • ')} />
                  )}
                  {profile.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="block">
                      <Stat icon={Globe} label={t('website', { defaultValue: 'Web' })} value={profile.website_url.replace(/^https?:\/\//, '')} clickable />
                    </a>
                  )}
                </div>
              )}

              {arr(profile.specialties).length > 0 && (
                <Section title={t('specialties', { defaultValue: 'Especialidades' })} icon={Sparkles}>
                  <ChipList items={arr(profile.specialties)} />
                </Section>
              )}

              {arr(profile.services_offered).length > 0 && (
                <Section title={t('services_offered', { defaultValue: 'Servicios' })} icon={Star}>
                  <ChipList items={arr(profile.services_offered)} variant="emerald" />
                </Section>
              )}

              {arr(profile.certifications).length > 0 && (
                <Section title={t('certifications', { defaultValue: 'Certificaciones' })} icon={Award}>
                  <ul className="space-y-1.5">
                    {arr(profile.certifications).map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {profile.education && (
                <Section title={t('education', { defaultValue: 'Formación' })} icon={GraduationCap}>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{profile.education}</p>
                </Section>
              )}

              {arr(profile.achievements).length > 0 && (
                <Section title={t('achievements', { defaultValue: 'Logros' })} icon={Award}>
                  <ul className="space-y-1.5">
                    {arr(profile.achievements).map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <span className="material-symbols-outlined text-[14px] text-amber-500 mt-0.5">emoji_events</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {profile.philosophy && (
                <Section title={t('philosophy', { defaultValue: 'Filosofía' })}>
                  <p className="text-sm italic text-slate-600 dark:text-slate-300 border-l-4 border-[#17cf54] pl-4 leading-relaxed">{profile.philosophy}</p>
                </Section>
              )}

              {/* Contact */}
              {(profile.email || profile.linkedin_url || profile.twitter_url || profile.instagram_url) && (
                <Section title={t('contact', { defaultValue: 'Contacto' })}>
                  <div className="flex flex-wrap gap-2">
                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                        <Mail className="w-4 h-4" /> {profile.email}
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                        <Twitter className="w-4 h-4" /> Twitter
                      </a>
                    )}
                    {profile.instagram_url && (
                      <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 transition-colors">
                        <Instagram className="w-4 h-4" /> Instagram
                      </a>
                    )}
                  </div>
                </Section>
              )}

              {!profile.bio && !profile.years_experience && arr(profile.specialties).length === 0 && arr(profile.certifications).length === 0 && !profile.education && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {t('coach_profile_empty', { defaultValue: 'Tu coach aún no ha completado su perfil.' })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-[#17cf54]" />}
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, value, clickable }: { icon: any; label: string; value: string; clickable?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 ${clickable ? 'hover:border-[#17cf54]/40 transition-colors' : ''}`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  );
}

function ChipList({ items, variant = 'slate' }: { items: string[]; variant?: 'slate' | 'emerald' }) {
  const cls = variant === 'emerald'
    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700';
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s, i) => (
        <span key={i} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${cls}`}>{s}</span>
      ))}
    </div>
  );
}
