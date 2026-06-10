package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"log"
	"net/http"
	"sync"
)

type LiveEvent struct {
	Source    string `json:"source"`
	ID        int    `json:"id"`
	Type      string `json:"type"`
	Title     string `json:"title"`
	Timestamp string `json:"timestamp"`
	URL       string `json:"url"`
	ImageURL  string `json:"imageUrl"`
}

// Broker håndterer alle aktive SSE-klienttilkoblinger
type Broker struct {
	clients    map[chan LiveEvent]bool
	newClients chan chan LiveEvent
	defClients chan chan LiveEvent
	Notifier   chan LiveEvent
	mutex      sync.Mutex
	Cache      []LiveEvent // Cache for å lagre de siste nyhetsartiklene fra RSS
}

// Rss representerer rot-taggen i RSS-feeden
type Rss struct {
	XMLName xml.Name `xml:"rss"`
	Channel Channel  `xml:"channel"`
}

// Channel inneholder metadata og listen over artikler
type Channel struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	Items       []Item `xml:"item"`
}

// Item = Nyhetsartikkelen fra RSS-feeden
type Item struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate"`
	Category    string `xml:"category"`
	Enclosure   struct {
		URL string `xml:"url,attr"`
	} `xml:"enclosure"`
}

func main() {
	broker := &Broker{
		clients:    make(map[chan LiveEvent]bool),
		newClients: make(chan chan LiveEvent),
		defClients: make(chan chan LiveEvent),
		Notifier:   make(chan LiveEvent),
	}
	go startRSSWorker(broker)
	// Start brokeren i en egen tråd (Goroutine)
	go broker.listen()

	// API Endepunkt som React og Mobil-App kobler seg til
	http.HandleFunc("/api/live-events", broker.serveHTTP)

	log.Println("Server startet på http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

// serveHTTP oppretter en vedvarende tilkobling til klienten (SSE)
// serveHTTP oppretter en vedvarende tilkobling til klienten (SSE)
func (b *Broker) serveHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Hver klient får sin egen kanal
	clientChan := make(chan LiveEvent)
	b.newClients <- clientChan

	// --- SIKRERE CACHE-LESING ---
	// Låser, kopierer cachen kjapt til en lokal variabel, og låser opp med en gang.
	// Dette forhindrer at man låser hele serveren mens vi skriver til nettverket.
	b.mutex.Lock()
	currentCache := make([]LiveEvent, len(b.Cache))
	copy(currentCache, b.Cache)
	b.mutex.Unlock()

	// Nå kan vi trygt sende de gamle hendelsene uten å holde på mutexen
	for _, oldEvent := range currentCache {
		jsonData, _ := json.Marshal(oldEvent)
		fmt.Fprintf(w, "data: %s\n\n", jsonData)
	}
	w.(http.Flusher).Flush()
	// -----------------------------

	defer func() {
		b.defClients <- clientChan
	}()

	for {
		select {
		case event := <-clientChan:
			jsonData, _ := json.Marshal(event)
			fmt.Fprintf(w, "data: %s\n\n", jsonData)
			w.(http.Flusher).Flush()
		case <-r.Context().Done():
			return
		}
	}
}

// listen overvåker tilkoblinger, frakoblinger og videresender nye events
func (b *Broker) listen() {
	for {
		select {
		case client := <-b.newClients:
			b.mutex.Lock()
			b.clients[client] = true
			b.mutex.Unlock()
			log.Printf("Ny app koblet til. Totalt antall klienter: %d", len(b.clients))

		case client := <-b.defClients:
			b.mutex.Lock()
			if _, exists := b.clients[client]; exists {
				delete(b.clients, client)
				close(client)
			}
			b.mutex.Unlock()
			log.Printf("App koblet fra. Totalt antall klienter: %d", len(b.clients))

		case event := <-b.Notifier:
			b.mutex.Lock()
			// Legg til hendelsen i cache
			b.Cache = append(b.Cache, event)
			// holder cachen til 30 hendelser
			if len(b.Cache) > 30 {
				b.Cache = b.Cache[1:]
			}
			// Kringkast hendelsen ut til ALLE tilkoblede klient-kanaler
			for client := range b.clients {
				client <- event
			}
			b.mutex.Unlock()
		}
	}
}
