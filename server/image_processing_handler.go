package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"os/exec"
)

func (cfg *apiConfig) imageProcessingHandler(w http.ResponseWriter, r *http.Request) {
	cfg.fileServerHits++

	// Parse the multipart
	err := r.ParseMultipartForm(10 << 20) // 10 MB max memory
	if err != nil {
		http.Error(w, "Error parsing multipart form: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Retrieve the file from form data
	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error retrieving the file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create a temporary file within our temp-images directory that follows a particular naming pattern
	tempDir := "./temp-images"
	os.MkdirAll(tempDir, os.ModePerm)
	tempFile, err := os.CreateTemp(tempDir, "upload-*.png")
	if err != nil {
		http.Error(w, "Error creating temporary file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	// Write the uploaded file to the temporary file
	_, err = io.Copy(tempFile, file)
	if err != nil {
		http.Error(w, "Error saving the file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Execute Tesseract command-line tool
	cmd := exec.Command("tesseract", tempFile.Name(), "stdout", "--psm", "6", "--oem", "3", "-l", "eng")
	// Capture the output
	var out bytes.Buffer
	var errBuff bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errBuff

	// Run the command
	err = cmd.Run()
	if err != nil {
		http.Error(w, "Error executing Tesseract: "+errBuff.String(), http.StatusInternalServerError)
		return
	}

	// Get the OCR result
	text := out.String()

	// Return the extracted text as JSON
	response := map[string]string{
		"text": text,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
