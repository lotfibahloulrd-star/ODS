import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { 
  UserCheck, 
  FilePlus, 
  Package, 
  PlayCircle, 
  CreditCard, 
  ShieldCheck, 
  Search, 
  Filter, 
  FileDown, 
  Eye, 
  RefreshCw, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';

export const CATEGORIES_CONFIG = {
  attribution: {
    key: 'attribution',
    path: '/attribution',
    title: 'Attribution en attente',
    subtitle: 'Consultations en cours de validation finale et attributions préliminaires',
    icon: UserCheck,
    color: 'from-slate-700 via-slate-800 to-slate-950',
    accentColor: 'text-slate-400',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    pillColor: 'bg-slate-800 text-white',
    filterFn: (o) => {
      const status = (o.status || '').trim();
      return status === 'Attribution en attente' || status === 'Attribution en cours';
    }
  },
  'nouveaux-contrats': {
    key: 'nouveaux-contrats',
    path: '/nouveaux-contrats',
    title: 'Nouveaux Contrats',
    subtitle: 'Contrats récents et affaires nouvellement enregistrées (moins de 30 jours)',
    icon: FilePlus,
    color: 'from-teal-600 via-emerald-700 to-slate-900',
    accentColor: 'text-emerald-300',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pillColor: 'bg-emerald-600 text-white',
    filterFn: (o) => {
      if (o.status === 'Nouveaux Contrats') return true;
      if (!o.createdAt) return false;
      const diffDays = (new Date() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }
  },
  'en-attente-ods': {
    key: 'en-attente-ods',
    path: '/en-attente-ods',
    title: "En attente d'ODS",
    subtitle: "Contrats signés et notifiés en attente de l'ordre de service pour démarrage",
    icon: Package,
    color: 'from-purple-600 via-fuchsia-700 to-slate-900',
    accentColor: 'text-purple-300',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    pillColor: 'bg-purple-600 text-white',
    filterFn: (o) => {
      const status = (o.status || '').trim().toLowerCase();
      return status === "en attente d'ods" || status === "en attente d'od";
    }
  },
  'en-cours': {
    key: 'en-cours',
    path: '/en-cours',
    title: 'En cours',
    subtitle: 'Projets actifs, prestations en exécution et livraisons programmées',
    icon: PlayCircle,
    color: 'from-blue-600 via-indigo-700 to-slate-900',
    accentColor: 'text-blue-300',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    pillColor: 'bg-blue-600 text-white',
    filterFn: (o) => {
      const status = (o.status || 'En cours').trim();
      return status === 'En cours';
    }
  },
  'en-attente-paiement': {
    key: 'en-attente-paiement',
    path: '/en-attente-paiement',
    title: 'En attente de paiement',
    subtitle: 'Engagements et prestations livrées ou validées en attente de règlement client',
    icon: CreditCard,
    color: 'from-amber-600 via-orange-700 to-slate-900',
    accentColor: 'text-amber-300',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    pillColor: 'bg-amber-600 text-white',
    filterFn: (o) => {
      const status = (o.status || '').trim();
      return status === 'En attente de paiement';
    }
  },
  'suivi-financier': {
    key: 'suivi-financier',
    path: '/suivi-financier',
    title: 'Suivi Financier',
    subtitle: 'Gestion globale des paiements, encaissements, cautions et garanties bancaires',
    icon: ShieldCheck,
    color: 'from-emerald-600 via-teal-700 to-slate-900',
    accentColor: 'text-teal-300',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    pillColor: 'bg-teal-600 text-white',
    filterFn: (o) => {
      if (o.status === 'Suivi financier') return true;
      if (o.status === 'En attente de paiement' && o.financial?.paymentStatus !== 'Total') return true;
      return Boolean(o.financial && Object.keys(o.financial).length > 0 && o.financial.amountReceived !== undefined);
    }
  }
};

const ContractStatusPage = ({ categoryKey: propCategoryKey }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine category key from prop or route pathname
  const categoryKey = useMemo(() => {
    if (propCategoryKey) return propCategoryKey;
    const path = location.pathname.replace(/^\//, '');
    return CATEGORIES_CONFIG[path] ? path : 'en-cours';
  }, [propCategoryKey, location.pathname]);

  const currentCategory = CATEGORIES_CONFIG[categoryKey] || CATEGORIES_CONFIG['en-cours'];
  const CategoryIcon = currentCategory.icon;

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [authFilter, setAuthFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadContractId, setUploadContractId] = useState(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading orders for category page:", e);
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
        window.addEventListener('ods_data_updated', loadOrders);
        return () => window.removeEventListener('ods_data_updated', loadOrders);
    }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter allowed orders by user permissions and category
  const categoryOrders = useMemo(() => {
    return orders
      .filter(o => auth.canViewOrder ? auth.canViewOrder(o) : true)
      .filter(currentCategory.filterFn);
  }, [orders, auth, currentCategory]);

  // Filter by user interactive filters (search, division, authorization)
  const filteredOrders = useMemo(() => {
    return categoryOrders.filter(o => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        (o.client || '').toLowerCase().includes(term) ||
        (o.object || '').toLowerCase().includes(term) ||
        (o.refOds || o.ref || '').toLowerCase().includes(term) ||
        (o.refContract || '').toLowerCase().includes(term) ||
        (o.division || '').toLowerCase().includes(term)
      );
      if (!matchesSearch) return false;

      if (divisionFilter && o.division !== divisionFilter) return false;
      if (authFilter === 'yes' && o.authorization !== 'Oui') return false;
      if (authFilter === 'no' && o.authorization === 'Oui') return false;

      return true;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [categoryOrders, searchTerm, divisionFilter, authFilter]);

  // Computed metrics for this category
  const metrics = useMemo(() => {
    const totalCount = categoryOrders.length;
    const filteredCount = filteredOrders.length;
    
    let totalAmount = 0;
    categoryOrders.forEach(o => {
      if (o.amount) {
        const clean = String(o.amount).replace(/[^\d.,]/g, '').replace(',', '.');
        const num = parseFloat(clean);
        if (!isNaN(num)) totalAmount += num;
      }
    });

    const authorizedCount = categoryOrders.filter(o => o.authorization === 'Oui').length;
    const deliveredCount = categoryOrders.filter(o => o.deliveryDate).length;

    return { totalCount, filteredCount, totalAmount, authorizedCount, deliveredCount };
  }, [categoryOrders, filteredOrders]);

  // Unique divisions present
  const availableDivisions = useMemo(() => {
    const divs = new Set();
    categoryOrders.forEach(o => {
      if (o.division) divs.add(o.division);
    });
    return Array.from(divs);
  }, [categoryOrders]);

  const openPdf = (e, orderId, storageKey) => {
    e.stopPropagation();
    const baseUrl = import.meta.env.BASE_URL || '/';
    const apiPath = baseUrl.endsWith('/') ? `${baseUrl}api.php` : `${baseUrl}/api.php`;
    const fileUrl = `${apiPath}?action=get_file&orderId=${orderId}&storageKey=${storageKey}`;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Visualisation Document PDF</title></head>
          <body style="margin:0; background:#0f172a; display:flex; justify-content:center; align-items:center; font-family:sans-serif; height:100vh;">
            <embed src="${fileUrl}" width="100%" height="100%" type="application/pdf" />
          </body>
        </html>
      `);
    } else {
      window.location.href = fileUrl;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr === 'object') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    } catch { return '-'; }
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null || typeof amount === 'object') return '-';
    try {
      const clean = amount.toString().replace(/[^\d.,]/g, '').replace(',', '.');
      const num = parseFloat(clean);
      if (isNaN(num)) return String(amount);
      return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(num) + ' DA';
    } catch { return String(amount); }
  };

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("Aucun dossier à exporter.");
      return;
    }
    const dataToExport = filteredOrders.map(o => ({
      'Réf ODS': o.refOds || o.ref || '',
      'Réf Contrat': o.refContract || '',
      'Client': o.client || '',
      'Objet': o.object || '',
      'Division': o.division || '',
      'Montant (DA)': o.amount || '',
      'Statut': o.status || 'En cours',
      'Autorisé': o.authorization || 'Non',
      'Date Création': formatDate(o.createdAt),
      'Date Début': formatDate(o.startDate || o.dateOds),
      'Délai (jours)': o.delay || '',
      'Date Livraison': formatDate(o.deliveryDate)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentCategory.title.substring(0, 31));
    XLSX.writeFile(wb, `ESCLAB_${currentCategory.key}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-[1650px] mx-auto pb-16 space-y-8 animate-fade-in font-sans">
      
      {/* Navigation Breadcrumb & Category Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
          <button 
            onClick={() => navigate('/home')} 
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Accueil</span>
          </button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900 font-black">{currentCategory.title}</span>
        </div>

        {/* Quick Tabs to other categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {Object.values(CATEGORIES_CONFIG).map(cat => {
            const isActive = cat.key === categoryKey;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => navigate(cat.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                  isActive 
                    ? `${cat.pillColor} shadow-md` 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <CatIcon size={14} />
                <span className="hidden sm:inline">{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Banner with Custom Category Styling */}
      <div className={`bg-gradient-to-br ${currentCategory.color} rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-ambient pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-xs font-extrabold uppercase tracking-widest text-white">
              <CategoryIcon size={15} /> Page Dédiée
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {currentCategory.title}
            </h1>
            <p className="text-slate-200 font-medium text-sm md:text-base leading-relaxed">
              {currentCategory.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadOrders}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2 text-white active:scale-95 shadow-sm"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Actualiser
            </button>

            <button
              onClick={exportToExcel}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all text-white active:scale-95 flex items-center gap-2"
            >
              <Download size={16} />
              Exporter Excel
            </button>

            {auth.canCreateOds && auth.canCreateOds() && (
              <button
                onClick={() => navigate('/ods/new')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all text-white active:scale-95 flex items-center gap-2"
              >
                + Nouvel ODS
              </button>
            )}
          </div>
        </div>

        {/* Live Category KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Total Dossiers</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {isLoading ? '...' : metrics.totalCount}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Montant Cumulé</span>
            <span className="text-2xl font-black text-white mt-1 block truncate">
              {isLoading ? '...' : (new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(metrics.totalAmount) + ' DA')}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Autorisations Confirmées</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {isLoading ? '...' : metrics.authorizedCount}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Prestations Livrées</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {isLoading ? '...' : metrics.deliveredCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={`Rechercher dans "${currentCategory.title}" par client, objet, réf ODS...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-semibold focus:bg-white text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {availableDivisions.length > 0 && (
            <div className="relative flex-1 md:w-48">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={divisionFilter}
                onChange={e => setDivisionFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-extrabold text-xs uppercase tracking-wider"
              >
                <option value="">Toutes divisions</option>
                {availableDivisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>
          )}

          <div className="relative flex-1 md:w-44">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={authFilter}
              onChange={e => setAuthFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-extrabold text-xs uppercase tracking-wider"
            >
              <option value="">Toutes autorisations</option>
              <option value="yes">Autorisé (Oui)</option>
              <option value="no">Non Autorisé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${currentCategory.pillColor.split(' ')[0]}`}></span>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Liste des dossiers ({filteredOrders.length})
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Affichage de {filteredOrders.length} sur {categoryOrders.length} dossiers
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-extrabold text-sm uppercase tracking-wider">Chargement des dossiers...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <CategoryIcon size={48} className="text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-black text-slate-700 uppercase tracking-tight mb-1">
              Aucun dossier trouvé
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Aucun dossier ne correspond à la catégorie "{currentCategory.title}" ou aux filtres appliqués.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Réf ODS</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Objet du Contrat</th>
                  <th className="py-4 px-6">Division</th>
                  <th className="py-4 px-6 text-right">Montant</th>
                  <th className="py-4 px-6 text-center">Autorisation</th>
                  <th className="py-4 px-6">Date Création</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/order/${o.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      <div className="flex flex-col">
                        <span>{o.refOds || o.ref || 'N/A'}</span>
                        {o.refContract && (
                          <span className="text-[10px] text-slate-400 font-bold">Contrat: {o.refContract}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-xs text-slate-800">
                      {o.client || '-'}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 font-medium max-w-xs truncate">
                      {o.object || '-'}
                    </td>

                    <td className="py-4 px-6 text-xs font-bold text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px]">
                        {o.division || 'Général'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-black text-xs text-slate-900">
                      {formatAmount(o.amount)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        o.authorization === 'Oui' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {o.authorization === 'Oui' ? '✓ Autorisé' : 'En attente'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                      {formatDate(o.createdAt || o.dateOds)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => openPdf(e, o.id, 'storage_ods')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
                          title="Voir le document PDF"
                        >
                          <FileDown size={14} /> PDF
                        </button>
                        <button
                          onClick={() => navigate(`/order/${o.id}`)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl transition-all"
                          title="Ouvrir les détails"
                        >
                          <Eye size={16} />
                        </button>
                        {auth.canUploadDocuments && auth.canUploadDocuments() && (
                          <button
                            onClick={() => setUploadContractId(o.id)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold"
                            title="Uploader un document"
                          >
                            📎
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {uploadContractId && (
        <DocumentUpload 
          contractId={uploadContractId} 
          userEmail={auth.currentUser?.email} 
          onClose={() => setUploadContractId(null)} 
        />
      )}
    </div>
  );
};

export default ContractStatusPage;


