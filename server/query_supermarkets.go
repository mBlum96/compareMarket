package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

const apiKey = ""                                       // Replace with your actual API key
const apiURL = "https://data.unwrangle.com/api/getter/" // Correct endpoint

type Product struct {
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func (cfg *apiConfig) fetchProductDetailsHandler(w http.ResponseWriter, r *http.Request, shop string) {
	fmt.Println("fetchProductDetailsHandler called") // Debugging

	// Read the request body
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		fmt.Printf("Failed to read request body: %v\n", err) // Debugging
		return
	}
	fmt.Printf("Request body: %s\n", string(bodyBytes)) // Debugging

	var reqBody struct {
		Texts []string `json:"texts"`
	}
	var singleText struct {
		Text string `json:"text"`
	}

	// Try to unmarshal as an array of texts
	if err := json.Unmarshal(bodyBytes, &singleText); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		fmt.Printf("Failed to parse request body: %v\n", err) // Debugging
		return
	}
	reqBody.Texts = strings.Split(singleText.Text, "\n")
	fmt.Printf("Parsed texts: %+v\n", reqBody.Texts) // Debugging

	var results []Product
	for _, text := range reqBody.Texts {
		if text == "" {
			fmt.Println("Skipping empty text") // Debugging
			continue
		}
		fmt.Printf("Processing text: %s\n", text) // Debugging
		product, err := fetchProductDetails(text, shop)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to fetch product details: %v", err), http.StatusInternalServerError)
			return
		}
		results = append(results, *product)
	}

	fmt.Printf("Products: %+v\n", results) // Debugging

	// Respond with the aggregated product details in JSON format
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
	}
}

func fetchProductDetails(searchTerm string, shop string) (*Product, error) {
	fmt.Println("got here") // Debugging
	client := &http.Client{}
	var reqURL string
	if shop == "walmart" {
		reqURL = fmt.Sprintf("%s?platform=walmart_search&search=%s&page=1&api_key=%s", apiURL, url.QueryEscape(searchTerm), apiKey)
	} else {
		//currently supporting target and walmart only
		reqURL = fmt.Sprintf("%s?platform=target_search&search=%s&page=1&api_key=%s", apiURL, url.QueryEscape(searchTerm), apiKey)
	}
	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	fmt.Println("API Request:", req.URL) // Debugging

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error: %s, Response: %s", resp.Status, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	fmt.Printf("API Response: %s\n", string(body)) // Debugging

	var result struct {
		Results []Product `json:"results"`
	}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, fmt.Errorf("JSON parse error: %v, Raw Body: %s", err, string(body))
	}

	if len(result.Results) == 0 {
		return nil, fmt.Errorf("no products found for search term: %s", searchTerm)
	}

	return &result.Results[0], nil
}
