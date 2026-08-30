import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Search, 
  Filter, 
  FileDown, 
  ExternalLink, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  Eye
} from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';

const Ods = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadContractId, setUploadContractId] = useState(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading ODS orders:", e);
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

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (
        (o.client || '').toLowerCase().includes(search) ||
        (o.object || '').toLowerCase().includes(search) ||
        (o.refOds || o.ref || '').toLowerCase().includes(search) ||
        (o.refContract || '').toLowerCase().includes(search)
      );
      if (activeStatusFilter) {
        const effectiveStatus = o.status || 'En cours';
        if (effectiveStatus !== activeStatusFilter) return false;
      }
      return matchesSearch && (auth.canViewOrder ? auth.canViewOrder(o) : true);
    }).sort((a, b) => {
      const getRank = order => {
        if (order.deliveryDate) return 1;
        if (order.authorization === 'Oui') return 2;
        return 3;
      };
      const rankA = getRank(a);
      const rankB = getRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [orders, searchTerm, activeStatusFilter, auth]);

  const summaryStats = useMemo(() => {
    const total = filteredOrders.length;
    const payment = filteredOrders.filter(o => o.status === 'En attente de paiement').length;
    const financial = filteredOrders.filter(o => o.status === 'Suivi financier').length;
    const ongoing = filteredOrders.filter(o => (o.status || 'En cours') === 'En cours').length;
    const waitingOds = filteredOrders.filter(o => o.status === "En attente d'ODS" || o.status === "En attente d'ods").length;
    const newContracts = filteredOrders.filter(o => o.status === 'Nouveaux Contrats' || (o.createdAt && (new Date() - new Date(o.createdAt))/(1000*60*60*24) <= 30)).length;
    return { total, payment, financial, ongoing, waitingOds, newContracts };
  }, [filteredOrders]);

  const groupedOrders = useMemo(() => {
    const sections = [
      { id: 'payment', label: "En attente de paiement", color: 'bg-amber-500', textCol: 'text-amber-700', bgBadge: 'bg-amber-50 border-amber-200' },
      { id: 'financial', label: "Suivi financier", color: 'bg-emerald-500', textCol: 'text-emerald-700', bgBadge: 'bg-emerald-50 border-emerald-200' },
      { id: 'ongoing', label: "En cours", color: 'bg-blue-500', textCol: 'text-blue-700', bgBadge: 'bg-blue-50 border-blue-200' },
      { id: 'waiting_ods', label: "En attente d'ODS", color: 'bg-purple-500', textCol: 'text-purple-700', bgBadge: 'bg-purple-50 border-purple-200' },
      { id: 'new_contracts', label: "Nouveaux Contrats", color: 'bg-teal-500', textCol: 'text-teal-700', bgBadge: 'bg-teal-50 border-teal-200' },
      { id: 'attribution', label: "Attribution en cours", color: 'bg-slate-600', textCol: 'text-slate-700', bgBadge: 'bg-slate-50 border-slate-200' },
    ];
    const grouped = {
      "En attente de paiement": [],
      "Suivi financier": [],
      "En cours": [],
      "En attente d'ODS": [],
      "Nouveaux Contrats": [],
      "Attribution en cours": [],
    };
    filteredOrders.forEach(o => {
      const status = o.status || 'En cours';
      let groupStatus = status;
      if (groupStatus === "En attente d'ods") groupStatus = "En attente d'ODS";
      if (groupStatus === "Attribution en attente") groupStatus = "Attribution en cours";
      if (grouped[groupStatus]) grouped[groupStatus].push(o);
      else if (o.createdAt && (new Date() - new Date(o.createdAt))/(1000*60*60*24) <= 30) {
        grouped["Nouveaux Contrats"].push(o);
      }
      else grouped['En cours'].push(o);
    });
    return sections.map(s => ({ ...s, orders: grouped[s.label] }));
  }, [filteredOrders]);

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

  const formatDate = dateStr => {
    if (!dateStr || typeof dateStr === 'object') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    } catch { return '-'; }
  };

  const formatAmount = amount => {
    if (amount === undefined || amount === null || typeof amount === 'object') return '-';
    try {
      const clean = amount.toString().replace(/[^\d.,]/g, '').replace(',', '.');
      const num = parseFloat(clean);
      if (isNaN(num)) return String(amount);
      return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(num) + ' DA';
    } catch { return String(amount); }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-16 space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-ambient"></div>
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-extrabold uppercase tracking-widest text-blue-300">
              <FileText size={14} /> Répertoire des engagements
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Tableau des Ordres de Service <span className="text-blue-400">(ODS)</span>
            </h1>
            <p className="text-slate-300 font-medium text-sm md:text-base max-w-2xl">
              Consultez, filtrez et gérez l'ensemble des ODS de votre organisation avec leur état d'avancement et les documents associés.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2 text-white active:scale-95"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Actualiser
            </button>
            {auth.canCreateOds && auth.canCreateOds() && (
              <button
                onClick={() => navigate('/ods/new')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all text-white active:scale-95 flex items-center gap-2"
              >
                + Créer un ODS
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total ODS</span>
            <span className="text-2xl font-black text-white mt-1 block">{summaryStats.total}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest block">Nouveaux</span>
            <span className="text-2xl font-black text-teal-400 mt-1 block">{summaryStats.newContracts}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">En Cours</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block">{summaryStats.ongoing}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">Attente Paiement</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{summaryStats.payment}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">Suivi Financier</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{summaryStats.financial}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block">Attente ODS</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">{summaryStats.waitingOds}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par client, objet, réf ODS, réf contrat..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-2xl text-slate-900 font-semibold focus:bg-white text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={activeStatusFilter}
              onChange={e => setActiveStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-slate-50 border-slate-200 rounded-2xl text-slate-800 font-extrabold text-xs uppercase tracking-wider"
            >
              <option value="">Tous les statuts ({summaryStats.total})</option>
              <option value="Nouveaux Contrats">Nouveaux Contrats ({summaryStats.newContracts})</option>
              <option value="En attente de paiement">Attente Paiement ({summaryStats.payment})</option>
              <option value="Suivi financier">Suivi Financier ({summaryStats.financial})</option>
              <option value="En cours">En cours ({summaryStats.ongoing})</option>
              <option value="En attente d'ODS">Attente ODS ({summaryStats.waitingOds})</option>
              <option value="Attribution en cours">Attribution en cours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Tables */}
      {isLoading ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-slate-200/80">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-extrabold text-sm uppercase tracking-wider">Chargement des dossiers ODS...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedOrders.map(section => {
            if (activeStatusFilter && section.orders.length === 0) return null;
            return (
              <section key={section.id} className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Section Header */}
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${section.color} shadow-sm`}></span>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{section.label}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${section.bgBadge} ${section.textCol}`}>
                      {section.orders.length} {section.orders.length > 1 ? 'dossiers' : 'dossier'}
                    </span>
                  </div>
                </div>

                {/* Table */}
                {section.orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                    Aucun dossier dans cette catégorie
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-6">Réf ODS</th>
                          <th className="py-3.5 px-6">Client</th>
                          <th className="py-3.5 px-6">Objet du Contrat</th>
                          <th className="py-3.5 px-6 text-right">Montant</th>
                          <th className="py-3.5 px-6">Date Création</th>
                          <th className="py-3.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {section.orders.map(o => (
                          <tr
                            key={o.id}
                            onClick={() => navigate(`/order/${o.id}`)}
                            className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                          >
                            <td className="py-4 px-6 font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                              {o.refOds || o.ref || 'N/A'}
                            </td>
                            <td className="py-4 px-6 font-bold text-xs text-slate-800">
                              {o.client || '-'}
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600 font-medium max-w-xs truncate">
                              {o.object || '-'}
                            </td>
                            <td className="py-4 px-6 text-right font-black text-xs text-slate-900">
                              {formatAmount(o.amount)}
                            </td>
                            <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                              {formatDate(o.createdAt)}
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
                                  title="Détails"
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
              </section>
            );
          })}
        </div>
      )}
      {uploadContractId && (
        <DocumentUpload contractId={uploadContractId} userEmail={auth.currentUser?.email} onClose={() => setUploadContractId(null)} />
      )}
    </div>
  );
};

export default Ods;


