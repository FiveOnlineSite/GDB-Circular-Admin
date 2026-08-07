import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import { getFacilities, toggleFacilityStatus } from "../../services/facilityService";
import { usePermissionContext } from "../../context/PermissionContext";
import { toast } from "sonner";

const FACILITY_TYPES = ["", "GDB International", "GDB Circular", "GDB Paint & Coatings"];

export default function FacilitiesList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [search, setSearch] = useState("");
  const [facilityType, setFacilityType] = useState("");

  const fetch = async (params = {}) => {
    try {
      setLoading(true);
      const res = await getFacilities({
        ...params,
        page: 1,
        limit: 1000,
        search: params.search ?? search,
        facility_type: params.facility_type ?? facilityType,
      });
      if (res.success) {
        setRows(res.data?.data || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      } else {
        setRows([]);
      }
    } catch {
      toast.error("Failed to load facilities");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [pagination.current_page, pagination.per_page, search, facilityType]);

  const handleToggle = async (row) => {
    try {
      const res = await toggleFacilityStatus(row.id);
      if (res.success) {
        toast.success(`Facility marked as ${res.data.status}`);
        fetch();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to toggle status");
    }
  };

  const columns = [
    {
      field: "image_url",
      headerName: "Image",
      sortable: false,
      renderCell: ({ row }) =>
        row.image_url ? (
          <img src={row.image_url.startsWith("http") ? row.image_url : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${row.image_url}`} alt={row.image_alt || row.facility_name} className="h-14 w-20 object-cover rounded-md shadow-sm" />
        ) : (
          <span>-</span>
        ),
    },
    { field: "facility_name", headerName: "Facility Name", sortable: true },
    { field: "facility_type", headerName: "Facility Type", sortable: true },
    { field: "state", headerName: "State", sortable: true },
    { field: "phone", headerName: "Phone", sortable: false },
    {
      field: "show_on_facility_page",
      headerName: "Facility Page",
      sortable: true,
      renderCell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.show_on_facility_page ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
          {row.show_on_facility_page ? "Yes" : "No"}
        </span>
      ),
    },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => <span className={`px-3 py-1 rounded-full text-sm font-semibold ${row.status === "active" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>{row.status === "active" ? "Active" : "Inactive"}</span>,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("facilities", "view") && <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-700" onClick={() => navigate(`/facilities/view/${row.id}`)}><Eye className="h-4 w-4 text-[#981B1F]" /></Button>}
          {hasPermission("facilities", "update") && <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-700" onClick={() => navigate(`/facilities/edit/${row.id}`)}><Edit2 className="h-4 w-4 text-[#C3662D]" /></Button>}
          {hasPermission("facilities", "update") && <Button size="sm" variant="ghost" onClick={() => handleToggle(row)}>{row.status === "active" ? "Deactivate" : "Activate"}</Button>}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#981B1F" }}>
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
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, current_page: 1 })); }} className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm" placeholder="Search facilities..." />
          </div>
          <select value={facilityType} onChange={(e) => { setFacilityType(e.target.value); setPagination((prev) => ({ ...prev, current_page: 1 })); }} className="border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 min-w-[170px] cursor-pointer">
            <option value="">All Facility Types</option>
            {FACILITY_TYPES.filter(Boolean).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {hasPermission("facilities", "create") && <Button onClick={() => navigate("/facilities/create")} className="text-white">Add Facility</Button>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <ReusableDataTable columns={columns} rows={rows} loading={loading} pagination={pagination} handlePageChange={(p) => setPagination((prev) => ({ ...prev, current_page: p }))} handlePerPageChange={(pp) => setPagination((prev) => ({ ...prev, per_page: pp, current_page: 1 }))} sequenceReorderScope="facilities" emptyMessage="No facilities yet." />
      </div>

    </div>
  );
}
