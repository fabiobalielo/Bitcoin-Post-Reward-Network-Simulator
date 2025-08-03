# Bitcoin Post-Reward Network Simulator

A comprehensive Next.js application that simulates Bitcoin network dynamics after block rewards end (0 BTC subsidy). This tool helps visualize how the network might behave when miners rely solely on transaction fees for revenue.

## Author

**Fabio Balielo** - Advanced economic modeling and blockchain analysis

- **Project**: EndPow - Bitcoin Post-Reward Economics
- **Expertise**: Bitcoin economics, network security, fee market dynamics
- **Contact**: [@fabio_balielo](https://twitter.com/fabio_balielo)

## About This Project

This simulator represents advanced economic modeling of Bitcoin's transition to a fee-only mining economy. The analysis includes:

- **Network Security Modeling**: Attack cost calculations and security budget requirements
- **Fee Market Dynamics**: Optimal fee rates for sustainable mining operations
- **Economic Equilibrium**: Hashrate sustainability and miner profitability analysis
- **Real-time Data Integration**: Live Bitcoin metrics and market conditions

## Features

### Real-time Data Integration

- **Live Bitcoin Metrics**: Price, hashrate, difficulty, mempool size, average fees, transaction throughput
- **API Sources**: mempool.space, CoinGecko, Blockchain.com
- **WebSocket/SSE**: Real-time updates every 30 seconds

### Interactive Simulation

- **Parameter Controls**: Adjust BTC price, transaction demand, miner costs, block size limits, fee curves
- **Economic Modeling**: Calculate miner revenue from fees only, network security metrics, difficulty adjustments
- **Scenario Testing**: Explore different post-reward economic conditions

### Visualization

- **Interactive Charts**: Built with Recharts for responsive data visualization
- **Key Metrics**: Fee rates, hashrate trends, miner revenue, transaction backlog, confirmation times
- **Real-time Updates**: Charts update automatically with new data

### Modern Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: TailwindCSS, shadcn/ui components, Framer Motion animations
- **Database**: Prisma ORM with PostgreSQL
- **Caching**: Redis for API response caching
- **Deployment**: Docker support with docker-compose

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (recommended)
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd bitcoin-post-reward-simulator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database and API configurations
   ```

4. **Start with Docker (Recommended)**

   ```bash
   docker-compose up -d
   ```

5. **Or start manually**

   ```bash
   # Start PostgreSQL and Redis
   # Update DATABASE_URL and REDIS_URL in .env

   # Generate Prisma client and push schema
   npx prisma generate
   npx prisma db push

   # Start development server
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:3000`

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bitcoin_simulator"

# Redis
REDIS_URL="redis://localhost:6379"

# API Keys (optional - improves rate limits)
COINGECKO_API_KEY=""
BLOCKCHAIN_INFO_API_KEY=""

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"

# Feature Flags
NEXT_PUBLIC_READ_ONLY_MODE="false"
```

### API Rate Limits

- **Without API keys**: Basic rate limits apply
- **With API keys**: Higher rate limits and more reliable data
- **Fallback data**: App works offline with simulated data

## Architecture

### Data Flow

1. **Data Collection**: APIs fetch real-time Bitcoin network data
2. **Caching**: Redis caches API responses to reduce external calls
3. **Simulation**: User parameters modify base data for scenario modeling
4. **Storage**: Prisma stores historical data and simulation sessions
5. **Real-time Updates**: WebSocket/SSE pushes updates to connected clients

### Key Components

- **NetworkDashboard**: Overview of current network state
- **SimulationControls**: Interactive parameter adjustment
- **MetricsCharts**: Historical data visualization
- **BitcoinAPI**: External data integration layer

## Simulation Parameters

### Economic Variables

- **Bitcoin Price**: $10,000 - $200,000
- **Transaction Demand**: 0.1x - 5.0x current levels
- **Miner Operating Costs**: $0.01 - $0.20 per TH/s
- **Block Size Limit**: 1MB - 8MB
- **Fee Rate Multiplier**: 0.1x - 10.0x current rates

### Calculated Metrics

- **Miner Revenue**: Fee-only income per block
- **Network Security**: Economic security based on mining costs
- **Confirmation Times**: Average time for transaction confirmation
- **Transaction Backlog**: Pending transactions in mempool

## Development

### Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── *.tsx          # Feature components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and APIs
├── prisma/            # Database schema
└── docker-compose.yml # Docker configuration
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Adding New Features

1. **New Metrics**: Add to `BitcoinMetrics` interface and API integration
2. **Charts**: Create new chart components in `MetricsCharts.tsx`
3. **Parameters**: Add controls in `SimulationControls.tsx`
4. **Database**: Update Prisma schema and run migrations

## Deployment

### Docker Production

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# Or build custom image
docker build -t bitcoin-simulator .
docker run -p 3000:3000 bitcoin-simulator
```

### Environment Setup

- Set `NODE_ENV=production`
- Configure production database URLs
- Set up SSL certificates for HTTPS
- Configure reverse proxy (nginx recommended)

## API Documentation

### Endpoints

- `GET /api/bitcoin` - Fetch current Bitcoin metrics
- `POST /api/bitcoin` - Submit simulation parameters
- `GET /api/ws` - WebSocket/SSE connection for real-time updates

### Data Sources

- **mempool.space**: Mempool data, fee rates, network stats
- **CoinGecko**: Bitcoin price data
- **Blockchain.com**: Additional network metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue on GitHub
- Check existing documentation
- Review API rate limits and configurations

---

**Note**: This is a simulation tool for educational and research purposes. Actual Bitcoin network behavior may differ from simulated results.
