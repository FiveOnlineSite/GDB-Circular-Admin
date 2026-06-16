import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, Check, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/DeleteConfirmationModal";
import { getNews, deleteNews, toggleNewsPublish } from "../../../services/news/newsService";
import { getCategories } from "../../../services/news/newsCategoryService";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function NewsList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();

  const canCreate = hasPermission("news", "content.create");
  const canUpdate = hasPermission("news", "content.update");
  const canDelete = hasPermission("news", "content.delete");
  const canPublish = hasPermission("news", "content.publish");

  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch Categories for Filter Dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories({ limit: "all" });
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    })();
  }, []);

  const fetchNewsList = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const queryParams = {
          page: params.page || pagination.current_page,
          limit: params.limit || pagination.per_page,
          title: params.search !== undefined ? params.search : search,
          category_id: params.category_id !== undefined ? params.category_id : selectedCategory,
          publish_status: params.publish_status !== undefined ? params.publish_status : selectedStatus,
          startDate: params.startDate !== undefined ? params.startDate : startDate,
          endDate: params.endDate !== undefined ? params.endDate : endDate,
        };

        const res = await getNews(queryParams);
        if (res.success) {
          setRows(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        } else {
          setRows([]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load news articles");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, search, selectedCategory, selectedStatus, startDate, endDate]
  );

  useEffect(() => {
    fetchNewsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchNewsList({ page: 1 });
  };

  const handleCategoryFilterChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchNewsList({ page: 1, category_id: catId });
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchNewsList({ page: 1, publish_status: status });
  };

  const handleDateChange = (type, val) => {
    if (type === "start") {
      setStartDate(val);
      setPagination((p) => ({ ...p, current_page: 1 }));
      fetchNewsList({ page: 1, startDate: val });
    } else {
      setEndDate(val);
      setPagination((p) => ({ ...p, current_page: 1 }));
      fetchNewsList({ page: 1, endDate: val });
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchNewsList({
      page: 1,
      search: "",
      category_id: "",
      publish_status: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleTogglePublish = async (row) => {
    if (!canPublish) return toast.error("You do not have permission to publish content");
    try {
      const res = await toggleNewsPublish(row.id);
      if (res.success) {
        toast.success(res.message || "Publish status updated");
        fetchNewsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update publish status");
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteNews(selectedItem.id);
      if (res.success) {
        toast.success("News article deleted successfully");
        fetchNewsList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete news article");
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      field: "image_url",
      headerName: "Image",
      sortable: false,
      renderCell: ({ row }) => {
        const fileSrc = row.image_url
          ? row.image_url.startsWith("http")
            ? row.image_url
            : `${process.env.REACT_APP_API_URL || ""}${row.image_url}`
          : "";

        if (!fileSrc) return <span className="text-slate-400">—</span>;

        return (
          <img
            src={fileSrc}
            alt={row.image_alt || row.title}
            className="w-16 h-10 object-cover rounded border border-slate-200 bg-white"
          />
        );
      },
    },
    {
      field: "title",
      headerName: "Article Title",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="font-semibold text-slate-800 truncate max-w-[200px] block" title={row.title}>
          {row.title}
        </span>
      ),
    },
    {
      field: "category_title",
      headerName: "Category",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {row.category_title || "—"}
        </span>
      ),
    },
    {
      field: "date",
      headerName: "Publish Date",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {row.date ? new Date(row.date).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      field: "featured_homepage",
      headerName: "Featured HP",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="flex justify-center w-full">
          {row.featured_homepage === 1 ? (
            <span className="text-green-600 bg-green-50 rounded-full p-0.5 border border-green-150">
              <Check size={12} />
            </span>
          ) : (
            <span className="text-slate-300">
              <X size={12} />
            </span>
          )}
        </span>
      ),
    },
    {
      field: "featured_listing",
      headerName: "Featured List",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="flex justify-center w-full">
          {row.featured_listing === 1 ? (
            <span className="text-green-600 bg-green-50 rounded-full p-0.5 border border-green-150">
              <Check size={12} />
            </span>
          ) : (
            <span className="text-slate-300">
              <X size={12} />
            </span>
          )}
        </span>
      ),
    },
    {
      field: "publish_status",
      headerName: "Status",
      sortable: true,
      renderCell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.publish_status === "published"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-amber-50 text-amber-700 border border-amber-100"
          }`}
        >
          {row.publish_status === "published" ? "Published" : "Draft"}
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
          {hasPermission("news", "content.view") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/news-updates/view/${row.id}`)}
              title="View Article Details"
            >
              <Eye className="h-4 w-4 text-[#981B1F]" />
            </Button>
          )}
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/news-updates/edit/${row.id}`)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {canPublish && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-[#C3662D] hover:bg-[#C3662D]/10 h-8"
              onClick={() => handleTogglePublish(row)}
            >
              {row.publish_status === "published" ? "Make Draft" : "Publish"}
            </Button>
          )}
          {canDelete && (
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">News & Updates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage public articles, events announcements, dynamic posts, and featured items</p>
        </div>

        {canCreate && (
          <Button
            onClick={() => navigate("/news-updates/create")}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Article
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Keyword Search */}
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Search Article Title</label>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by title..."
                className="border border-[#E6E6E6] rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:border-[#981B1F] focus:outline-none w-full h-9"
              />
              <Button type="submit" size="icon" className="bg-[#981B1F] shrink-0 h-9 w-9">
                <Plus size={14} className="hidden" />
                <span>Go</span>
              </Button>
            </form>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Category Tab</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryFilterChange}
              className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 h-9"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_title}
                </option>
              ))}
            </select>
          </div>

          {/* Publish Status */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Publish Status</label>
            <select
              value={selectedStatus}
              onChange={handleStatusFilterChange}
              className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 h-9"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Date boundaries */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Date Published</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none text-slate-700 h-9"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-[#981B1F]"
          >
            Clear Filters
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
          emptyMessage="No news or updates articles found."
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete News Article"
        message={`Are you sure you want to delete the article "${selectedItem?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
