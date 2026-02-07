# Real-Time Finance Tracker

A real-time Bitcoin price tracker built with Spring Boot (backend) and React (frontend) using WebSocket communication.

## Architecture

The application follows a three-phase architecture:

### Phase 1: Backend (Java Spring Boot)
- **WebSocketConfig.java**: Sets up STOMP WebSocket endpoint at `/ws-finance`
- **AppConfig.java**: Configures RestTemplate bean for API calls
- **RealtimeFinanceTrackerApplication.java**: Main Spring Boot application with scheduling enabled

### Phase 2: API Feed (Data Sourcing)
- **PriceService.java**: Fetches Bitcoin price from CoinCap API every 5 seconds
- Broadcasts price updates to `/topic/prices` via WebSocket

### Phase 3: Frontend (React Dashboard)
- **App.js**: WebSocket client that listens for price updates
- **App.css**: Modern glassmorphism styling with responsive design

## Data Flow

1. **Java Server** calls CoinCap API every 5 seconds
2. **Process Data** - Java cleans JSON and extracts USD price
3. **Broadcast** - Java pushes data to `/topic/prices` WebSocket topic
4. **Display** - React catches messages and updates UI instantly

## Prerequisites

- Java 17+
- Node.js 16+
- Maven 3.6+

## Running the Application

### 1. Start the Backend (Spring Boot)

```bash
# Navigate to project root
cd "c:/Users/sarkc/Desktop/Real Time Finance Tracker"

# Run the Spring Boot application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend (React)

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd "c:/Users/sarkc/Desktop/Real Time Finance Tracker/frontend"

# Start the React development server
npm start
```

The frontend will start on `http://localhost:3000`

## Features

- **Real-time Updates**: Bitcoin price updates every 5 seconds
- **WebSocket Communication**: Efficient bidirectional communication
- **Modern UI**: Glassmorphism design with connection status
- **Error Handling**: Graceful error handling for API failures
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

- **WebSocket**: `ws://localhost:8080/ws-finance` (STOMP with SockJS fallback)
- **CoinCap API**: `https://api.coincap.io/v2/assets/bitcoin`

## WebSocket Topics

- **Price Updates**: `/topic/prices`
- **Message Format**: `{"symbol": "BTC", "price": "43250.67"}`

## Technologies Used

### Backend
- Spring Boot 3.2.0
- Spring WebSocket
- Spring Scheduling
- RestTemplate
- Lombok

### Frontend
- React 18
- SockJS-client
- STOMP.js
- CSS3 (Glassmorphism)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure WebSocketConfig allows `http://localhost:3000`
2. **Connection Failed**: Check if backend is running on port 8080
3. **No Price Updates**: Verify CoinCap API is accessible and internet is working

### Port Conflicts

If port 8080 or 3000 are occupied:
- Backend: Change port in `application.properties` (add `server.port=8081`)
- Frontend: React will automatically prompt for alternative port

## Development

### Adding More Cryptocurrencies

To track additional cryptocurrencies, modify `PriceService.java`:

```java
// Add new scheduled methods
@Scheduled(fixedRate = 5000)
public void broadcastEthPrice() {
    // Fetch ETH price from CoinCap
    // Broadcast to /topic/prices
}
```

### Customizing Update Frequency

Change the `fixedRate` in `@Scheduled` annotation:
- `5000` = 5 seconds
- `10000` = 10 seconds
- `60000` = 1 minute

## License

This project is for educational purposes.
