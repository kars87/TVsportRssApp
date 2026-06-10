import { Hourglass } from 'lucide-react';
import type { LiveEvent } from '../Types';
import TV2Logo from './TV2Logo';

interface EventCardProps {
  event: LiveEvent;
}

export default function EventCard({ event }: EventCardProps) {
  // Sjekker om det er en nyhet eller kampstart for å gi riktig fargeprofil
  const isHighlight = 
    event.type.toUpperCase() === 'NYHETER' || 
    event.type.toUpperCase() === 'MATCH_START';

  // Dynamiske Tailwind-klasser basert på typen
  const bgClass = isHighlight 
    ? 'bg-zinc-900/60 border-zinc-800 hover:border-[#ff5722]/50 hover:bg-zinc-900/90 text-[#ff5722]' 
    : 'bg-zinc-900 border-zinc-700 text-zinc-400';

  return (
    <a 
      href={event.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block no-underline"
    >
      <article className={`p-4 rounded-xl border flex items-start space-x-4 transition-all duration-300 animate-fade-in cursor-pointer ${bgClass}`}>
        
        {/* Viser bilde hvis det finnes i eventet, ellers faller den tilbake på ikon */}
        {event.imageUrl ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-800">
            <img 
              src={event.imageUrl} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy" 
            />
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0 flex items-center justify-center" aria-hidden="true">
            {isHighlight ? <TV2Logo className="w-5 h-5" /> : <Hourglass className="w-5 h-5" />}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <header className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              {event.type.replace('_', ' ')}
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