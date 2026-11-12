'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PanelSettings, UsersSummary, errorMessage, settingsService } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { AlertCircle, BrainCircuit, CheckCircle2, Mail, Users } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PanelSettings | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [users, setUsers] = useState<UsersSummary | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState<keyof PanelSettings | null>(null);

  useEffect(() => {
    Promise.all([settingsService.get(), settingsService.users()])
      .then(([s, u]) => {
        setSettings(s.settings);
        setEmailEnabled(s.emailEnabled);
        setUsers(u);
      })
      .catch((err) => setNotice({ ok: false, text: errorMessage(err) }));
  }, []);

  // Cada cambio se guarda al momento
  const save = async <K extends keyof PanelSettings>(key: K, value: PanelSettings[K]) => {
    if (!settings) return;
    const before = settings;
    setSettings({ ...settings, [key]: value });
    setSaving(key);
    try {
      setSettings(await settingsService.update({ [key]: value }));
      setNotice({ ok: true, text: 'Configuración guardada.' });
    } catch (err) {
      setSettings(before);
      setNotice({ ok: false, text: errorMessage(err) });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Configuración" subtitle="Parámetros de optimización con IA, reglas de automatización y usuarios" />

      <div className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">
        {notice && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${notice.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {notice.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notice.text}</span>
          </div>
        )}

        {settings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parámetros de la IA */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-emerald-600" /> Optimización con IA (K-Means)</h3>
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>
                  <span className="font-semibold text-slate-800 block">K máximo en la elección automática</span>
                  <span className="text-xs text-slate-500">Con «Automático (IA)» se prueba K desde 2 hasta este valor y se usa el de mayor silueta.</span>
                </span>
                <select
                  value={settings.clusters_k_max}
                  disabled={saving !== null}
                  onChange={(e) => save('clusters_k_max', Number(e.target.value))}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold"
                >
                  {Array.from({ length: 14 }, (_, i) => i + 2).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </label>
              <Toggle
                label="Ponderar por carga estimada"
                help="Los reportes de camión completo pesan más que los de una bolsa al ubicar los centros de las zonas."
                checked={settings.clusters_weighted}
                disabled={saving !== null}
                onChange={(v) => save('clusters_weighted', v)}
              />
              <p className="text-[11px] text-slate-400">Se aplican en la próxima ejecución de «Optimizar rutas con IA».</p>
            </section>

            {/* Reglas de automatización */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" /> Reglas de automatización</h3>
              <Toggle
                label="Avisar al vecino por correo cuando se resuelva su reporte"
                help="Además del aviso en la app, que siempre se envía."
                checked={settings.notify_email_on_resolved}
                disabled={saving !== null}
                onChange={(v) => save('notify_email_on_resolved', v)}
              />
              <Toggle
                label="Enviar correo de bienvenida al crear una cuenta"
                checked={settings.welcome_email}
                disabled={saving !== null}
                onChange={(v) => save('welcome_email', v)}
              />
              <p className={`text-[11px] ${emailEnabled ? 'text-emerald-700' : 'text-amber-700'}`}>
                {emailEnabled ? 'Servidor de correo configurado.' : 'El servidor de correo no está configurado (SMTP_HOST en backend/.env): los correos solo se muestran en la consola.'}
              </p>
            </section>
          </div>
        )}

        {/* Usuarios */}
        {users && (
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600" /> Usuarios y roles</h3>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Equipo municipal (acceso al panel)</p>
              {users.team.length === 0 ? (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  Aún no hay cuentas del equipo municipal. El inicio de sesión del panel, los roles (administrador, inspector, conductor) y la invitación de usuarios corresponden a la US-10 (Sprint 3).
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {users.team.map((u) => (
                    <li key={u.id} className="py-2 flex justify-between"><span className="font-semibold text-slate-800">{u.full_name}</span><span className="text-slate-500">{u.email}</span></li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Tile label="Vecinos registrados" value={users.citizens.total} />
              <Tile label="Nuevos en 30 días" value={users.citizens.last_30_days} />
              <Tile label="Con al menos un reporte" value={users.citizens.with_reports} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Últimos vecinos registrados</p>
              <table className="w-full text-xs">
                <thead className="text-slate-500 text-left">
                  <tr><th className="py-1.5">Nombre</th><th>Distrito</th><th className="text-right">Reportes</th><th className="text-right">Registro</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.recent.map((u) => (
                    <tr key={u.id}>
                      <td className="py-1.5 font-semibold text-slate-800">{u.full_name}</td>
                      <td className="capitalize">{u.distrito.toLowerCase()}</td>
                      <td className="text-right">{u.reports}</td>
                      <td className="text-right">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-slate-400 mt-2">Por privacidad, el panel no muestra el correo de los vecinos.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const Toggle: React.FC<{ label: string; help?: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }> = ({ label, help, checked, disabled, onChange }) => (
  <label className="flex items-center justify-between gap-4 text-sm cursor-pointer">
    <span>
      <span className="font-semibold text-slate-800 block">{label}</span>
      {help && <span className="text-xs text-slate-500">{help}</span>}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-60 ${checked ? 'bg-emerald-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </label>
);

const Tile: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <p className="text-[11px] text-slate-500">{label}</p>
    <p className="text-xl font-bold text-slate-900">{value}</p>
  </div>
);
