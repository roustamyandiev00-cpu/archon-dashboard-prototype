import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  TooltipProps
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

// Custom Tooltip Component
interface CustomTooltipProps extends TooltipProps<number, string> {
  currencySymbol?: string;
  showTrend?: boolean;
}

function CustomChartTooltip({ 
  active, 
  payload, 
  label,
  currencySymbol = "€",
  showTrend = false
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="chart-tooltip"
    >
      <p className="text-sm font-semibold mb-3 text-foreground">{label}</p>
      
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {currencySymbol}{(entry.value || 0).toLocaleString('nl-NL')}
            </span>
          </div>
        ))}
      </div>

      {payload.length > 1 && (
        <>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Totaal</span>
            <span className="text-sm font-bold text-foreground">
              {currencySymbol}{total.toLocaleString('nl-NL')}
            </span>
          </div>
        </>
      )}

      {showTrend && data.trend && (
        <>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Trend</span>
            <span className={cn(
              "text-xs font-medium flex items-center gap-1",
              data.trend > 0 ? "text-green-400" : "text-red-400"
            )}>
              {data.trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(data.trend)}%
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}

// Cashflow Chart Component
interface CashflowChartProps {
  data: Array<{
    month: string;
    inkomsten: number;
    uitgaven: number;
    trend?: number;
  }>;
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export function CashflowChart({ 
  data, 
  height = 350,
  showGrid = true,
  animate = true
}: CashflowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart 
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.05)" 
            vertical={false}
          />
        )}
        
        <XAxis 
          dataKey="month" 
          stroke="rgba(255, 255, 255, 0.3)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        
        <YAxis 
          stroke="rgba(255, 255, 255, 0.3)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
        />
        
        <Tooltip content={<CustomChartTooltip showTrend />} />
        
        {/* Uitgaven Area */}
        <defs>
          <linearGradient id="colorUitgaven" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <Area
          type="monotone"
          dataKey="uitgaven"
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="url(#colorUitgaven)"
          name="Uitgaven"
          animationDuration={animate ? 1000 : 0}
          animationBegin={0}
        />
        
        {/* Inkomsten Area */}
        <defs>
          <linearGradient id="colorInkomsten" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <Area
          type="monotone"
          dataKey="inkomsten"
          stroke="#06B6D4"
          strokeWidth={2}
          fill="url(#colorInkomsten)"
          name="Inkomsten"
          animationDuration={animate ? 1000 : 0}
          animationBegin={animate ? 200 : 0}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Project Status Bar Chart
interface ProjectChartProps {
  data: Array<{
    name: string;
    value: number;
    status?: string;
  }>;
  height?: number;
  color?: string;
}

export function ProjectStatusChart({ 
  data, 
  height = 300,
  color = "#06B6D4"
}: ProjectChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255, 255, 255, 0.05)" 
          vertical={false}
        />
        
        <XAxis 
          dataKey="name" 
          stroke="rgba(255, 255, 255, 0.3)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        
        <YAxis 
          stroke="rgba(255, 255, 255, 0.3)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        
        <Tooltip 
          content={<CustomChartTooltip currencySymbol="" />}
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
        />
        
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        
        <Bar 
          dataKey="value" 
          fill="url(#barGradient)"
          radius={[8, 8, 0, 0]}
          name="Voortgang"
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Revenue Trend Line Chart
interface RevenueTrendProps {
  data: Array<{
    month: string;
    value: number;
    target?: number;
  }>;
  height?: number;
}

export function RevenueTrendChart({ data, height = 250 }: RevenueTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart 
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255, 255, 255, 0.05)" 
          vertical={false}
        />
        
        <XAxis 
          dataKey="month" 
          stroke="rgba(255, 255, 255, 0.3)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        
        <YAxis 
          stroke="rgba(255, 255, 255, 0.3)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
        />
        
        <Tooltip content={<CustomChartTooltip />} />
        
        {/* Target Line */}
        {data.some(d => d.target) && (
          <Line
            type="monotone"
            dataKey="target"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Target"
            animationDuration={800}
          />
        )}
        
        {/* Actual Revenue Line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#06B6D4"
          strokeWidth={3}
          dot={{ fill: '#06B6D4', r: 4, strokeWidth: 2, stroke: '#0F1520' }}
          activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2, fill: '#0F1520' }}
          name="Omzet"
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Mini Sparkline Chart (for stat cards)
interface SparklineProps {
  data: number[];
  height?: number;
  color?: string;
  showGradient?: boolean;
}

export function Sparkline({ 
  data, 
  height = 40, 
  color = "#06B6D4",
  showGradient = true
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        {showGradient && (
          <defs>
            <linearGradient id={`sparkline-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
        )}
        
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={showGradient ? `url(#sparkline-${color})` : "none"}
          dot={false}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Chart Container with Loading State
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  isLoading = false,
  action,
  className
}: ChartContainerProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Data laden...</p>
            </div>
          </div>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </Card>
  );
}
