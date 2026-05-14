package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	//"github.com/mattn/go-sqlite3"
)

type URL struct {
	ID           string    `json:"id"`
	OriginalUrl  string    `json:"originalurl"`
	ShortUrl     string    `json:"shorturl"`
	CreationDate time.Time `json:"creationdate"`
}

var urlDB = make(map[string]URL)

func GenerateShortUrl(originalurl string) string {
	// hasher := md5.New()
	// hasher.Write([]byte(originalurl))
	// //fmt.Println("hasher",hasher)
	// data := hasher.Sum(nil)
	// //fmt.Println("hasher data",data)
	// hash := hex.EncodeToString(data)
	return uuid.New().String()[:8]
	// fmt.Println("After EncodetoString :", hash)
	// fmt.Println("final string :", hash[:8])

	//id := uuid.New().string()
	//return id[:8] // if we use 5 or 4 then there is a high probability the string is being repeated.
}

func createUrl(OriginalUrl string) string {
	ShortURL := GenerateShortUrl(OriginalUrl)
	id := ShortURL
	urlDB[id] = URL{
		ID:           id,
		OriginalUrl:  OriginalUrl,
		ShortUrl:     ShortURL,
		CreationDate: time.Now(),
	}
	return ShortURL
}
func getURL(id string) (URL, error) {
	url, ok := urlDB[id]
	if !ok {
		return URL{}, errors.New("url not found")
	}
	return url, nil
}
func buildPublicBaseURL(r *http.Request) string {
	if v := strings.TrimSpace(os.Getenv("PUBLIC_BASE_URL")); v != "" {
		return strings.TrimRight(v, "/")
	}
	scheme := "http"
	if r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	return scheme + "://" + r.Host
}

func RootPageUrl(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World")

}
func shortUrlHandler(w http.ResponseWriter, r *http.Request) {
	var data struct {
		URL string `json:"url"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid Request Body", http.StatusBadRequest)
		return
	}
	shortURL := createUrl(data.URL)
	// fmt.Fprintf(w ,shortURL,data)

	response := struct {
		ShortURL string `json:"short_url"`
	}{
		ShortURL: buildPublicBaseURL(r) + "/r/" + shortURL,
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("some error occured", err)

	}
}
func redirectUrlHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/r/"):]
	url, err := getURL(id)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusNotFound)
		return
	}
	http.Redirect(w, r, url.OriginalUrl, http.StatusFound)
}
func main() {
	//fmt.Println("url-shortner service started !")
	//OriginalUrl := "https://github.com/blackXploit-404"
	//GenerateShortUrl(OriginalUrl)

	// in order to handle the urls , register the handler fucntion to handle all requests to the root url ("/")
	// create http server
	//http.HandleFunc("/", RootPageUrl)
	http.HandleFunc("/shorten", shortUrlHandler)
	http.HandleFunc("/r/", redirectUrlHandler)

	if os.Getenv("SERVE_FRONTEND") == "true" {
		distDir := os.Getenv("FRONTEND_DIST")
		if distDir == "" {
			distDir = "./frontend/dist"
		}
		http.Handle("/", http.FileServer(http.Dir(distDir)))
		fmt.Println("serving frontend from", distDir)
	} else {
		fmt.Println("SERVE_FRONTEND not enabled; skipping static file handler")
	}

	// Use PORT from environment (Render provides it). Default to 3000 for local dev.
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	fmt.Println("starting server on PORT", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("error on starting the http server", err)
	}

}
