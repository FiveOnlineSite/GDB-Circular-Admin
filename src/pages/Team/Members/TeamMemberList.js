import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Linkedin, Eye, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import { getMembers, toggleMemberStatus } from "../../../services/team/memberService";
import { usePermissionContext } from "../../../context/PermissionContext";
import { StatusActionButton, StatusBadge } from "../../../components/common/StatusControls";

const GROUP_OPTIONS = ["Board of Directors", "Leadership"];
const STATUS_OPTIONS = ["active", "inactive"];

const tabButtonClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-[#981B1F] text-white shadow-sm"
      : "border border-slate-200 bg-white text-slate-600 hover:border-[#981B1F]/30 hover:bg-[#981B1F]/5 hover:text-[#981B1F]"
  }`;

export default function TeamMemberList() {
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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");


  const fetchMembersList = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const nextGroup = params.group_name !== undefined ? params.group_name : selectedGroup;
      const isGroupSequenceView = Boolean(nextGroup);
      const res = await getMembers({
        page: isGroupSequenceView ? 1 : params.page || pagination.current_page,
        limit: isGroupSequenceView ? 1000 : params.limit || pagination.per_page,
        name: params.name !== undefined ? params.name : search,
        group_name: nextGroup,
        status: params.status !== undefined ? params.status : selectedStatus,
      });

      if (res.success) {
        setRows(res.data || []);
        if (res.pagination) {
          setPagination((prev) =>
            isGroupSequenceView
              ? { ...prev, current_page: 1, total: res.pagination.total, last_page: 1 }
              : res.pagination,
          );
        }
      } else {
        setRows([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load team members");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, search, selectedGroup, selectedStatus]);

  useEffect(() => {
    fetchMembersList();
  }, [fetchMembersList]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleGroupTabChange = (group) => {
    setSelectedGroup(group);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };



  const handleToggleStatus = async (row) => {
    try {
      const res = await toggleMemberStatus(row.id);
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        fetchMembersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const columns = [
    {
      field: "photo_url",
      headerName: "Profile Photo",
      sortable: false,
      renderCell: ({ row }) => {
        const imgSrc = row.photo_url
          ? row.photo_url.startsWith("http")
            ? row.photo_url
            : `${process.env.REACT_APP_API_URL || ""}${row.photo_url}`
          : "";
        return imgSrc ? (
          <img
            src={imgSrc}
            alt={row.photo_alt || row.name}
            className="w-10 h-10 object-cover rounded-full border border-slate-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-bold border border-slate-200">
            N/A
          </div>
        );
      },
    },
    { field: "name", headerName: "Name", sortable: true },
    { field: "group_name", headerName: "Group", sortable: true },
    { field: "designation", headerName: "Designation", sortable: true },
    {
      field: "linkedin_url",
      headerName: "LinkedIn",
      sortable: false,
      renderCell: ({ row }) =>
        row.linkedin_url ? (
          <a
            href={row.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition"
          >
            <Linkedin size={18} />
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      field: "show_on_homepage",
      headerName: "Show Homepage",
      sortable: true,
      renderCell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.show_on_homepage
              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
              : "bg-slate-50 text-slate-500 border border-slate-100"
          }`}
        >
          {row.show_on_homepage ? "Yes" : "No"}
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
          {hasPermission("team", "members.view") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/team/members/view/${row.id}`)}
              title="View Profile Details"
            >
              <Eye className="h-4 w-4 text-[#981B1F]" />
            </Button>
          )}
          {hasPermission("team", "members.update") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => navigate(`/team/members/edit/${row.id}`)}
                title="Edit"
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
              <StatusActionButton
                row={row}
                entityName="team member"
                onConfirm={handleToggleStatus}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const tableColumns = selectedGroup
    ? columns
    : columns.filter((column) => column.field !== "sequence");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Team Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage GDB Board of Directors and Leadership members</p>
        </div>

        {hasPermission("team", "members.create") && (
          <Button
            onClick={() => navigate("/team/members/create")}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name..."
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
          <button type="button" onClick={() => handleGroupTabChange("")} className={tabButtonClass(!selectedGroup)}>
            All
          </button>
          {GROUP_OPTIONS.map((group) => (
            <button key={group} type="button" onClick={() => handleGroupTabChange(group)} className={tabButtonClass(selectedGroup === group)}>
              {group}
            </button>
          ))}
          <span className="ml-auto text-xs font-medium text-slate-500">
            {selectedGroup ? "Drag rows to change this group sequence." : "Select a group tab to reorder sequence."}
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
          sequenceReorderScope="team_members"
          disableSequenceReorder={!selectedGroup}
          emptyMessage="No team members found."
        />
      </div>

    </div>
  );
}
