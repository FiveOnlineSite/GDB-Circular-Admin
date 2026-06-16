import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { getFacilities, deleteFacility, toggleFacilityStatus } from "../../services/facilityService";
import { usePermissionContext } from "../../context/PermissionContext";
import { toast } from "sonner";

export default function FacilitiesList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const fetch = async (params = {}) => {
    try {
      setLoading(true);
      const res = await getFacilities({ ...params, page: pagination.current_page, limit: pagination.per_page, q: params.q || search });
      if (res.success) {
        setRows(res.data?.data || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      } else {
        setRows([]);
      }
    } catch (e) {
      toast.error("Failed to load facilities");
      setRows([]);
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    try {
      const res = await deleteFacility(selected.id);
      if (res.success) { toast.success("Facility deleted"); fetch(); }
    } catch (e) { toast.error(e.response?.data?.message || "Delete failed"); }
    finally { setDeleteModal(false); setSelected(null); }
  };

  const handleToggle = async (row) => {
    try {
      const res = await toggleFacilityStatus(row.id);
      if (res.success) { toast.success(`Facility marked as ${res.data.status}`); fetch(); }
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to toggle status'); }
  };

  const columns = [
    { field: "image_url", headerName: "Image", sortable: false, renderCell: ({ row }) => row.image_url ? (<img src={row.image_url.startsWith('http')?row.image_url:`${process.env.REACT_APP_API_URL||'http://localhost:5000'}${row.image_url}`} alt={row.image_alt} className="h-14 w-20 object-cover rounded-md shadow-sm" />) : <span>—</span> },
    { field: "facility_name", headerName: "Facility Name", sortable: true },
    { field: "facility_type", headerName: "Facility Type", sortable: true },
    { field: "address", headerName: "Address", sortable: false },
    { field: "phone", headerName: "Phone", sortable: false },
    { field: "state", headerName: "State", sortable: true },
    { field: "coordinates", headerName: "Coordinates", sortable: false, renderCell: ({ row }) => `${row.latitude || ''}, ${row.longitude || ''}` },
    { field: "sequence", headerName: "Seq", sortable: true },
    { field: "status", headerName: "Status", sortable: false, renderCell: ({ row }) => (<span className={`px-3 py-1 rounded-full text-sm font-semibold ${row.status==='active'?'bg-green-50 text-green-700 border border-green-100':'bg-red-50 text-red-700 border border-red-100'}`}>{row.status==='active'?'Active':'Inactive'}</span>) },
    { field: "actions", headerName: "Actions", sortable: false, sticky: "right", renderCell: ({ row }) => (
      <div className="flex items-center gap-2">
        {hasPermission('facilities','view') && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700"
            onClick={()=>navigate(`/facilities/view/${row.id}`)}
          >
            <Eye className="h-4 w-4 text-[#981B1F]" />
          </Button>
        )}
        {hasPermission('facilities','update') && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700"
            onClick={()=>navigate(`/facilities/edit/${row.id}`)}
          >
            <Edit2 className="h-4 w-4 text-[#C3662D]" />
          </Button>
        )}
        {hasPermission('facilities','update') && <Button size="sm" variant="ghost" onClick={()=>handleToggle(row)}>{row.status==='active'?'Deactivate':'Activate'}</Button>}
        {hasPermission('facilities','delete') && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
            onClick={()=>{ setSelected(row); setDeleteModal(true); }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    ) },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#981B1F' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M4 10h16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v3zM8 21V12h8v9" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Facilities</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage facilities across the platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') fetch({ page:1 }); }} className="px-3 py-2 w-64 text-sm placeholder-gray-400" placeholder="Search facilities..." />
            <button onClick={()=>fetch({ page:1 })} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700">Search</button>
          </div>
          {hasPermission('facilities','create') && (<Button onClick={()=>navigate('/facilities/create')} className="text-white">Add Facility</Button>)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <ReusableDataTable columns={columns} rows={rows} loading={loading} pagination={pagination}
          handlePageChange={p => setPagination(prev => ({ ...prev, current_page: p }))}
          handlePerPageChange={pp => setPagination(prev => ({ ...prev, per_page: pp, current_page: 1 }))}
          emptyMessage="No facilities yet." />
      </div>

      <ConfirmationModal isOpen={deleteModal} onClose={()=>{ setDeleteModal(false); setSelected(null); }} onConfirm={handleDelete} title="Delete Facility" message={`Delete ${selected?.facility_name}?`} confirmLabel="Delete" confirmVariant="destructive" />
    </div>
  );
}
