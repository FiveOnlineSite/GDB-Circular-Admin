import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Upload from "../../../components/common/Upload";
import EditPageDeleteAction from "../../../components/common/EditPageDeleteAction";
import { getLifeItemById, createLifeItem, updateLifeItem } from "../../../services/team/lifeAtGdbService";

export default function LifeAtGdbFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isView = location.pathname.includes("/team/life-at-gdb/view/");
  const isEdit = Boolean(id) && !isView;

  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    section_title: "",
    description: "",
    file_url: "",
    media_type: "image",
    alt_text: "",
    slider_group: 1,
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit && !isView) return;

    (async () => {
      try {
        setPageLoading(true);
        const res = await getLifeItemById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            section_title: d.section_title || "",
            description: d.description || "",
            file_url: d.file_url || "",
            media_type: "image",
            alt_text: d.alt_text || "",
            slider_group: Number(d.slider_group) === 2 ? 2 : 1,
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Gallery item not found");
          navigate("/team/life-at-gdb");
        }
      } catch (err) {
        toast.error("Failed to load gallery item details");
        navigate("/team/life-at-gdb");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, isView, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "sequence" || name === "slider_group" ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleMediaUpload = (url) => {
    setForm((prev) => ({
      ...prev,
      file_url: url,
      media_type: "image",
    }));
    if (errors.file_url) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file_url;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isView) return;

    const newErrors = {};
    if (!form.file_url) newErrors.file_url = "Image is required";
    if (!form.alt_text.trim()) newErrors.alt_text = "Image Alt Text is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        section_title: null,
        description: null,
        media_type: "image",
        alt_text: form.alt_text.trim(),
        slider_group: Number(form.slider_group) === 2 ? 2 : 1,
        sequence: Number(form.sequence),
      };

      const res = isEdit
        ? await updateLifeItem(id, payload)
        : await createLifeItem(payload);

      if (res.success) {
        toast.success(isEdit ? "Gallery item updated successfully" : "Gallery item created successfully");
        navigate("/team/life-at-gdb");
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

  const pageTitle = isView ? "View Gallery Item" : isEdit ? "Edit Gallery Item" : "Add Gallery Item";

  return (
    <div className="space-y-6 pb-12 w-full p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => navigate("/team/life-at-gdb")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800  tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-slate-500 text-sm">
            {isView ? "View this slider image" : "Upload an image, add alt text, and choose slider row 1 or 2"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Slider Image Details</h2>

          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-slate-600  block mb-1">
                  Slider Row <span className="text-red-500">*</span>
                </label>
                <select
                  name="slider_group"
                  value={form.slider_group}
                  onChange={handleChange}
                  disabled={isView}
                  className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white    disabled:opacity-55"
                >
                  <option value={1}>Slider 1</option>
                  <option value={2}>Slider 2</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-slate-600  block mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isView}
                  className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white    disabled:opacity-55"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Media Block */}
        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">
            Media Upload
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="text-sm font-semibold text-slate-600  block mb-2">
              Upload Image <span className="text-red-500">*</span>
            </label>
            <Upload
              value={form.file_url}
              onChange={handleMediaUpload}
              mediaType="image"
              accept="image/*"
              maxSizeKB={500}
              disabled={isView}
            />
            {errors.file_url && (
              <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                {errors.file_url}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600  block mb-2">
              Image Alt Text <span className="text-red-500">*</span>
            </label>
            <Input
              name="alt_text"
              value={form.alt_text}
              onChange={handleChange}
              placeholder="Provide alt text for screen readers"
              disabled={isView}
              error={!!errors.alt_text}
              errorMessage={errors.alt_text}
            />
          </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <EditPageDeleteAction
            id={isEdit ? id : null}
            permission="team.life.delete"
            endpoint={`/team/life-at-gdb/${id}`}
            redirectTo="/team/life-at-gdb"
            title="Delete Gallery Item"
            message="Are you sure you want to delete this gallery item? This action cannot be undone."
            successMessage="Gallery item deleted"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/team/life-at-gdb")}
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
                  {isEdit ? "Update Item" : "Save Item"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
