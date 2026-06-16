import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Upload from "../../../components/common/Upload";
import { getMemberById, createMember, updateMember } from "../../../services/team/memberService";

const GROUP_OPTIONS = ["Board of Directors", "Leadership"];

export default function TeamMemberFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isView = location.pathname.includes("/team/members/view/");
  const isEdit = Boolean(id) && !isView;

  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    group_name: "",
    name: "",
    designation: "",
    photo_url: "",
    photo_alt: "",
    linkedin_url: "",
    show_on_homepage: false,
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit && !isView) return;

    (async () => {
      try {
        setPageLoading(true);
        const res = await getMemberById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            group_name: d.group_name || "",
            name: d.name || "",
            designation: d.designation || "",
            photo_url: d.photo_url || "",
            photo_alt: d.photo_alt || "",
            linkedin_url: d.linkedin_url || "",
            show_on_homepage: Boolean(d.show_on_homepage),
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Team member not found");
          navigate("/team/members");
        }
      } catch (err) {
        toast.error("Failed to load team member details");
        navigate("/team/members");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, isView, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "sequence" ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePhotoUpload = (url) => {
    setForm((prev) => ({ ...prev, photo_url: url }));
    if (errors.photo_url) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo_url;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isView) return;

    const newErrors = {};
    if (!form.group_name) newErrors.group_name = "Group is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.designation.trim()) newErrors.designation = "Designation is required";
    if (!form.photo_url) newErrors.photo_url = "Profile photo is required";
    if (!form.photo_alt.trim()) newErrors.photo_alt = "Photo alt text is required";

    // Validate URL format if provided
    if (form.linkedin_url.trim()) {
      try {
        new URL(form.linkedin_url.trim());
      } catch (_) {
        newErrors.linkedin_url = "Please enter a valid LinkedIn URL format (including http/https)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        name: form.name.trim(),
        designation: form.designation.trim(),
        photo_alt: form.photo_alt.trim(),
        linkedin_url: form.linkedin_url.trim() || null,
        show_on_homepage: form.show_on_homepage ? 1 : 0,
        sequence: Number(form.sequence),
      };

      const res = isEdit
        ? await updateMember(id, payload)
        : await createMember(payload);

      if (res.success) {
        toast.success(isEdit ? "Team member updated successfully" : "Team member created successfully");
        navigate("/team/members");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle = isView ? "View Team Member" : isEdit ? "Edit Team Member" : "Add Team Member";

  return (
    <div className="space-y-6 pb-12 w-full  p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => navigate("/team/members")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-slate-500 text-sm">
            {isView ? "View details of this team member" : "Provide profile details for the team member"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Select Group <span className="text-red-500">*</span>
              </label>
              <select
                name="group_name"
                value={form.group_name}
                onChange={handleChange}
                disabled={isView}
                className={`w-full border ${errors.group_name ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : "border-[#E6E6E6] focus:border-[#981B1F] focus:ring-[#981B1F]/15"} text-[#111111] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55`}
              >
                <option value="">Select Group</option>
                {GROUP_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.group_name && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                  {errors.group_name}
                </span>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                disabled={isView}
                error={!!errors.name}
                errorMessage={errors.name}
              />
            </div>

            {/* Designation */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <Input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Chief Executive Officer"
                disabled={isView}
                error={!!errors.designation}
                errorMessage={errors.designation}
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                LinkedIn URL
              </label>
              <Input
                name="linkedin_url"
                value={form.linkedin_url || ""}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                disabled={isView}
                error={!!errors.linkedin_url}
                errorMessage={errors.linkedin_url}
              />
            </div>

            {/* Sequence */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Sequence
              </label>
              <Input
                type="number"
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
                placeholder="0"
                disabled={isView}
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={isView}
                className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="show_on_homepage"
              name="show_on_homepage"
              checked={form.show_on_homepage}
              onChange={handleChange}
              disabled={isView}
              className="h-4.5 w-4.5 rounded border-slate-300 text-[#981B1F] focus:ring-[#981B1F] disabled:opacity-55"
            />
            <label
              htmlFor="show_on_homepage"
              className="text-sm font-semibold text-slate-700 dark:text-gray-300 select-none cursor-pointer"
            >
              Show on Homepage
            </label>
          </div>
        </div>

        {/* Media Block */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Profile Photo
          </h2>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
              Photo Upload <span className="text-red-500">*</span>
            </label>
            <Upload
              value={form.photo_url}
              onChange={handlePhotoUpload}
              mediaType="image"
              accept="image/*"
              maxSizeKB={500}
              disabled={isView}
            />
            {errors.photo_url && (
              <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                {errors.photo_url}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Photo Alt Text <span className="text-red-500">*</span>
            </label>
            <Input
              name="photo_alt"
              value={form.photo_alt}
              onChange={handleChange}
              placeholder="Provide alt text describing profile photo"
              disabled={isView}
              error={!!errors.photo_alt}
              errorMessage={errors.photo_alt}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/team/members")}
          >
            {isView ? "Back" : "Cancel"}
          </Button>

          {!isView && (
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? "Update Member" : "Save Member"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
