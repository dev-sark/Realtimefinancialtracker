package com.finance.tracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class PriceService {

    private static final String COINCAP_BASE_URL = "https://api.coincap.io/v2/assets";
    private static final List<String> CRYPTOCURRENCIES = Arrays.asList("bitcoin", "ethereum", "solana", "cardano", "polkadot", "ripple");
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    @Qualifier("taskExecutor")
    private Executor taskExecutor;

    @Scheduled(fixedRate = 5000)
    @Async("taskExecutor")
    public CompletableFuture<Void> broadcastAllPrices() {
        try {
            // Fetch all crypto prices in one call
            String url = COINCAP_BASE_URL + "?ids=" + String.join(",", CRYPTOCURRENCIES);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("data")) {
                List<Map<String, Object>> cryptoData = (List<Map<String, Object>>) response.get("data");
                
                for (Map<String, Object> crypto : cryptoData) {
                    String symbol = (String) crypto.get("symbol");
                    String price = (String) crypto.get("priceUsd");
                    String changePercent24Hr = (String) crypto.get("changePercent24Hr");
                    
                    // Push each crypto price to frontend via WebSocket
                    messagingTemplate.convertAndSend("/topic/prices", Map.of(
                        "symbol", symbol,
                        "price", price,
                        "changePercent24Hr", changePercent24Hr != null ? changePercent24Hr : "0.00"
                    ));
                    
                    System.out.println("Broadcasted " + symbol + " price: $" + price);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching crypto prices: " + e.getMessage());
            // Send mock data as fallback
            broadcastMockPrices();
        }
        return CompletableFuture.completedFuture(null);
    }

    private void broadcastMockPrices() {
        System.out.println("Using mock price data due to API unavailability...");
        
        // Mock price data for demonstration
        Map<String, Map<String, String>> mockPrices = Map.of(
            "BTC", Map.of("price", "43250.67", "changePercent24Hr", "2.34"),
            "ETH", Map.of("price", "2280.45", "changePercent24Hr", "-1.23"),
            "SOL", Map.of("price", "98.76", "changePercent24Hr", "5.67"),
            "ADA", Map.of("price", "0.58", "changePercent24Hr", "-0.45"),
            "DOT", Map.of("price", "7.89", "changePercent24Hr", "3.21"),
            "XRP", Map.of("price", "0.62", "changePercent24Hr", "1.89")
        );

        mockPrices.forEach((symbol, data) -> {
            messagingTemplate.convertAndSend("/topic/prices", Map.of(
                "symbol", symbol,
                "price", data.get("price"),
                "changePercent24Hr", data.get("changePercent24Hr")
            ));
            System.out.println("Broadcasted mock " + symbol + " price: $" + data.get("price"));
        });
    }
}
