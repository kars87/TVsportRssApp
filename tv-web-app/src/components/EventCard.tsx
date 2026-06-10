import { Hourglass } from 'lucide-react';
import type { LiveEvent } from '../Types';
import TV2Logo from './TV2Logo';
import NRKLogo from './NrkLogo'; // <-- Importer den nye logoen

interface EventCardProps {
  event: LiveEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const isHighlight = event.type.toUpperCase() === 'NEWS' || event.type.toUpperCase() === 'MATCH_START';
  const source = event.source?.toUpperCase();

  // 1. Bestem fargeprofil basert på kilde
  
  let bgClass = 'bg-zinc-900 border-zinc-700';
  let badgeColor = 'text-[#ff5722]';

  if (isHighlight) {
    if (source === 'TV2') {
      bgClass = 'bg-zinc-900/60 border-zinc-800 hover:border-[#ff5722]/50 hover:bg-zinc-900/90';
      badgeColor = 'text-[#ff5722]';
    } else if (source === 'NRK') {
      bgClass = 'bg-zinc-900/60 border-zinc-800 hover:border-[#0080c4]/50 hover:bg-zinc-900/90';
      badgeColor = 'text-[#0080c4]'; // NRK Blå
    }
  }

  // 2. Velg riktig logo-komponent
  const getLogo = (sizeClass = "w-5 h-5") => {
    if (source === 'TV2') return <TV2Logo className={sizeClass} />;
    if (source === 'NRK') return <NRKLogo className={sizeClass} />;
    return <Hourglass className={sizeClass} />;
  };

  return (
    <a 
      href={event.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block no-underline"
    >
      <article className={`p-4 rounded-xl border flex items-start space-x-4 transition-all duration-300 animate-fade-in cursor-pointer ${bgClass}`}>
        
        {/* Mediacontainer */}
        <div className="shrink-0">
          {event.imageUrl ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-800">
              <img 
                src={event.imageUrl} 
                alt="" 
                className="w-full h-full object-cover"
                loading="lazy" 
              />
              {isHighlight && (
                <div className={`absolute bottom-1 right-1 bg-zinc-950/80 p-1 rounded backdrop-blur-sm ${badgeColor}`}>
                  {getLogo("w-3 h-3")}
                </div>
              )}
            </div>
          ) : (
            <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 w-10 h-10 flex items-center justify-center ${badgeColor}`} aria-hidden="true">
              {getLogo("w-5 h-5")}
            </div>
          )}
        </div>
        
        {/* Tekstinnhold */}
        <div className="flex-1 min-w-0">
          <header className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
              {source || 'EVENT'} – {event.type.replace('_', ' ')}
            </span>
            <time className="text-xs text-zinc-500 font-mono" dateTime={event.timestamp}>
              {event.timestamp}
            </time>
          </header>
          
          <p className="text-zinc-200 text-sm md:text-base font-medium hover:text-white transition-colors line-clamp-2 mt-1">
            {event.title}
          </p>
        </div>
      </article>
    </a>
  );
}