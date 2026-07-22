import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { logService } from '../services/logService';
import { tenderService } from '../services/tenderService';
import * as XLSX from 'xlsx';


const Ods = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = auth?.currentUser;

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await orderService.getAllOrders();
    setOrders(Array.isArray(data) ? data : []);
    setIsLoading(false);
  };

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
      return matchesSearch && auth.canViewOrder(o);
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

  const groupedOrders = useMemo(() => {
    const sections = [
      { id: 'payment', label: "En attente de paiement", color: 'bg-amber-600' },
      { id: 'financial', label: "Suivi financier", color: 'bg-emerald-600' },
      { id: 'ongoing', label: "En cours", color: 'bg-blue-600' },
      { id: 'waiting_ods', label: "En attente d'ODS", color: 'bg-indigo-600' },
      { id: 'attribution', label: "Attribution en cours", color: 'bg-slate-600' },
    ];
    const grouped = {
      "En attente de paiement": [],
      "Suivi financier": [],
      "En cours": [],
      "En attente d'ODS": [],
      "Attribution en cours": [],
    };
    filteredOrders.forEach(o => {
      const status = o.status || 'En cours';
      let groupStatus = status;
      if (groupStatus === "En attente d'ods") groupStatus = "En attente d'ODS";
      if (groupStatus === "Attribution en attente") groupStatus = "Attribution en cours";
      if (grouped[groupStatus]) grouped[groupStatus].push(o);
      else grouped['En cours'].push(o);
    });
    return sections.map(s => ({ ...s, orders: grouped[s.label] }));
  }, [filteredOrders]);

  const openPdf = (orderId, storageKey) => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const apiPath = baseUrl.endsWith('/') ? `${baseUrl}api.php` : `${baseUrl}/api.php`;
    const fileUrl = `${apiPath}?action=get_file&orderId=${orderId}&storageKey=${storageKey}`;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Visualisation Document</title></head>
          <body style="margin:0; background:#e2e8f0; display:flex; justify-content:center; align-items:center; font-family:sans-serif;">
            <embed src="${fileUrl}" width="100%" height="100%" type="application/pdf" />
            <div style="position:fixed; bottom:30px; right:30px; display:flex; gap:15px; align-items:center;">
              <a href="${fileUrl}" download style="background:#2563eb; color:white; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:bold; box-shadow:0 10px 15px -3px rgba(37,99,235,0.4); transition:all 0.3s; font-size:14px;">Télécharger le fichier</a>
              <button onclick="window.close()" style="background:white; color:#64748b; padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; font-weight:bold; cursor:pointer; font-size:14px;">Fermer</button>
            </div>
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

  const exportToExcel = () => {
    const data = filteredOrders.map(o => ({
      Réf: o.refOds || o.ref || '-',
      Client: o.client || '-',
      Objet: o.object || '-',
      Montant: formatAmount(o.amount),
      Date: formatDate(o.createdAt),
      Statut: o.status || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ODS');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ods_export.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Tableau ODS</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Recherche…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <select
            value={activeStatusFilter}
            onChange={e => setActiveStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Tous les statuts</option>
            <option value="En attente de paiement">En attente de paiement</option>
            <option value="Suivi financier">Suivi financier</option>
            <option value="En cours">En cours</option>
            <option value="En attente d'ODS">En attente d'ODS</option>
            <option value="Attribution en cours">Attribution en cours</option>
          </select>
          {auth.canExportData && auth.canExportData() && (
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-6 py-2 rounded-[2rem] font-black flex items-center gap-2 hover:bg-green-700 transition-all"
            >
              Exporter Excel
            </button>
          )}
        </div>
      </div>
      {isLoading ? (
        <p>Chargement…</p>
      ) : (
        groupedOrders.map(section => (
          <section key={section.id} className="mb-8">
            <h3 className={`text-xl font-semibold ${section.color} text-white p-2 rounded`}>{section.label} ({section.orders.length})</h3>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Réf.</th>
                  <th className="p-2 text-left">Client</th>
                  <th className="p-2 text-left">Objet</th>
                  <th className="p-2 text-left">Montant</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {section.orders.map(o => (
                  <tr key={o.id} className="border-b">
                    <td className="p-2">{o.refOds || o.ref || '-'}</td>
                    <td className="p-2">{o.client || '-'}</td>
                    <td className="p-2">{o.object || '-'}</td>
                    <td className="p-2">{formatAmount(o.amount)}</td>
                    <td className="p-2">{formatDate(o.createdAt)}</td>
                    <td className="p-2">
                      <button onClick={() => openPdf(o.id, 'storage_ods')} className="text-blue-600 hover:underline">PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </div>
  );
};

export default Ods;
