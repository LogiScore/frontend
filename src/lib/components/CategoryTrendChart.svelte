<script lang="ts">
  export let categoryName: string;
  export let trendData: {
    labels: string[];
    data: number[];
    review_counts: number[];
  };
  export let isLoading: boolean = false;

  // Calculate trend direction and percentage change
  $: trendDirection = trendData && trendData.data.length > 1 
    ? trendData.data[trendData.data.length - 1] - trendData.data[0]
    : 0;
  
  $: trendPercentage = trendData && trendData.data.length > 1 && trendData.data[0] > 0
    ? ((trendDirection / trendData.data[0]) * 100).toFixed(1)
    : '0.0';

  $: trendIcon = trendDirection > 0.1 ? '↗️' : trendDirection < -0.1 ? '↘️' : '➡️';
  $: trendColor = trendDirection > 0.1 ? '#10b981' : trendDirection < -0.1 ? '#ef4444' : '#6b7280';

  // Find max value for chart scaling
  $: maxValue = trendData ? Math.max(...trendData.data) : 5;
  $: minValue = trendData ? Math.min(...trendData.data) : 0;
  $: range = maxValue - minValue || 1;

  // Generate SVG path for line chart
  function generatePath(data: number[], labels: string[]): string {
    if (!data || data.length === 0) return '';
    
    const width = 200;
    const height = 100;
    const padding = 10;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + ((maxValue - value) / range) * chartHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }

  // Generate circles for data points
  function generateCircles(data: number[], labels: string[]): Array<{cx: number, cy: number, value: number, count: number}> {
    if (!data || data.length === 0) return [];
    
    const width = 200;
    const height = 100;
    const padding = 10;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    return data.map((value, index) => ({
      cx: padding + (index / (data.length - 1)) * chartWidth,
      cy: padding + ((maxValue - value) / range) * chartHeight,
      value: value,
      count: trendData.review_counts[index] || 0
    }));
  }
</script>

<div class="trend-chart-card">
  <div class="trend-chart-header">
    <div class="trend-chart-title">{categoryName}</div>
    <div class="trend-indicator" style="color: {trendColor}">
      <span class="trend-icon">{trendIcon}</span>
      <span class="trend-percentage">{trendPercentage}%</span>
    </div>
  </div>
  
  {#if isLoading}
    <div class="trend-chart-loading">
      <div class="loading-spinner"></div>
      <span>Loading...</span>
    </div>
  {:else if trendData && trendData.data.length > 0}
    <div class="trend-chart">
      <svg width="200" height="100" viewBox="0 0 200 100" class="chart-svg">
        <!-- Grid lines -->
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="200" height="100" fill="url(#grid)" />
        
        <!-- Line chart -->
        <path
          d={generatePath(trendData.data, trendData.labels)}
          fill="none"
          stroke="#667eea"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="trend-line"
        />
        
        <!-- Data points -->
        {#each generateCircles(trendData.data, trendData.labels) as point}
          <circle
            cx={point.cx}
            cy={point.cy}
            r="3"
            fill="#667eea"
            class="data-point"
            data-value={point.value.toFixed(1)}
            data-count={point.count}
          />
        {/each}
      </svg>
      
      <!-- Y-axis labels -->
      <div class="y-axis-labels">
        <span class="y-label max">{maxValue.toFixed(1)}</span>
        <span class="y-label min">{minValue.toFixed(1)}</span>
      </div>
      
      <!-- X-axis labels (first and last month) -->
      <div class="x-axis-labels">
        {#if trendData.labels.length > 0}
          <span class="x-label first">{trendData.labels[0]}</span>
          <span class="x-label last">{trendData.labels[trendData.labels.length - 1]}</span>
        {/if}
      </div>
    </div>
    
    <!-- Hover tooltip -->
    <div class="chart-tooltip">
      Hover over points for details
    </div>
  {:else}
    <div class="trend-chart-empty">
      <div class="empty-icon">📊</div>
      <span>No data available</span>
    </div>
  {/if}
</div>

<style>
  .trend-chart-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    min-height: 200px;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .trend-chart-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .trend-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .trend-chart-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    flex: 1;
  }

  .trend-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .trend-icon {
    font-size: 1rem;
  }

  .trend-percentage {
    font-size: 0.75rem;
  }

  .trend-chart {
    position: relative;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 25px;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
  }

  .trend-line {
    filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
  }

  .data-point {
    cursor: pointer;
    transition: r 0.2s ease, fill 0.2s ease;
  }

  .data-point:hover {
    r: 5;
    fill: #4f46e5;
  }

  .y-axis-labels {
    position: absolute;
    left: -25px;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #6b7280;
    pointer-events: none;
    width: 20px;
    text-align: right;
  }

  .y-label {
    font-size: 0.65rem;
    font-weight: 500;
  }

  .y-label.min {
    margin-bottom: 8px;
  }

  .x-axis-labels {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #6b7280;
    pointer-events: none;
    padding-bottom: 2px;
  }

  .x-label {
    font-size: 0.65rem;
    font-weight: 500;
  }

  .x-label.first {
    margin-left: 8px;
  }

  .chart-tooltip {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.65rem;
    color: #9ca3af;
    text-align: center;
  }

  .trend-chart-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: #6b7280;
    font-size: 0.8rem;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .trend-chart-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: #9ca3af;
    font-size: 0.8rem;
  }

  .empty-icon {
    font-size: 1.5rem;
    margin-bottom: 8px;
    opacity: 0.5;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .trend-chart-card {
      padding: 15px;
      min-height: 180px;
    }

    .trend-chart-title {
      font-size: 0.8rem;
    }

    .trend-indicator {
      font-size: 0.7rem;
    }

    .trend-chart {
      height: 100px;
    }
  }
</style>
