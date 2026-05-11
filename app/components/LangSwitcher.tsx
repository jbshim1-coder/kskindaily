'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, LANG_LABELS, isLocale } from '../lib/locales';

export default function LangSwitcher({ color }: { color: string }) {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  const currentLocale = parts.length > 0 && isLocale(parts[0]) ? parts[0] : 'en';
  const rest = isLocale(parts[0] ?? '') ? parts.slice(1).join('/') : parts.join('/');

  return (
    <div className="flex gap-1 flex-wrap">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={rest ? `/${l}/${rest}` : `/${l}`}
          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
            l === currentLocale
              ? 'text-white border-transparent'
              : 'text-gray-400 border-gray-200 hover:border-gray-400'
          }`}
          style={l === currentLocale ? { backgroundColor: color } : {}}
        >
          {LANG_LABELS[l]}
        </Link>
      ))}
    </div>
  );
}
