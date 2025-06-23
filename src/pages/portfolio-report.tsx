import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameState } from "@/hooks/useGameState";
import { ArrowLeft, TrendingUp, DollarSign, Building, PieChart, Target, Award, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function PortfolioReport() {
  const { gameState } = useGameState();
  const [reportDate] = useState(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    const { balance = 0, investments = {}, businesses = {}, level = 1 } = gameState;
    
    // Investment value calculation
    const investmentValue = Object.entries(investments).reduce((total, [_, quantity]) => {
      return total + (quantity * 100); // Simplified calculation
    }, 0);
    
    // Business value calculation  
    const businessValue = Object.entries(businesses).reduce((total, [businessId, data]) => {
      const quantity = data.quantity || 0;
      let basePrice = 0;
      
      if (businessId === 'convenience_store') basePrice = 1000;
      else if (businessId === 'coffee_shop') basePrice = 5000;
      else if (businessId === 'restaurant') basePrice = 15000;
      else if (businessId === 'clothing_store') basePrice = 48000;
      else if (businessId === 'underground_casino') basePrice = 1500000;
      
      return total + (quantity * basePrice);
    }, 0);
    
    const totalNetWorth = balance + investmentValue + businessValue;
    const liquidCash = balance;
    
    // Calculate monthly income (daily income * 30)
    const dailyIncome = gameState.passiveIncome * 86400; // Convert per second to per day
    const monthlyIncome = dailyIncome * 30;
    const annualROI = totalNetWorth > 0 ? (monthlyIncome * 12 / totalNetWorth) * 100 : 0;
    
    return {
      totalNetWorth,
      liquidCash,
      monthlyIncome,
      annualROI,
      investmentValue,
      businessValue,
      level
    };
  }, [gameState]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Report Header */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  INVESTMENT
                  <br />
                  PORTFOLIO
                  <br />
                  REPORT
                </h1>
                <p className="text-slate-400 text-sm mb-1">Confidential Financial Analysis</p>
                <p className="text-slate-500 text-xs">Generated {reportDate}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Portfolio ID</p>
                <p className="text-slate-300 font-mono text-sm">#TYC-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Total Net Worth */}
          <Card className="bg-slate-700/30 border-slate-600/50 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">TOTAL NET WORTH</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(portfolioStats.totalNetWorth)}
              </div>
              <div className="text-gray-400 text-sm">
                +12.5% YTD
              </div>
            </div>
          </Card>

          {/* Liquid Cash */}
          <Card className="bg-slate-700/30 border-slate-600/50 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">LIQUID CASH</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(portfolioStats.liquidCash)}
              </div>
              <div className="text-gray-400 text-sm">
                Available
              </div>
            </div>
          </Card>

          {/* Monthly Income */}
          <Card className="bg-slate-700/30 border-slate-600/50 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">MONTHLY INCOME</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(portfolioStats.monthlyIncome)}
              </div>
              <div className="text-gray-400 text-sm">
                {formatCurrency(portfolioStats.monthlyIncome / 30)}/day
              </div>
            </div>
          </Card>

          {/* Annual ROI */}
          <Card className="bg-slate-700/30 border-slate-600/50 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">ROI ANNUAL</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatPercentage(Math.min(portfolioStats.annualROI, 999.9))}
              </div>
              <div className="text-gray-400 text-sm">
                Projected
              </div>
            </div>
          </Card>
        </div>

        {/* Portfolio Breakdown */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-slate-400" />
              <h3 className="text-xl font-bold text-white">PORTFOLIO BREAKDOWN</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(portfolioStats.liquidCash)}
                </div>
                <div className="text-slate-400 text-sm">Liquid Cash</div>
                <div className="text-gray-400 text-xs">
                  {((portfolioStats.liquidCash / portfolioStats.totalNetWorth) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(portfolioStats.businessValue)}
                </div>
                <div className="text-slate-400 text-sm">Business Assets</div>
                <div className="text-gray-400 text-xs">
                  {((portfolioStats.businessValue / portfolioStats.totalNetWorth) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(portfolioStats.investmentValue)}
                </div>
                <div className="text-slate-400 text-sm">Stock Holdings</div>
                <div className="text-gray-400 text-xs">
                  {((portfolioStats.investmentValue / portfolioStats.totalNetWorth) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-slate-400" />
              <h3 className="text-xl font-bold text-white">PERFORMANCE METRICS</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-white">{portfolioStats.level}</div>
                <div className="text-slate-400 text-xs">Investor Level</div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-white">
                  {Object.keys(gameState.businesses || {}).length}
                </div>
                <div className="text-slate-400 text-xs">Active Businesses</div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-white">
                  {Object.keys(gameState.investments || {}).length}
                </div>
                <div className="text-slate-400 text-xs">Stock Positions</div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-white">95.2%</div>
                <div className="text-slate-400 text-xs">Success Rate</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <div className="p-4 text-center">
            <p className="text-slate-500 text-xs">
              This report is confidential and intended solely for portfolio analysis. 
              Data calculated at {new Date().toLocaleTimeString()}.
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}