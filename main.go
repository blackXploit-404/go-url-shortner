package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
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
		ShortURL: "http://" + r.Host + "/redirect/" + shortURL,
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("some error occured", err)

	}
}
func redirectUrlHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/redirect/"):]
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
	http.HandleFunc("/redirect/", redirectUrlHandler)
	fmt.Println("starting server on PORT 3000...")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		fmt.Println("error on starting the http server", err)
	}

}
