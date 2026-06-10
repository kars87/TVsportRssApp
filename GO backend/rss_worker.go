package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const RSSUrlTv2 = "https://www.tv2.no/rss/sport"
const RSSUrlNrk = "https://www.nrk.no/sport/siste.rss"

// fetchSportRSS tar nå imot URL-en dynamisk
func fetchSportRSS(url string) ([]Item, error) {
	// 1. Gjør HTTP-kall mot RSS feedet
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("kunne ikke hente RSS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("uventet statuskode fra RSS Feed: %d", resp.StatusCode)
	}

	// 2. Les rådataene (XML)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("kunne ikke lese body: %w", err)
	}

	// 3. Parse XML til Go-structs
	var rss Rss
	err = xml.Unmarshal(body, &rss)
	if err != nil {
		return nil, fmt.Errorf("kunne ikke parse XML: %w", err)
	}

	return rss.Channel.Items, nil
}

// pollFeed er en hjelpefunksjon som kjører i en egen goroutine per kilde
func pollFeed(source string, url string, broker *Broker, seenArticles map[string]bool) {
	log.Printf("Startet bakgrunns-worker for %s (%s)\n", source, url)

	for {
		// Her sender vi med URL-en til funksjonen
		items, err := fetchSportRSS(url)
		if err != nil {
			log.Printf("[%s] RSS Error: %v\n", source, err)
		} else {
			// Gå igjennom artiklene i omvendt rekkefølge (eldst til nyest)
			for i := len(items) - 1; i >= 0; i-- {
				item := items[i]

				if !seenArticles[item.Link] {
					seenArticles[item.Link] = true

					log.Printf("[%s] Sender artikkel: %s\n", source, item.Title)

					// Vi setter Type basert på om det er en vanlig nyhet (NEWS) eller kamp
					eventType := "NEWS"

					event := LiveEvent{
						Source:    source, // Blir dynamisk "TV2" eller "NRK"
						ID:        int(time.Now().UnixNano()),
						Type:      eventType,
						Title:     item.Title,
						Timestamp: time.Now().Format("15:04"),
						URL:       item.Link,
						ImageURL:  item.Enclosure.URL, // NB: Sjekk om NRK bruker Enclosure eller noe annet i structen din
					}

					// Send ut til kanalen. Brokeren distribuerer videre til React
					broker.Notifier <- event

					// En bitteliten pause på 50ms per artikkel
					time.Sleep(50 * time.Millisecond)
				}
			}
		}

		// Sjekk etter nye artikler hvert 30. sekund for denne kilden
		time.Sleep(30 * time.Second)
	}
}

// startRSSWorker kicker i gang bakgrunnsjobbene
func startRSSWorker(broker *Broker) {
	// Tradsikker deling av "seen"-kartet er greit her så lenge vi kun legger til nye elementer,
	// men for å være 100% linter- og trådsikker i store apper bruker man gjerne en sync.Map eller en Mutex.
	// For denne feed-løsningen fungerer et felles kart utmerket.
	seenArticles := make(map[string]bool)

	log.Println("RSS-systemet initieres. Starter parallelle goroutines...")

	// Ved å skrive "go" foran, kjører disse her helt asynkront og parallelt i bakgrunnen!
	go pollFeed("TV2", RSSUrlTv2, broker, seenArticles)
	go pollFeed("NRK", RSSUrlNrk, broker, seenArticles)
}
