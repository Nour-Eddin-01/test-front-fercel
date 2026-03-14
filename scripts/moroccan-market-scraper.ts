/**
 * Moroccan Stock Market Scraper
 * 
 * This script fetches stock data from the Casablanca Stock Exchange (Bourse de Casablanca).
 * Since there's no official public API, we scrape data from the official website.
 * 
 * Target: https://www.casablanca-bourse.com
 * 
 * Usage with backend:
 * - Can be run as a scheduled job (cron) to update stock prices
 * - Data can be stored in the PostgreSQL database via Prisma
 */

import * as cheerio from 'cheerio';

// Types
interface StockData {
  isin: string;
  name: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  changePercent: number;
  volume: number;
  sector?: string;
  lastUpdated: Date;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

// Configuration
const BASE_URL = 'https://www.casablanca-bourse.com';
const MARKET_DATA_URL = `${BASE_URL}/bourseweb/Negociation-Historique-498`;

// Known Moroccan stock ISINs and their sectors
const MOROCCAN_STOCKS: Record<string, { name: string; sector: string }> = {
  'IAM': { name: 'Maroc Telecom', sector: 'Telecom' },
  'ATW': { name: 'Attijariwafa Bank', sector: 'Banking' },
  'BCP': { name: 'Banque Centrale Populaire', sector: 'Banking' },
  'BOA': { name: 'Bank of Africa', sector: 'Banking' },
  'CIH': { name: 'CIH Bank', sector: 'Banking' },
  'LHM': { name: 'LafargeHolcim Maroc', sector: 'Construction' },
  'MNG': { name: 'Managem', sector: 'Mining' },
  'CMT': { name: 'CMT', sector: 'Mining' },
  'ADH': { name: 'Addoha', sector: 'Real Estate' },
  'RDS': { name: 'Residences Dar Saada', sector: 'Real Estate' },
  'TQM': { name: 'Taqa Morocco', sector: 'Energy' },
  'GAZ': { name: 'Afriquia Gaz', sector: 'Energy' },
  'SNP': { name: 'Sonasid', sector: 'Steel' },
  'LBV': { name: 'Label Vie', sector: 'Retail' },
  'MLE': { name: 'Maroc Leasing', sector: 'Finance' },
  'SBM': { name: 'Societe des Brasseries du Maroc', sector: 'Consumer' },
  'COL': { name: 'Cosumar', sector: 'Food' },
  'DWY': { name: 'Dari Couspate', sector: 'Food' },
  'SID': { name: 'SIDER', sector: 'Steel' },
  'WAA': { name: 'Wafa Assurance', sector: 'Insurance' },
};

/**
 * Fetch HTML content from a URL
 */
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

/**
 * Parse stock data from the Casablanca Stock Exchange website
 * Note: The actual HTML structure may vary, this is a template that needs to be adjusted
 */
async function scrapeStockData(): Promise<StockData[]> {
  try {
    const html = await fetchPage(MARKET_DATA_URL);
    const $ = cheerio.load(html);
    
    const stocks: StockData[] = [];

    // Example selector pattern - adjust based on actual website structure
    // The Casablanca Stock Exchange typically displays data in tables
    $('table.cotation tbody tr, table.negociation tbody tr, .stock-row').each((_, element) => {
      const $row = $(element);
      
      // Extract data from table cells - selectors need adjustment based on actual HTML
      const isin = $row.find('td:nth-child(1), .stock-isin').text().trim();
      const name = $row.find('td:nth-child(2), .stock-name').text().trim();
      const currentPrice = parseFloat($row.find('td:nth-child(3), .stock-price').text().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const changePercent = parseFloat($row.find('td:nth-child(4), .stock-change').text().replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
      const volume = parseInt($row.find('td:nth-child(5), .stock-volume').text().replace(/[^\d]/g, '')) || 0;

      if (isin && currentPrice > 0) {
        const stockInfo = MOROCCAN_STOCKS[isin] || { name: name, sector: 'Other' };
        
        stocks.push({
          isin,
          name: stockInfo.name || name,
          currentPrice,
          openPrice: currentPrice, // Would need separate data source
          highPrice: currentPrice,
          lowPrice: currentPrice,
          changePercent,
          volume,
          sector: stockInfo.sector,
          lastUpdated: new Date(),
        });
      }
    });

    return stocks;
  } catch (error) {
    console.error('Error scraping stock data:', error);
    return [];
  }
}

/**
 * Scrape market indices (MASI, MADEX, etc.)
 */
async function scrapeMarketIndices(): Promise<MarketIndex[]> {
  try {
    const html = await fetchPage(BASE_URL);
    const $ = cheerio.load(html);
    
    const indices: MarketIndex[] = [];

    // Look for index data - adjust selectors based on actual structure
    $('.indice-item, .market-index, .index-card').each((_, element) => {
      const $el = $(element);
      
      const name = $el.find('.index-name, .titre').text().trim();
      const value = parseFloat($el.find('.index-value, .valeur').text().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const change = parseFloat($el.find('.index-change, .variation').text().replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
      
      if (name && value > 0) {
        indices.push({
          name,
          value,
          change,
          changePercent: (change / value) * 100,
        });
      }
    });

    // If scraping fails, return mock data for development
    if (indices.length === 0) {
      return getMockIndices();
    }

    return indices;
  } catch (error) {
    console.error('Error scraping indices:', error);
    return getMockIndices();
  }
}

/**
 * Alternative: Use a simulated data source for development/testing
 * This generates realistic mock data for Moroccan stocks
 */
function getMockStockData(): StockData[] {
  const baseData = [
    { isin: 'IAM', basePrice: 130, volatility: 0.02 },
    { isin: 'ATW', basePrice: 480, volatility: 0.015 },
    { isin: 'BCP', basePrice: 290, volatility: 0.018 },
    { isin: 'BOA', basePrice: 185, volatility: 0.02 },
    { isin: 'CIH', basePrice: 340, volatility: 0.022 },
    { isin: 'LHM', basePrice: 1800, volatility: 0.012 },
    { isin: 'MNG', basePrice: 1400, volatility: 0.025 },
    { isin: 'CMT', basePrice: 1650, volatility: 0.028 },
    { isin: 'ADH', basePrice: 12, volatility: 0.035 },
    { isin: 'RDS', basePrice: 45, volatility: 0.03 },
    { isin: 'TQM', basePrice: 1150, volatility: 0.015 },
    { isin: 'GAZ', basePrice: 4200, volatility: 0.012 },
    { isin: 'SNP', basePrice: 265, volatility: 0.02 },
    { isin: 'LBV', basePrice: 4500, volatility: 0.018 },
    { isin: 'COL', basePrice: 195, volatility: 0.015 },
    { isin: 'WAA', basePrice: 4100, volatility: 0.012 },
  ];

  return baseData.map(({ isin, basePrice, volatility }) => {
    const changePercent = (Math.random() - 0.5) * volatility * 100;
    const currentPrice = basePrice * (1 + changePercent / 100);
    const stockInfo = MOROCCAN_STOCKS[isin];

    return {
      isin,
      name: stockInfo?.name || isin,
      currentPrice: Math.round(currentPrice * 100) / 100,
      openPrice: basePrice,
      highPrice: Math.round(currentPrice * 1.01 * 100) / 100,
      lowPrice: Math.round(currentPrice * 0.99 * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 100000) + 10000,
      sector: stockInfo?.sector || 'Other',
      lastUpdated: new Date(),
    };
  });
}

function getMockIndices(): MarketIndex[] {
  return [
    { name: 'MASI', value: 13245.67, change: 163.45, changePercent: 1.24 },
    { name: 'MADEX', value: 10856.34, change: 128.12, changePercent: 1.18 },
    { name: 'MSI 20', value: 1089.45, change: -3.82, changePercent: -0.35 },
    { name: 'FTSE CSE Morocco 15', value: 12456.78, change: 89.23, changePercent: 0.72 },
  ];
}

/**
 * Main function to fetch all market data
 */
async function fetchMarketData() {
  console.log('Fetching Moroccan market data...\n');

  // Try scraping first, fall back to mock data
  let stocks = await scrapeStockData();
  if (stocks.length === 0) {
    console.log('Using simulated data (scraping unavailable)...\n');
    stocks = getMockStockData();
  }

  const indices = await scrapeMarketIndices();

  // Display results
  console.log('=== MARKET INDICES ===');
  indices.forEach(index => {
    const sign = index.changePercent >= 0 ? '+' : '';
    console.log(`${index.name}: ${index.value.toFixed(2)} (${sign}${index.changePercent.toFixed(2)}%)`);
  });

  console.log('\n=== TOP STOCKS ===');
  stocks
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10)
    .forEach(stock => {
      const sign = stock.changePercent >= 0 ? '+' : '';
      console.log(
        `${stock.isin.padEnd(6)} ${stock.name.padEnd(25)} ${stock.currentPrice.toFixed(2).padStart(10)} MAD  ${sign}${stock.changePercent.toFixed(2)}%`
      );
    });

  return { stocks, indices };
}

// Export for use in backend
export {
  scrapeStockData,
  scrapeMarketIndices,
  getMockStockData,
  getMockIndices,
  fetchMarketData,
  type StockData,
  type MarketIndex,
};

// Run if executed directly
fetchMarketData();
