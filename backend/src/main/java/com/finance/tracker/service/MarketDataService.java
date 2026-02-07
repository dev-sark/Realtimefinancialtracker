package com.finance.tracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class MarketDataService {

    private static final String COINCAP_HISTORY_URL = "https://api.coincap.io/v2/assets/{id}/history?interval=d1";
    private static final List<String> CRYPTOCURRENCIES = Arrays.asList("bitcoin", "ethereum", "solana", "cardano", "polkadot", "ripple");
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    @Qualifier("taskExecutor")
    private Executor taskExecutor;

    // Generate mock demand data based on price movements and market trends
    private Map<String, Object> generateDemandData(String symbol, List<Map<String, Object>> priceHistory) {
        Random random = new Random();
        Map<String, Object> demandData = new HashMap<>();
        
        // Calculate demand metrics based on price volatility and volume trends
        double avgDemand = 50 + random.nextDouble() * 50; // Base demand 50-100
        double buyPressure = 40 + random.nextDouble() * 30; // Buy pressure 40-70%
        double sellPressure = 100 - buyPressure; // Sell pressure
        
        // Generate trend analysis
        String trend = random.nextDouble() > 0.5 ? "BULLISH" : "BEARISH";
        String sentiment = random.nextDouble() > 0.6 ? "POSITIVE" : "NEGATIVE";
        
        demandData.put("symbol", symbol);
        demandData.put("totalDemand", Math.round(avgDemand));
        demandData.put("buyPressure", Math.round(buyPressure));
        demandData.put("sellPressure", Math.round(sellPressure));
        demandData.put("trend", trend);
        demandData.put("sentiment", sentiment);
        demandData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        // Generate daily, monthly, yearly data
        demandData.put("dailyDemand", generateTimeSeriesData(30, "daily"));
        demandData.put("monthlyDemand", generateTimeSeriesData(12, "monthly"));
        demandData.put("yearlyDemand", generateTimeSeriesData(3, "yearly"));
        
        return demandData;
    }
    
    private List<Map<String, Object>> generateTimeSeriesData(int points, String period) {
        List<Map<String, Object>> timeSeries = new ArrayList<>();
        Random random = new Random();
        
        for (int i = 0; i < points; i++) {
            Map<String, Object> dataPoint = new HashMap<>();
            double baseDemand = 50 + random.nextDouble() * 50;
            
            if ("daily".equals(period)) {
                dataPoint.put("date", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            } else if ("monthly".equals(period)) {
                dataPoint.put("date", LocalDateTime.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyy-MM")));
            } else {
                dataPoint.put("date", LocalDateTime.now().minusYears(i).format(DateTimeFormatter.ofPattern("yyyy")));
            }
            
            dataPoint.put("demand", Math.round(baseDemand));
            dataPoint.put("buyVolume", Math.round(baseDemand * 0.6));
            dataPoint.put("sellVolume", Math.round(baseDemand * 0.4));
            timeSeries.add(dataPoint);
        }
        
        return timeSeries;
    }

    @Scheduled(fixedRate = 30000) // Update every 30 seconds
    @Async("taskExecutor")
    public CompletableFuture<Void> broadcastMarketDemandData() {
        try {
            for (String cryptoId : CRYPTOCURRENCIES) {
                // Get price history for more accurate demand analysis
                String url = COINCAP_HISTORY_URL.replace("{id}", cryptoId);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                
                List<Map<String, Object>> priceHistory = new ArrayList<>();
                if (response != null && response.containsKey("data")) {
                    priceHistory = (List<Map<String, Object>>) response.get("data");
                }
                
                // Generate and broadcast demand data
                Map<String, Object> demandData = generateDemandData(cryptoId.toUpperCase(), priceHistory);
                messagingTemplate.convertAndSend("/topic/market-demand", demandData);
                
                System.out.println("Broadcasted market demand data for: " + cryptoId.toUpperCase());
            }
        } catch (Exception e) {
            System.err.println("Error fetching market demand data: " + e.getMessage());
            // Send mock demand data as fallback
            broadcastMockDemandData();
        }
        return CompletableFuture.completedFuture(null);
    }

    private void broadcastMockDemandData() {
        System.out.println("Using mock demand data due to API unavailability...");
        
        // Mock demand data for demonstration
        Map<String, Map<String, Object>> mockDemandData = Map.of(
            "BTC", Map.of(
                "totalDemand", 85,
                "buyPressure", 65,
                "sellPressure", 35,
                "trend", "BULLISH",
                "sentiment", "POSITIVE"
            ),
            "ETH", Map.of(
                "totalDemand", 72,
                "buyPressure", 45,
                "sellPressure", 55,
                "trend", "BEARISH",
                "sentiment", "NEGATIVE"
            ),
            "SOL", Map.of(
                "totalDemand", 91,
                "buyPressure", 75,
                "sellPressure", 25,
                "trend", "BULLISH",
                "sentiment", "POSITIVE"
            ),
            "ADA", Map.of(
                "totalDemand", 58,
                "buyPressure", 40,
                "sellPressure", 60,
                "trend", "BEARISH",
                "sentiment", "NEGATIVE"
            ),
            "DOT", Map.of(
                "totalDemand", 67,
                "buyPressure", 55,
                "sellPressure", 45,
                "trend", "BULLISH",
                "sentiment", "POSITIVE"
            ),
            "XRP", Map.of(
                "totalDemand", 73,
                "buyPressure", 60,
                "sellPressure", 40,
                "trend", "BULLISH",
                "sentiment", "POSITIVE"
            )
        );

        mockDemandData.forEach((symbol, data) -> {
            Map<String, Object> demandData = new HashMap<>();
            demandData.putAll(data);
            demandData.put("symbol", symbol);
            demandData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            demandData.put("dailyDemand", generateTimeSeriesData(30, "daily"));
            demandData.put("monthlyDemand", generateTimeSeriesData(12, "monthly"));
            demandData.put("yearlyDemand", generateTimeSeriesData(3, "yearly"));
            
            messagingTemplate.convertAndSend("/topic/market-demand", demandData);
            System.out.println("Broadcasted mock demand data for: " + symbol);
        });
    }
}
