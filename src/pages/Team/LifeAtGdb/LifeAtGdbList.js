import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Image as ImageIcon, Eye, Search, Loader2, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import {
  getLifeItems,
  getLifeSection,
  toggleLifeItemStatus,
  updateLifeSection,
} from "../../../services/team/lifeAtGdbService";
import { usePermissionContext } from "../../../context/PermissionContext";
import { StatusActionButton, StatusBadge } from "../../../components/common/StatusControls";

const STATUS_OPTIONS = ["active", "inactive"];
const SLIDER_GROUPS = ["1", "2"];

const tabButtonClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-[#981B1F] text-white shadow-sm"
      : "border border-slate-200 bg-white text-slate-600 hover:border-[#981B1F]/30 hover:bg-[#981B1F]/5 hover:text-[#981B1F]"
  }`;

export default function LifeAtGdbList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSliderGroup, setSelectedSliderGroup] = useState("");
  const [section, setSection] = useState({ section_title: "", section_description: "" });
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const hasSectionDetails = Boolean(section.section_title || section.section_description);


  const fetchLifeGallery = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const nextSliderGroup = params.slider_group !== undefined ? params.slider_group : selectedSliderGroup;
      const isSliderSequenceView = Boolean(nextSliderGroup);
      const res = await getLifeItems({
        page: isSliderSequenceView ? 1 : params.page || pagination.current_page,
        limit: isSliderSequenceView ? 1000 : params.limit || pagination.per_page,
        search: params.search !== undefined ? params.search : search,
        slider_group: nextSliderGroup,
        status: params.status !== undefined ? params.status : selectedStatus,
      });

      if (res.success) {
        setRows(res.data || []);
        if (res.pagination) {
          setPagination((prev) =>
            isSliderSequenceView
              ? { ...prev, current_page: 1, total: res.pagination.total, last_page: 1 }
              : res.pagination,
          );
        }
      } else {
        setRows([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load gallery items");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, search, selectedSliderGroup, selectedStatus]);

  useEffect(() => {
    fetchLifeGallery();
  }, [fetchLifeGallery]);

  useEffect(() => {
    (async () => {
      try {
        setSectionLoading(true);
        const res = await getLifeSection();
        if (res.success && res.data) {
          const nextSection = {
            section_title: res.data.section_title || "",
            section_description: res.data.section_description || "",
          };
          setSection(nextSection);
          setIsEditingSection(!(nextSection.section_title || nextSection.section_description));
        } else {
          setIsEditingSection(true);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load section header");
        setIsEditingSection(true);
      } finally {
        setSectionLoading(false);
      }
    })();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleSliderGroupTabChange = (sliderGroup) => {
    setSelectedSliderGroup(sliderGroup);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await toggleLifeItemStatus(row.id);
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        fetchLifeGallery();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleSectionSave = async (e) => {
    e.preventDefault();
    try {
      setSectionSaving(true);
      const res = await updateLifeSection(section);
      if (res.success) {
        const nextSection = {
          section_title: res.data?.section_title || section.section_title || "",
          section_description: res.data?.section_description || section.section_description || "",
        };
        setSection(nextSection);
        toast.success("Section header saved");
        setIsEditingSection(!(nextSection.section_title || nextSection.section_description));
      } else {
        toast.error(res.message || "Failed to save section header");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save section header");
    } finally {
      setSectionSaving(false);
    }
  };

  const columns = [
    {
      field: "file_url",
      headerName: "Preview",
      sortable: false,
      renderCell: ({ row }) => {
        const fileSrc = row.file_url
          ? row.file_url.startsWith("http")
            ? row.file_url
            : `${process.env.REACT_APP_API_URL || ""}${row.file_url}`
          : "";

        if (!fileSrc) return <span className="text-slate-400">—</span>;

        return (
          <img
            src={fileSrc}
            alt={row.alt_text || "Life at GDB gallery image"}
            className="w-16 h-10 object-cover rounded border border-slate-200 bg-white"
          />
        );
      },
    },
    {
      field: "alt_text",
      headerName: "Alt Text",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="truncate max-w-[220px] block">
          {row.alt_text || "—"}
        </span>
      ),
    },
    {
      field: "slider_group",
      headerName: "Slider",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="flex items-center gap-1.5 capitalize font-medium text-slate-700 text-sm">
          <ImageIcon size={16} className="text-sky-500" />
          Slider {Number(row.slider_group) === 2 ? 2 : 1}
        </span>
      ),
    },
    { field: "sequence", headerName: "Sequence", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => <StatusBadge status={row.status} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("team", "life.view") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/team/life-at-gdb/view/${row.id}`)}
              title="View Details"
            >
              <Eye className="h-4 w-4 text-[#981B1F]" />
            </Button>
          )}
          {hasPermission("team", "life.update") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => navigate(`/team/life-at-gdb/edit/${row.id}`)}
                title="Edit"
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
              <StatusActionButton
                row={row}
                entityName="gallery item"
                onConfirm={handleToggleStatus}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const tableColumns = selectedSliderGroup
    ? columns
    : columns.filter((column) => column.field !== "sequence");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Life at GDB Circular</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the section header and gallery slider images</p>
        </div>

        {hasPermission("team", "life.create") && (
          <Button
            onClick={() => navigate("/team/life-at-gdb/create")}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gallery Item
          </Button>
        )}
      </div>

      {sectionLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-44 flex items-center justify-center mb-6">
          <div className="flex flex-col items-center gap-3 text-slate-500" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-[#981B1F]" />
            <span className="text-sm font-medium">Loading section header...</span>
          </div>
        </div>
      ) : !isEditingSection && hasSectionDetails ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-semibold text-slate-700">Section Header</h2>
            {hasPermission("team", "life.update") && (
              <Button variant="outline" className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5 gap-2" onClick={() => setIsEditingSection(true)}>
                <Edit2 className="w-4 h-4" /> Edit Section
              </Button>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">Main Title</span>
            <p className="text-sm font-medium text-slate-800">{section.section_title || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">Description</span>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{section.section_description || "-"}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSectionSave} className="mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700 border-b pb-3">Section Header</h2>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Main Title</label>
              <Input
                value={section.section_title}
                onChange={(e) => setSection((prev) => ({ ...prev, section_title: e.target.value }))}
                placeholder="Life at GDB Circular"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Description</label>
              <Textarea
                value={section.section_description}
                onChange={(e) => setSection((prev) => ({ ...prev, section_description: e.target.value }))}
                rows={3}
                placeholder="A workplace shaped by teamwork, innovation..."
              />
            </div>
            {hasPermission("team", "life.update") && (
              <div className="flex justify-end gap-3">
                {hasSectionDetails && (
                  <Button type="button" variant="outline" onClick={() => setIsEditingSection(false)}>Cancel</Button>
                )}
                <Button type="submit" disabled={sectionSaving} className="bg-[#981B1F] hover:bg-[#C3662D] text-white">
                  {sectionSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Section</>}
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Search and Filters Strip */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by alt text..."
              className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            className="border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 min-w-[130px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          <button type="button" onClick={() => handleSliderGroupTabChange("")} className={tabButtonClass(!selectedSliderGroup)}>
            All
          </button>
          {SLIDER_GROUPS.map((sliderGroup) => (
            <button
              key={sliderGroup}
              type="button"
              onClick={() => handleSliderGroupTabChange(sliderGroup)}
              className={tabButtonClass(selectedSliderGroup === sliderGroup)}
            >
              Slider {sliderGroup}
            </button>
          ))}
          <span className="ml-auto text-xs font-medium text-slate-500">
            {selectedSliderGroup ? "Drag rows to change this slider sequence." : "Select a slider tab to reorder sequence."}
          </span>
        </div>
        <ReusableDataTable
          columns={tableColumns}
          rows={rows}
          loading={loading}
          pagination={pagination}
          handlePageChange={(p) => setPagination((prev) => ({ ...prev, current_page: p }))}
          handlePerPageChange={(pp) =>
            setPagination((prev) => ({ ...prev, per_page: pp, current_page: 1 }))
          }
          sequenceReorderScope="team_life_gallery"
          disableSequenceReorder={!selectedSliderGroup}
          onSequenceReorderSuccess={(updatedRows) => setRows(updatedRows)}
          emptyMessage="No gallery items found."
        />
      </div>

    </div>
  );
}
