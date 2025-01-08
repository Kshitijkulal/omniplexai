'use client'

import React, { useState } from 'react';
import { AreaChart } from "@tremor/react";
import { Skeleton } from "@nextui-org/skeleton";
import styles from './page.module.css';

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query?';

async function searchSymbol(keywords) {
  const response = await fetch(`${BASE_URL}function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`);
  const data = await response.json();
  return data.bestMatches || [];
}

async function fetchStockData(symbol) {
  const [quoteResponse, overviewResponse, timeSeriesResponse] = await Promise.all([
    fetch(`${BASE_URL}function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`),
    fetch(`${BASE_URL}function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`),
    fetch(`${BASE_URL}function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`)
  ]);

  const quoteData = await quoteResponse.json();
  const overviewData = await overviewResponse.json();
  const timeSeriesData = await timeSeriesResponse.json();

  return {
    quote: quoteData['Global Quote'],
    overview: overviewData,
    timeSeries: timeSeriesData['Time Series (Daily)'] || {}
  };
}

const dataFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const formatChartData = (data) => {
  return Object.entries(data).map(([date, values]) => ({
    date,
    price: parseFloat(values['4. close'])
  })).reverse().slice(0, 30);
};

const formatMarketCap = (value) => {
  const numValue = parseFloat(value);
  if (numValue >= 1_000_000_000_000) {
    return `${(numValue / 1_000_000_000_000).toFixed(2)} T`;
  } else if (numValue >= 1_000_000_000) {
    return `${(numValue / 1_000_000_000).toFixed(2)} B`;
  } else {
    return `${(numValue / 1_000_000).toFixed(2)} M`;
  }
};

const CustomTooltip = ({ payload, active }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const { date, price } = payload[0].payload;
  return (
    <div className={styles.customTooltip}>
      <p className={styles.tooltipDate}>{date}</p>
      <p className={styles.tooltipPrice}>${price.toFixed(2)}</p>
    </div>
  );
};

const CustomTable = ({ data }) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.customTable}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={`${index}-${header}`}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Search = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const searchResults = await searchSymbol(query);
    setResults(searchResults);
  };

  return (
    <div className={styles.search}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a stock..."
        className={styles.searchInput}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        Search
      </button>
      <ul className={styles.searchResults}>
        {results.map((result) => (
          <li
            key={result['1. symbol']}
            onClick={() => onSelectStock(result['1. symbol'])}
            className={styles.searchResultItem}
          >
            {result['1. symbol']} - {result['2. name']}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Stock = ({ stockResults }) => {
  if (!stockResults) {
    return (
      <div className={styles.stockContainer}>
        <div className={styles.stockHeader}>
          <div>
            <Skeleton className={styles.skeletonCompanyName} />
            <Skeleton className={styles.skeletonSubText} />
          </div>
          <div>
            <Skeleton className={styles.skeletonCurrentPrice} />
            <Skeleton className={styles.skeletonSubText2} />
          </div>
        </div>
        <div className={styles.chart}>
          <AreaChart
            className="h-80"
            data={[]}
            index="date"
            categories={["price"]}
            colors={["gray"]}
            valueFormatter={dataFormatter}
            showXAxis={false}
            showYAxis={false}
            autoMinValue={true}
            showAnimation={true}
            showLegend={false}
            showTooltip={false}
          />
          <div className={styles.chartOverlay} />
        </div>
        <div className={styles.stockDetails}>
          <div>
            <Skeleton className={styles.skeletonStockDetailsText} />
            <Skeleton className={styles.skeletonStockDetailsText} />
            <Skeleton className={styles.skeletonStockDetailsText} />
          </div>
          <div>
            <Skeleton className={styles.skeletonStockDetailsText} />
            <Skeleton className={styles.skeletonStockDetailsText} />
            <Skeleton className={styles.skeletonStockDetailsText} />
          </div>
          <div>
            <Skeleton className={styles.skeletonStockDetailsText} />
            <Skeleton className={styles.skeletonStockDetailsText} />
          </div>
        </div>
      </div>
    );
  }

  const { quote, overview, timeSeries } = stockResults;

  const tableData = [
    { Label: 'Open', Value: `$${quote['02. open']}` },
    { Label: 'High', Value: `$${quote['03. high']}` },
    { Label: 'Low', Value: `$${quote['04. low']}` },
    { Label: 'Market Cap', Value: formatMarketCap(overview.MarketCapitalization) },
    { Label: 'P/E Ratio', Value: overview.PERatio },
    { Label: 'Dividend Yield', Value: overview.DividendYield },
    { Label: '52-Week High', Value: `$${overview['52WeekHigh']}` },
    { Label: '52-Week Low', Value: `$${overview['52WeekLow']}` },
  ];

  return (
    <div className={styles.stockContainer}>
      <div className={styles.stockHeader}>
        <div>
          <div className={styles.companyName}>{overview.Name}</div>
          <div className={styles.subText}>{`${overview.Exchange} : ${overview.Symbol}`}</div>
        </div>
        <div>
          <div className={styles.currentPrice}>${quote['05. price']}</div>
          <div
            className={styles.subText}
            style={{
              color: parseFloat(quote['09. change']) >= 0 ? "#4caf50" : "#ff5252",
            }}
          >
            {parseFloat(quote['09. change']) >= 0 ? "+" : ""}
            {quote['09. change']} ({quote['10. change percent']})
          </div>
        </div>
      </div>
      <div className={styles.chart}>
        <AreaChart
          className="h-80"
          data={formatChartData(timeSeries)}
          index="date"
          categories={["price"]}
          colors={["#007bff"]}
          valueFormatter={dataFormatter}
          showXAxis={false}
          showYAxis={false}
          autoMinValue={true}
          showAnimation={true}
          showLegend={false}
          connectNulls={true}
          customTooltip={CustomTooltip}
        />
      </div>
      <CustomTable data={tableData} />
    </div>
  );
};

export default function HomePage() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectStock = async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStockData(symbol);
      setStockData(data);
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stock Viewer</h1>
      <Search onSelectStock={handleSelectStock} />
      {loading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {stockData && <Stock stockResults={stockData} />}
    </div>
  );
}
