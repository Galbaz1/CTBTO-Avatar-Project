'use client';

import React from 'react';

interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  historicalData: Array<{
    date: string;
    price: number;
  }>;
}

interface StockCardProps {
  data: Partial<StockData>;
  isLoading?: boolean;
}

const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-600 rounded animate-pulse ${className}`} />
);

export function StockCard({ data, isLoading = false }: StockCardProps) {
  const isPositive = (data.change || 0) >= 0;
  const maxPrice = data.historicalData ? Math.max(...data.historicalData.map(d => d.price)) : 0;
  const minPrice = data.historicalData ? Math.min(...data.historicalData.map(d => d.price)) : 0;
  const priceRange = maxPrice - minPrice;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-lg mx-auto mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {data.symbol || (isLoading ? <LoadingSkeleton className="h-6 w-16" /> : 'STOCK')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {data.name || (isLoading ? <LoadingSkeleton className="h-4 w-32" /> : 'Loading...')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {data.currentPrice !== undefined ? formatPrice(data.currentPrice) : 
              isLoading ? <LoadingSkeleton className="h-8 w-20" /> : '--'}
          </div>
          <div className={`text-sm font-medium ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {data.change !== undefined && data.changePercent !== undefined ? (
              <>
                {isPositive ? '+' : ''}{formatPrice(data.change)} 
                ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
              </>
            ) : isLoading ? (
              <LoadingSkeleton className="h-4 w-16" />
            ) : (
              '--'
            )}
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          10-Day Price History
        </h4>
        <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
          {data.historicalData && data.historicalData.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 300 100">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 30 0 L 0 0 0 20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5" 
                    className="text-gray-300 dark:text-gray-600"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Price line */}
              <polyline
                fill="none"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                points={data.historicalData.map((point, index) => {
                  const x = (index / (data.historicalData!.length - 1)) * 280 + 10;
                  const y = 90 - ((point.price - minPrice) / priceRange) * 80;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {data.historicalData.map((point, index) => {
                const x = (index / (data.historicalData!.length - 1)) * 280 + 10;
                const y = 90 - ((point.price - minPrice) / priceRange) * 80;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={isPositive ? '#10b981' : '#ef4444'}
                  />
                );
              })}
            </svg>
          ) : (
            // Loading skeleton for chart
            <div className="flex items-center justify-center h-full">
              <LoadingSkeleton className="w-full h-16" />
            </div>
          )}
        </div>
      </div>

      {/* Historical Data Table */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Recent Prices
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.historicalData && data.historicalData.length > 0 ? (
            data.historicalData.slice(-5).reverse().map((day, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatDate(day.date)}
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {formatPrice(day.price)}
                </div>
              </div>
            ))
          ) : (
            // Loading skeletons for recent prices
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <LoadingSkeleton className="h-4 w-16" />
                <LoadingSkeleton className="h-4 w-12" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {data.lastUpdated ? (
          `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`
        ) : isLoading ? (
          <LoadingSkeleton className="h-3 w-32 mx-auto" />
        ) : (
          'Loading...'
        )}
      </div>
    </div>
  );
} 