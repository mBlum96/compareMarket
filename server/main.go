package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-chi/chi/v5"
)

type apiConfig struct {
	fileServerHits int
}

func main() {
	logFile, err := os.OpenFile("log.txt", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		fmt.Println("Error opening log file")
		return
	}
	defer logFile.Close()
	log.SetOutput(logFile)

	dbg := flag.Bool("debug", false, "Enable debug mode")
	flag.Parse()

	if *dbg {
		sigs := make(chan os.Signal, 1)
		signal.Notify(sigs, os.Interrupt, syscall.SIGTERM)

		go func() {
			sig := <-sigs
			fmt.Println()
			fmt.Println(sig)
			fmt.Println("Exiting debug mode")
			os.Exit(0)
		}()
	}

	appRouter := chi.NewRouter()
	apiRouter := chi.NewRouter()
	adminRouter := chi.NewRouter()

	apiCfg := &apiConfig{
		fileServerHits: 0,
	}

	appRouter.Mount("/api", apiRouter)
	appRouter.Mount("/admin", adminRouter)
	//add middleware here later on
	//add code  for the admin router to get the metrics here later on
	apiRouter.Handle("/reset", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiCfg.fileServerHits = 0
		w.WriteHeader(http.StatusOK)
	}))

	apiRouter.Post("/sendImageToProcess", http.HandlerFunc(apiCfg.imageProcessingHandler))
	apiRouter.Post("/checkWalmart", http.HandlerFunc(apiCfg.fetchProductDetailsHandler))

	server := http.Server{
		Addr:    ":8080",
		Handler: appRouter,
	}
	server.ListenAndServe()
}
