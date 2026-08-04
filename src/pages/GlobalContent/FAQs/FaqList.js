import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import { getFaqs } from "../../../services/globalContent/faqs";
import { usePermissionContext } from "../../../context/PermissionContext";

const PAGE_OPTIONS = [
  { value: "home", label: "Home", aliases: ["home", "homepage"] },
  { value: "product-listing", label: "Product Listing", aliases: ["product-listing", "product_listing", "products"] },
  { value: "seller", label: "Seller", aliases: ["seller", "sellers"] },
];

const tabButtonClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-[#981B1F] text-white shadow-sm"
      : "border border-slate-200 bg-white text-slate-600 hover:border-[#981B1F]/30 hover:bg-[#981B1F]/5 hover:text-[#981B1F]"
  }`;

const normalizePageValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const getPageOption = (value) => {
  const normalizedValue = normalizePageValue(value);
  return PAGE_OPTIONS.find((option) =>
    option.aliases.some((alias) => normalizePageValue(alias) === normalizedValue),
  );
};

export default function FaqList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getFaqs();
      if (res.success) setRows(Array.isArray(res.data) ? res.data : []);
      else setRows([]);
    } catch {
      toast.error("Failed to load FAQs");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    {
      field: "page",
      headerName: "Page",
      sortable: true,
      renderCell: ({ row }) => getPageOption(row.page)?.label || row.page || "—",
    },
    {
      field: "question",
      headerName: "Question",
      renderCell: ({ row }) => (
        <span className="line-clamp-2 max-w-xs text-sm">{row.question}</span>
      ),
    },
    {
      field: "answer",
      headerName: "Answer",
      renderCell: ({ row }) => (
        <span className="line-clamp-1 max-w-xs text-sm text-slate-500">{row.answer}</span>
      ),
    },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.status === "active" ? "Active" : "Inactive"}
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
          {hasPermission("globalContent", "faq.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/global-content/faqs/edit/${row.id}`)}
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredRows = useMemo(
    () =>
      selectedPage
        ? rows.filter((row) => getPageOption(row.page)?.value === selectedPage)
        : rows,
    [rows, selectedPage],
  );

  const totalRows = filteredRows.length;
  const lastPage = Math.max(1, Math.ceil(totalRows / pagination.per_page));
  const currentPage = Math.min(pagination.current_page, lastPage);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.per_page;
    return filteredRows.slice(startIndex, startIndex + pagination.per_page);
  }, [filteredRows, currentPage, pagination.per_page]);
  const tableRows = selectedPage ? filteredRows : paginatedRows;

  const tablePagination = {
    current_page: currentPage,
    per_page: pagination.per_page,
    total: totalRows,
    last_page: lastPage,
  };

  const tableColumns = selectedPage
    ? columns
    : columns.filter((column) => column.field !== "sequence");

  const handlePageTabChange = (page) => {
    setSelectedPage(page);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSequenceReorderSuccess = (updatedRows) => {
    const sequenceById = new Map(updatedRows.map((row) => [row.id, row.sequence]));
    setRows((prev) =>
      prev
        .map((row) =>
          sequenceById.has(row.id)
            ? { ...row, sequence: sequenceById.get(row.id) }
            : row,
        )
        .sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0) || Number(b.id || 0) - Number(a.id || 0)),
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">FAQ Management</h1>
          <p className="text-sm text-gray-500  mt-1">Manage frequently asked questions by page</p>
        </div>
        {hasPermission("globalContent", "faq.create") && (
          <Button onClick={() => navigate("/global-content/faqs/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add FAQ
          </Button>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => handlePageTabChange("")} className={tabButtonClass(!selectedPage)}>
            All
          </button>
          {PAGE_OPTIONS.map((page) => (
            <button key={page.value} type="button" onClick={() => handlePageTabChange(page.value)} className={tabButtonClass(selectedPage === page.value)}>
              {page.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-medium text-slate-500">
            {selectedPage ? "Drag rows to change this page sequence." : "Select a page tab to reorder sequence."}
          </span>
        </div>
      </div>

      <ReusableDataTable
        columns={tableColumns}
        rows={tableRows}
        loading={loading}
        pagination={selectedPage ? null : tablePagination}
        handlePageChange={selectedPage ? undefined : (page) => setPagination((prev) => ({ ...prev, current_page: page }))}
        handlePerPageChange={selectedPage ? undefined : (perPage) => setPagination({ current_page: 1, per_page: perPage })}
        sequenceReorderScope="faqs"
        onSequenceReorderSuccess={handleSequenceReorderSuccess}
        disableSequenceReorder={!selectedPage}
        emptyMessage="No FAQs found. Click 'Add FAQ' to create one."
      />
    </div>
  );
}
