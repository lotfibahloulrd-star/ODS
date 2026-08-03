import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * DocumentUpload component – uploads a file for a given contract.
 * Props:
 *   - contractId: ID of the contract to upload documents for.
 *   - userEmail: Email of the logged‑in user (used for backend authorization).
 *   - onClose: Callback to close the upload modal.
 */
export default function DocumentUpload({ contractId, userEmail, onClose }) {
  const [docType, setDocType] = useState('Bon de livraison');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Veuillez sélectionner un fichier.');
      return;
    }
    setStatus('uploading');
    const formData = new FormData();
    formData.append('contract_id', contractId);
    formData.append('doc_type', docType);
    formData.append('email', userEmail);
    formData.append('file', file);
    try {
      const resp = await fetch('api.php?action=upload_contract_doc', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatus('success');
        setMessage('Document téléchargé avec succès.');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.message || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Uploader un document</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Bon de livraison</option>
            <option>Factures</option>
            <option>PV</option>
            <option>Autres</option>
          </select>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />
          <button
            type="submit"
            disabled={status === 'uploading'}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            {status === 'uploading' ? 'Téléchargement...' : 'Uploader'}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}> {message} </p>
        )}
      </div>
    </div>
  );
}
