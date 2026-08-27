import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  FileText, 
  Download, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Layers, 
  CreditCard, 
  Truck, 
  PackageCheck, 
  FileWarning, 
  ExternalLink,
  ChevronRight,
  Activity,
  Users,
  Target
} from 'lucide-react';

const Kpis = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'financial' | 'operations' | 'risks'

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading KPI orders:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter allowed orders by auth
  const allowedOrders = useMemo(() => {
    return orders.filter(o => auth.canViewOrder ? auth.canViewOrder(o) : true);
  }, [orders, auth]);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set();
    allowedOrders.forEach(o => {
      const dateStr = o.startDate || o.dateOds || o.createdAt;
      if (dateStr) {
        const y = new Date(dateStr).getFullYear();
        if (!isNaN(y) && y > 2000) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allowedOrders]);

  // Extract available divisions
  const availableDivisions = useMemo(() => {
    const divs = new Set();
    allowedOrders.forEach(o => {
      if (o.division) divs.add(o.division);
    });
    return Array.from(divs);
  }, [allowedOrders]);

  // Filtered orders by interactive dropdowns
  const filteredOrders = useMemo(() => {
    return allowedOrders.filter(o => {
      if (selectedDivision !== 'ALL' && o.division !== selectedDivision) return false;
      if (selectedStatus !== 'ALL' && (o.status || 'En cours') !== selectedStatus) return false;
      if (selectedYear !== 'ALL') {
        const dateStr = o.startDate || o.dateOds || o.createdAt;
        if (!dateStr) return false;
        const y = new Date(dateStr).getFullYear();
        if (String(y) !== String(selectedYear)) return false;
      }
      return true;
    });
  }, [allowedOrders, selectedDivision, selectedStatus, selectedYear]);

  // Helper parse amount
  const parseNum = (val) => {
    if (val === undefined || val === null) return 0;
    const clean = String(val).replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Helper format currency
  const formatDA = (num) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num || 0) + ' DA';
  };

  const formatMillions = (num) => {
    if (!num) return '0 DA';
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + ' Mds DA';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + ' M DA';
    }
    return formatDA(num);
  };

  // Comprehensive Analytics Calculations
  const stats = useMemo(() => {
    const totalCount = filteredOrders.length;
    let totalPortfolioValue = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let totalBankGuarantees = 0;

    let authorizedCount = 0;
    let deliveredCount = 0;
    let pendingPaymentCount = 0;
    let stoppedCount = 0;
    let overdueCount = 0;
    let waitingOdsCount = 0;
    let attributionCount = 0;

    const divisionStats = {};
    const clientStats = {};
    const statusCounts = {
      'En cours': 0,
      'En attente de paiement': 0,
      "En attente d'ODS": 0,
      'Attribution en attente': 0,
      'Clôturé': 0,
      'Autres': 0
    };

    const overdueList = [];
    const highRiskList = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filteredOrders.forEach(o => {
      const amt = parseNum(o.amount);
      totalPortfolioValue += amt;

      // Financials
      const received = parseNum(o.financial?.amountReceived);
      const remaining = o.financial?.remainingAmount !== undefined ? parseNum(o.financial.remainingAmount) : (amt - received);
      totalCollected += received;
      totalRemaining += (remaining > 0 ? remaining : 0);

      const caution = parseNum(o.financial?.depositAmount || o.financial?.bankGuarantee);
      totalBankGuarantees += caution;

      // Authorization & Deliveries
      if (o.authorization === 'Oui') authorizedCount++;
      if (o.deliveryDate) deliveredCount++;
      if (o.hasStopRequest === 'Oui' || o.stopDate) stoppedCount++;

      // Status
      const st = o.status || 'En cours';
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      } else if (st === 'Attribution en cours') {
        statusCounts['Attribution en attente']++;
      } else {
        statusCounts['Autres']++;
      }

      if (st === 'En attente de paiement') pendingPaymentCount++;
      if (st === "En attente d'ODS" || st === "En attente d'ods") waitingOdsCount++;
      if (st === 'Attribution en attente' || st === 'Attribution en cours') attributionCount++;

      // Check Overdue
      const start = o.startDate || o.dateOds;
      const delay = parseInt(o.delay || 0);
      let calculatedEndDate = o.endDate;

      if (!calculatedEndDate && start && delay) {
        const d = new Date(start);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + delay);
          if (o.stopDate) {
            const stop = new Date(o.stopDate);
            const resume = o.resumeDate ? new Date(o.resumeDate) : new Date();
            if (!isNaN(stop.getTime()) && resume > stop) {
              d.setDate(d.getDate() + Math.ceil((resume - stop) / (1000 * 60 * 60 * 24)));
            }
          }
          calculatedEndDate = d.toISOString().split('T')[0];
        }
      }

      let isOverdue = false;
      if (calculatedEndDate && !o.deliveryDate) {
        const endD = new Date(calculatedEndDate);
        if (!isNaN(endD.getTime()) && endD < today) {
          isOverdue = true;
          overdueCount++;
          const daysLate = Math.ceil((today - endD) / (1000 * 60 * 60 * 24));
          overdueList.push({
            ...o,
            calculatedEndDate,
            daysLate
          });
        }
      }

      // High Risk detection
      if (isOverdue || (st === 'En cours' && !o.authorization) || (st === "En attente d'ODS" && amt > 10_000_000)) {
        highRiskList.push(o);
      }

      // Division Aggregates
      const divName = o.division || 'Non assigné';
      if (!divisionStats[divName]) {
        divisionStats[divName] = { count: 0, totalAmount: 0, delivered: 0, collected: 0 };
      }
      divisionStats[divName].count++;
      divisionStats[divName].totalAmount += amt;
      if (o.deliveryDate) divisionStats[divName].delivered++;
      divisionStats[divName].collected += received;

      // Client Aggregates
      const clientName = (o.client || 'Inconnu').trim();
      if (!clientStats[clientName]) {
        clientStats[clientName] = { name: clientName, count: 0, totalAmount: 0, remaining: 0 };
      }
      clientStats[clientName].count++;
      clientStats[clientName].totalAmount += amt;
      clientStats[clientName].remaining += (remaining > 0 ? remaining : 0);
    });

    const recoveryRate = totalPortfolioValue > 0 ? (totalCollected / totalPortfolioValue) * 100 : 0;
    const deliveryRate = totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0;
    const authRate = totalCount > 0 ? (authorizedCount / totalCount) * 100 : 0;
    const overdueRate = totalCount > 0 ? (overdueCount / totalCount) * 100 : 0;

    // Sort Top Clients
    const topClients = Object.values(clientStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 7);

    // Sort Overdue by urgency
    overdueList.sort((a, b) => b.daysLate - a.daysLate);

    return {
      totalCount,
      totalPortfolioValue,
      totalCollected,
      totalRemaining,
      totalBankGuarantees,
      recoveryRate,
      deliveryRate,
      authRate,
      overdueRate,
      authorizedCount,
      deliveredCount,
      pendingPaymentCount,
      stoppedCount,
      overdueCount,
      waitingOdsCount,
      attributionCount,
      divisionStats,
      topClients,
      statusCounts,
      overdueList,
      highRiskList
    };
  }, [filteredOrders]);

  // Export Full KPI Report to Excel
  const exportKpiExcel = () => {
    const summaryData = [
      { Paramètre: "Nombre Total de Dossiers", Valeur: stats.totalCount },
      { Paramètre: "Montant Global Portefeuille (DA)", Valeur: stats.totalPortfolioValue },
      { Paramètre: "Montant Total Encaissé (DA)", Valeur: stats.totalCollected },
      { Paramètre: "Reste Global à Recouvrer (DA)", Valeur: stats.totalRemaining },
      { Paramètre: "Taux de Recouvrement (%)", Valeur: stats.recoveryRate.toFixed(1) + ' %' },
      { Paramètre: "Taux de Livraison Réalisé (%)", Valeur: stats.deliveryRate.toFixed(1) + ' %' },
      { Paramètre: "Taux d'ODS Autorisés (%)", Valeur: stats.authRate.toFixed(1) + ' %' },
      { Paramètre: "Dossiers Hors Délais (Retard)", Valeur: stats.overdueCount },
      { Paramètre: "Cautions Bancaires / Garanties (DA)", Valeur: stats.totalBankGuarantees }
    ];

    const divisionData = Object.entries(stats.divisionStats).map(([div, data]) => ({
      Division: div,
      'Nombre Dossiers': data.count,
      'Montant Total (DA)': data.totalAmount,
      'Dossiers Livrés': data.delivered,
      'Taux Livraison (%)': data.count > 0 ? ((data.delivered / data.count) * 100).toFixed(1) + ' %' : '0 %',
      'Montant Encaissé (DA)': data.collected
    }));

    const clientData = stats.topClients.map(c => ({
      Client: c.name,
      'Nombre Contrats': c.count,
      'Montant Total (DA)': c.totalAmount,
      'Encours Restant (DA)': c.remaining
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Synthèse Globale");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(divisionData), "Par Division");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientData), "Top Clients");

    XLSX.writeFile(wb, `ESCLAB_Rapport_KPIs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-[1650px] mx-auto pb-20 space-y-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-ambient pointer-events-none"></div>
        <div className="absolute right-48 -bottom-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-400/30 text-xs font-extrabold uppercase tracking-widest text-blue-300">
              <TrendingUp size={15} /> Tableau de Bord Analytique & Décisionnel
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Analyse & KPIs <span className="text-blue-400">des Engagements</span>
            </h1>
            <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
              Indicateurs clés de performance opérationnelle, financière, respect des délais et maîtrise des risques contractuels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadData}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2 text-white active:scale-95 shadow-sm"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Actualiser
            </button>

            <button
              onClick={exportKpiExcel}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all text-white active:scale-95 flex items-center gap-2"
            >
              <Download size={16} />
              Exporter Rapport KPIs
            </button>
          </div>
        </div>

        {/* Global Macro Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Volume Portefeuille</span>
            <span className="text-2xl lg:text-3xl font-black text-white mt-1 block">
              {isLoading ? '...' : stats.totalCount} <span className="text-xs font-bold text-slate-400">dossiers</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">Chiffre d'Affaires</span>
            <span className="text-xl lg:text-2xl font-black text-white mt-1 block truncate" title={formatDA(stats.totalPortfolioValue)}>
              {isLoading ? '...' : formatMillions(stats.totalPortfolioValue)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">Total Encaissé</span>
            <span className="text-xl lg:text-2xl font-black text-emerald-400 mt-1 block truncate" title={formatDA(stats.totalCollected)}>
              {isLoading ? '...' : formatMillions(stats.totalCollected)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">Reste à Recouvrer</span>
            <span className="text-xl lg:text-2xl font-black text-amber-400 mt-1 block truncate" title={formatDA(stats.totalRemaining)}>
              {isLoading ? '...' : formatMillions(stats.totalRemaining)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest block">Taux de Livraison</span>
            <span className="text-2xl lg:text-3xl font-black text-teal-400 mt-1 block">
              {isLoading ? '...' : `${stats.deliveryRate.toFixed(0)}%`}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-red-300 uppercase tracking-widest block">Dossiers en Retard</span>
            <span className="text-2xl lg:text-3xl font-black text-red-400 mt-1 block">
              {isLoading ? '...' : stats.overdueCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Controller */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Analytical Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BarChart3 size={16} />
            Synthèse & Portefeuille
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'financial'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <DollarSign size={16} />
            Santé Financière & Recouvrement
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'operations'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Clock size={16} />
            Opérations & Délais
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'risks'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <AlertTriangle size={16} />
            Risques & Alertes ({stats.overdueCount})
          </button>
        </div>

        {/* Global Dimensional Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Division filter */}
          <div className="relative flex-1 sm:w-48">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={selectedDivision}
              onChange={e => setSelectedDivision(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-extrabold text-xs uppercase tracking-wider"
            >
              <option value="ALL">Toutes Divisions</option>
              {availableDivisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div className="relative flex-1 sm:w-36">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-extrabold text-xs uppercase tracking-wider"
            >
              <option value="ALL">Toutes Années</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative flex-1 sm:w-44">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-extrabold text-xs uppercase tracking-wider"
            >
              <option value="ALL">Tous Statuts</option>
              <option value="En cours">En cours</option>
              <option value="En attente de paiement">Attente Paiement</option>
              <option value="En attente d'ODS">Attente ODS</option>
              <option value="Attribution en attente">Attribution</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & PORTFOLIO */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Rate Gauges & KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Taux de Recouvrement */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Taux de Recouvrement</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-slate-900">{stats.recoveryRate.toFixed(1)}%</span>
                  <span className="text-xs font-extrabold text-emerald-600">encaissé</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats.recoveryRate)}%` }}></div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                <span>Encaissé: {formatMillions(stats.totalCollected)}</span>
                <span>Reste: {formatMillions(stats.totalRemaining)}</span>
              </div>
            </div>

            {/* Taux de Livraison */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Taux d'Achèvement (Livré)</span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <PackageCheck size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-slate-900">{stats.deliveryRate.toFixed(1)}%</span>
                  <span className="text-xs font-extrabold text-blue-600">des dossiers</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats.deliveryRate)}%` }}></div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                <span>{stats.deliveredCount} livrés</span>
                <span>{stats.totalCount - stats.deliveredCount} en cours</span>
              </div>
            </div>

            {/* Taux d'Autorisation */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Taux d'Autorisation ODS</span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-slate-900">{stats.authRate.toFixed(1)}%</span>
                  <span className="text-xs font-extrabold text-indigo-600">validés</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats.authRate)}%` }}></div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                <span>{stats.authorizedCount} autorisés</span>
                <span>{stats.totalCount - stats.authorizedCount} en attente</span>
              </div>
            </div>

            {/* Taux de Retard */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Conformité des Délais</span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${stats.overdueCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-slate-900">{(100 - stats.overdueRate).toFixed(1)}%</span>
                  <span className={`text-xs font-extrabold ${stats.overdueCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {stats.overdueCount} en retard
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, stats.overdueRate)}%` }}></div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
                <span>{stats.stoppedCount} avec arrêt</span>
                <span className="text-red-600 font-extrabold">{stats.overdueCount} alertes</span>
              </div>
            </div>
          </div>

          {/* Division Breakdown & Top Clients Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Division Analysis */}
            <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Répartition par Division</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Ventilation des montants et volumes contractuels</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-black text-slate-600">
                  {Object.keys(stats.divisionStats).length} divisions
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(stats.divisionStats).map(([divName, divData]) => {
                  const sharePct = stats.totalPortfolioValue > 0 ? (divData.totalAmount / stats.totalPortfolioValue) * 100 : 0;
                  const divDelivPct = divData.count > 0 ? (divData.delivered / divData.count) * 100 : 0;

                  return (
                    <div key={divName} className="p-5 bg-slate-50/70 border border-slate-200/60 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{divName}</h4>
                            <span className="text-[11px] font-bold text-slate-500">{divData.count} contrats ({sharePct.toFixed(1)}% du CA global)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">{formatDA(divData.totalAmount)}</span>
                          <span className="text-[11px] font-bold text-emerald-600 block">Encaissé: {formatMillions(divData.collected)}</span>
                        </div>
                      </div>

                      {/* Division progress bar */}
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${divDelivPct}%` }} title={`Livrés: ${divDelivPct.toFixed(0)}%`}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2">
                        <span>Taux Livraison: {divDelivPct.toFixed(0)}% ({divData.delivered}/{divData.count})</span>
                        <span>Part du Chiffre d'Affaires: {sharePct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Clients by Value */}
            <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Clients</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Plus grands comptes par montant engagé</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-black">
                  Valeur DA
                </span>
              </div>

              <div className="space-y-3.5">
                {stats.topClients.map((client, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/60 rounded-2xl border border-slate-100 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 line-clamp-1">{client.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500">{client.count} contrat(s)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">{formatDA(client.totalAmount)}</span>
                      {client.remaining > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 block">Reste: {formatMillions(client.remaining)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FINANCIAL HEALTH */}
      {activeTab === 'financial' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-200 block mb-2">Total Recouvré</span>
              <span className="text-3xl font-black block mb-4">{formatDA(stats.totalCollected)}</span>
              <p className="text-xs text-emerald-100 font-medium">Fonds réels encaissés sur le compte bancaire.</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-700 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden">
              <span className="text-xs font-black uppercase tracking-widest text-amber-200 block mb-2">Créances Clients (Reste)</span>
              <span className="text-3xl font-black block mb-4">{formatDA(stats.totalRemaining)}</span>
              <p className="text-xs text-amber-100 font-medium">Montant total des paiements en attente de validation ou règlement.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-200 block mb-2">Cautions & Garanties Bancaires</span>
              <span className="text-3xl font-black block mb-4">{formatDA(stats.totalBankGuarantees)}</span>
              <p className="text-xs text-indigo-100 font-medium">Cautions de bonne exécution et garanties actuellement engagées.</p>
            </div>
          </div>

          {/* Detailed Financial Tracking Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm overflow-hidden p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Suivi Financier & Encaissements par Dossier</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Dossiers avec situation de paiement en cours</p>
              </div>
              <button
                onClick={() => navigate('/suivi-financier')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
              >
                Voir page Suivi Financier <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Réf ODS</th>
                    <th className="py-4 px-6">Client</th>
                    <th className="py-4 px-6 text-right">Montant Global</th>
                    <th className="py-4 px-6 text-right">Encaissé</th>
                    <th className="py-4 px-6 text-right">Reste</th>
                    <th className="py-4 px-6 text-center">Statut Paiement</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.slice(0, 15).map(o => {
                    const amt = parseNum(o.amount);
                    const rec = parseNum(o.financial?.amountReceived);
                    const rem = o.financial?.remainingAmount !== undefined ? parseNum(o.financial.remainingAmount) : (amt - rec);
                    const payStatus = o.financial?.paymentStatus || (rec >= amt && amt > 0 ? 'Total' : rec > 0 ? 'Partiel' : 'Non payé');

                    return (
                      <tr key={o.id} onClick={() => navigate(`/order/${o.id}`)} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                        <td className="py-4 px-6 font-black text-xs text-slate-900">{o.refOds || o.ref || '-'}</td>
                        <td className="py-4 px-6 font-bold text-xs text-slate-800">{o.client || '-'}</td>
                        <td className="py-4 px-6 text-right font-black text-xs text-slate-900">{formatDA(amt)}</td>
                        <td className="py-4 px-6 text-right font-bold text-xs text-emerald-600">{formatDA(rec)}</td>
                        <td className="py-4 px-6 text-right font-bold text-xs text-amber-600">{formatDA(rem)}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            payStatus === 'Total' ? 'bg-emerald-100 text-emerald-800' :
                            payStatus === 'Partiel' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {payStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold transition-all">
                            <ExternalLink size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONS & TIMELINES */}
      {activeTab === 'operations' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Dossiers Livrés</span>
              <span className="text-3xl font-black text-slate-900">{stats.deliveredCount}</span>
              <span className="text-xs font-bold text-emerald-600 block mt-1">Conformes et livrés</span>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">En Cours d'Exécution</span>
              <span className="text-3xl font-black text-blue-600">{stats.statusCounts['En cours']}</span>
              <span className="text-xs font-bold text-blue-500 block mt-1">Projets actifs</span>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">En Attente d'ODS</span>
              <span className="text-3xl font-black text-purple-600">{stats.waitingOdsCount}</span>
              <span className="text-xs font-bold text-purple-500 block mt-1">Contrats signés</span>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Dossiers Suspendus</span>
              <span className="text-3xl font-black text-amber-600">{stats.stoppedCount}</span>
              <span className="text-xs font-bold text-amber-500 block mt-1">ODS d'arrêt émis</span>
            </div>
          </div>

          {/* Operational Workflow Health */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Cycle de Vie & Étapes Logistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Importations & Dédouanement</h4>
                    <span className="text-xs font-bold text-slate-400">Suivi des autorisations d'import</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Contrôle des domiciliations bancaires, dossiers transitaires et dates prévisionnelles de passage en douane.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Réception & Stock</h4>
                    <span className="text-xs font-bold text-slate-400">Stockage et disponibilité</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Réception en magasin, vérification des articles physiques et préparation aux livraisons clients.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Livraisons & PV</h4>
                    <span className="text-xs font-bold text-slate-400">Validation finale</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Émission des Bons de Livraison (BL), PV Provisoires et PV Définitifs signés avec le client.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: RISKS & ALERTS */}
      {activeTab === 'risks' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <FileWarning size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-red-900 tracking-tight">Dossiers Hors Délais & Risques de Pénalités</h3>
                <p className="text-xs font-bold text-red-700 mt-0.5">
                  {stats.overdueList.length} dossier(s) ont dépassé leur date limite de livraison sans confirmation de livraison
                </p>
              </div>
            </div>

            {stats.overdueList.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl text-center text-slate-500 font-bold text-sm">
                🎉 Aucun dossier n'est actuellement en retard ! Félicitations pour la gestion des délais.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-6">Réf ODS</th>
                        <th className="py-3.5 px-6">Client</th>
                        <th className="py-3.5 px-6">Division</th>
                        <th className="py-3.5 px-6 text-right">Montant</th>
                        <th className="py-3.5 px-6">Date Limite Prévue</th>
                        <th className="py-3.5 px-6 text-center">Retard Constaté</th>
                        <th className="py-3.5 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.overdueList.map(o => (
                        <tr key={o.id} onClick={() => navigate(`/order/${o.id}`)} className="hover:bg-red-50/40 cursor-pointer transition-colors">
                          <td className="py-4 px-6 font-black text-xs text-red-900">{o.refOds || o.ref || '-'}</td>
                          <td className="py-4 px-6 font-bold text-xs text-slate-800">{o.client || '-'}</td>
                          <td className="py-4 px-6 text-xs font-bold text-slate-600">{o.division || '-'}</td>
                          <td className="py-4 px-6 text-right font-black text-xs text-slate-900">{formatDA(parseNum(o.amount))}</td>
                          <td className="py-4 px-6 text-xs font-semibold text-slate-500">{o.calculatedEndDate || '-'}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="px-3 py-1 bg-red-100 text-red-800 font-black text-xs rounded-full">
                              +{o.daysLate} jours
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all">
                              Examiner
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default Kpis;
