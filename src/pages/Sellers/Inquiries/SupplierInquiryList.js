import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, FileDown, Eye, Trash2, X, CalendarDays } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/DeleteConfirmationModal";
import { getInquiries, deleteInquiry, exportInquiries } from "../../../services/sellers/supplierInquiryService";
import { usePermissionContext } from "../../../context/PermissionContext";
import * as XLSX from "xlsx";

const RESIN_TYPES = ["LDPE", "HDPE", "PP"];

function formatDisplayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}-${month}-${year}`;
}

export default function SupplierInquiryList() {
  const { hasPermission } = usePermissionContext();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [selectedResin, setSelectedResin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingInquiry, setViewingInquiry] = useState(null);

  const fetchInquiries = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);

        const queryParams = {
          page: params.page || pagination.current_page,
          limit: params.limit || pagination.per_page,
          search: params.search !== undefined ? params.search : search,
          resin_type: params.resin_type !== undefined ? params.resin_type : selectedResin,
        };

        const activeStartDate = params.startDate !== undefined ? params.startDate : startDate;
        const activeEndDate = params.endDate !== undefined ? params.endDate : endDate;

        if (activeStartDate) {
          queryParams.startDate = `${activeStartDate} 00:00:00`;
        }
        if (activeEndDate) {
          queryParams.endDate = `${activeEndDate} 23:59:59`;
        }

        const res = await getInquiries(queryParams);
        if (res.success) {
          setRows(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        } else {
          setRows([]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load supplier inquiries");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, search, selectedResin, startDate, endDate]
  );

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleResinFilterChange = (e) => {
    const resin = e.target.value;
    setSelectedResin(resin);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleDateChange = (type, val) => {
    if (type === "start") {
      setStartDate(val);
      setPagination((p) => ({ ...p, current_page: 1 }));
    } else {
      setEndDate(val);
      setPagination((p) => ({ ...p, current_page: 1 }));
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedResin("");
    setStartDate("");
    setEndDate("");
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchInquiries({
      page: 1,
      search: "",
      resin_type: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteInquiry(selectedItem.id);
      if (res.success) {
        toast.success("Inquiry record deleted successfully");
        fetchInquiries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleViewDetails = (item) => {
    setViewingInquiry(item);
    setDetailsModalOpen(true);
  };

  const handleExcelExport = async () => {
    if (exporting) return;
    try {
      setExporting(true);
      const queryParams = {
        export: "true",
        search,
        resin_type: selectedResin,
      };

      if (startDate) queryParams.startDate = `${startDate} 00:00:00`;
      if (endDate) queryParams.endDate = `${endDate} 23:59:59`;

      const res = await exportInquiries(queryParams);

      if (res.success && res.data) {
        const formatted = res.data.map((item) => ({
          "Inquiry ID": item.id,
          "First Name": item.first_name,
          "Last Name": item.last_name,
          "Email Address": item.email,
          "Mobile Number": item.mobile,
          "Company": item.company || "N/A",
          "Resin Type": item.resin_type,
          "Volume Required": item.volume,
          "Specifications": item.specs || "N/A",
          "Application": item.application || "N/A",
          "Additional Message": item.message || "N/A",
          "Page URL Origin": item.page_url || "N/A",
          "Date Received": item.created_at ? new Date(item.created_at).toLocaleString() : "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(formatted);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Inquiries");
        XLSX.writeFile(workbook, `Supplier_Inquiries_${new Date().toISOString().split("T")[0]}.xlsx`);
        toast.success("Inquiries downloaded as Excel sheet successfully");
      } else {
        toast.error("No inquiry data found to export.");
      }
    } catch (err) {
      toast.error("Failed to generate Excel export sheet");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", sortable: true },
    {
      field: "first_name",
      headerName: "Sender Name",
      sortable: false,
      renderCell: ({ row }) => (
        <span className="font-semibold text-slate-800">
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    { field: "email", headerName: "Email Address", sortable: true },
    { field: "mobile", headerName: "Mobile", sortable: false },
    {
      field: "company",
      headerName: "Company",
      sortable: true,
      renderCell: ({ row }) => row.company || <span className="text-slate-400">—</span>,
    },
    {
      field: "resin_type",
      headerName: "Resin Type",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
          {row.resin_type}
        </span>
      ),
    },
    { field: "volume", headerName: "Volume", sortable: false },
    {
      field: "created_at",
      headerName: "Date Submitted",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700"
            onClick={() => handleViewDetails(row)}
            title="View Form Details"
          >
            <Eye className="h-4 w-4 text-[#981B1F]" />
          </Button>
          {hasPermission("sellers", "inquiry.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Supplier Inquiries</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage feedstock offering requests submitted by prospective raw material suppliers</p>
        </div>

        {hasPermission("sellers", "inquiry.export") && (
          <Button
            onClick={handleExcelExport}
            disabled={exporting}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <FileDown className="w-4 h-4 mr-2" />
            {exporting ? "Generating Sheet..." : "Export to Excel"}
          </Button>
        )}
      </div>

      {/* Advanced Filters Strip */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6 flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name, email, company..."
                className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm"
              />
            </div>
          </div>

          {/* Resin Type Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Resin Type</label>
            <select
              value={selectedResin}
              onChange={handleResinFilterChange}
              className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 h-10 cursor-pointer"
            >
              <option value="">All Resin Types</option>
              {RESIN_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Received From</label>
            <div className="relative">
              <div className="flex h-10 w-full items-center rounded-lg border border-[#E6E6E6] bg-white px-3 pr-11 text-sm text-[#111111]">
                <span className={startDate ? "text-[#111111]" : "text-slate-500"}>
                  {startDate ? formatDisplayDate(startDate) : "DD-MM-YYYY"}
                </span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                aria-label="Received From"
                className="inquiry-date-input absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Received To</label>
            <div className="relative">
              <div className="flex h-10 w-full items-center rounded-lg border border-[#E6E6E6] bg-white px-3 pr-11 text-sm text-[#111111]">
                <span className={endDate ? "text-[#111111]" : "text-slate-500"}>
                  {endDate ? formatDisplayDate(endDate) : "DD-MM-YYYY"}
                </span>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                aria-label="Received To"
                className="inquiry-date-input absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-[#981B1F]"
          >
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <ReusableDataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={pagination}
          handlePageChange={(p) => setPagination((prev) => ({ ...prev, current_page: p }))}
          handlePerPageChange={(pp) =>
            setPagination((prev) => ({ ...prev, per_page: pp, current_page: 1 }))
          }
          emptyMessage="No supplier inquiries match the selected criteria."
        />
      </div>

      {/* View Details Modal Overlay */}
      {detailsModalOpen && viewingInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
          onClick={() => setDetailsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-gray-800 px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Supplier Inquiry Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: #{viewingInquiry.id} • Submitted on{" "}
                  {viewingInquiry.created_at ? new Date(viewingInquiry.created_at).toLocaleString() : "N/A"}
                </p>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Group 1: Sender Profile */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#981B1F] tracking-wide uppercase">
                  Sender Contact Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Sender Name</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {viewingInquiry.first_name} {viewingInquiry.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Company Name</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {viewingInquiry.company || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email Address</span>
                    <a
                      href={`mailto:${viewingInquiry.email}`}
                      className="text-sm font-semibold text-[#981B1F] hover:underline"
                    >
                      {viewingInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Mobile Phone</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {viewingInquiry.mobile}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 2: Material inquiry specs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#981B1F] tracking-wide uppercase">
                  Feedstock Offer Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Resin Type</span>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 rounded">
                      {viewingInquiry.resin_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Estimated Volume</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {viewingInquiry.volume}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-xs text-slate-400 block">Specifications/Grades</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 block whitespace-pre-wrap mt-0.5">
                      {viewingInquiry.specs || "No technical specs provided"}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-xs text-slate-400 block">Target Application</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 block mt-0.5">
                      {viewingInquiry.application || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 3: Messages and Origin */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#981B1F] tracking-wide uppercase">
                  Inquiry Message & Meta
                </h4>
                <div className="space-y-4 bg-slate-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Comments / Message</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-1">
                      {viewingInquiry.message || "No comments entered."}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Submitted from URL</span>
                    <span className="text-xs text-slate-500 break-all select-all font-mono">
                      {viewingInquiry.page_url || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-gray-800 px-6 py-4 border-t border-slate-100 dark:border-gray-700 flex justify-end">
              <Button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-sm"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier Inquiry"
        message={`Are you sure you want to delete inquiry from "${selectedItem?.first_name} ${selectedItem?.last_name}"? This record will be permanently deleted.`}
      />
    </div>
  );
}
