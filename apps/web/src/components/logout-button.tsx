'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* aunque falle, la UI vuelve al inicio */
    }
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-2.5 border border-line px-6 py-3 text-[10px] font-semibold tracking-[0.22em] text-ash uppercase transition-colors duration-300 hover:border-signal hover:text-signal-text active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" strokeWidth={1.8} />}
      Cerrar sesión
    </button>
  );
}
