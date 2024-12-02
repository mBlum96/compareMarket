package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
)

const apiKey = "REMOVED" // Replace with your actual API key
const apiURL = "https://data.unwrangle.com/api/getter/"   // Correct endpoint

type Product struct {
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

func (cfg *apiConfig) fetchProductDetailsHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("fetchProductDetailsHandler called") // Debugging
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		fmt.Printf("Failed to read request body: %v\n", err) // Debugging
		return
	}
	var reqBody struct {
		Text string `json:"text"`
	}
	if err := json.Unmarshal(bodyBytes, &reqBody); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		fmt.Printf("Failed to parse request body: %v\n", err) // Debugging
		return
	}
	// bodyBytes, err := io.ReadAll(r.Body)
	// if err != nil {
	// 	http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
	// 	fmt.Printf("Failed to read request body: %v\n", err) // Debugging
	// 	return
	// }
	// fmt.Printf("request body: %v\n", bodyBytes) // Debugging
	// Parse the UPC from the POST request body
	product, err := fetchProductDetails(reqBody.Text)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch product details: %v", err), http.StatusInternalServerError)
		return
	}

	// Respond with the product details in JSON format
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(product); err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
	}
}

func fetchProductDetails(searchTerm string) (*Product, error) {
	fmt.Println("got here") // Debugging
	client := &http.Client{}
	reqURL := fmt.Sprintf("%s?platform=walmart_search&search=%s&page=1&api_key=%s", apiURL, url.QueryEscape(searchTerm), apiKey)
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
		body, _ := ioutil.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error: %s, Response: %s", resp.Status, string(body))
	}

	body, err := ioutil.ReadAll(resp.Body)
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

func prepareDataForQuery(searchTerm string) string {
	return ""
}
