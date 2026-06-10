
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import type { LiveEvent } from './Types';
import EventCard from './components/EventCard';

export default function App() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080/api/live-events');

    eventSource.onopen = () => setIsConnected(true);
    
    eventSource.onmessage = (event) => {
      try {
        const newEvent: LiveEvent = JSON.parse(event.data);
        setEvents((prevEvents) => [newEvent, ...prevEvents]);
      } catch (error) {
        console.error("Feil ved parsing av JSON:", error);
      }
    };

    eventSource.onerror = () => setIsConnected(false);

    return () => eventSource.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#121215] border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-[#ff5722] text-white font-black px-3 py-1.5 rounded text-xl tracking-wider">
            Sports
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-400 hidden sm:inline">
            Live Events
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-zinc-300">
            {isConnected ? 'Tilkoblet stream' : 'Kobler til...'}
          </span>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        

        {/* Høyre kolonne: Ekte Live Feed */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Siste sportsbegivenheter
          </h2>

          {events.length === 0 ? (
            <div className="bg-[#121215] border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
              Venter på første event fra Go-backenden...
            </div>
          ) : (
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}