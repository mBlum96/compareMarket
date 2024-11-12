package main

import (
	"net/http"
)

func (cfg *apiConfig) imageProcessingHandler(w http.ResponseWriter, r *http.Request) {
	cfg.fileServerHits++
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Image processing"))
}
