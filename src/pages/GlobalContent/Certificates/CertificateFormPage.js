import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Upload from "../../../components/common/Upload";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  createCertificate,
  updateCertificate,
  getCertificateById,
} from "../../../services/globalContent/certificates";

const fieldStyle =
  "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";



export default function CertificateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    image_alt: "",
    link: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        setPageLoading(true);
        const res = await getCertificateById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            title: d.title || "",
            image_url: d.image_url || "",
            image_alt: d.image_alt || "",
            link: d.link || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Certificate not found");
          navigate("/global-content/certificates");
        }
      } catch {
        toast.error("Failed to load certificate");
        navigate("/global-content/certificates");
      } finally {
        setPageLoading(false);
      }
    };
    fetch();
  }, [id, isEdit, navigate]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Certificate title is required";
    if (!form.image_url) newErrors.image_url = "Image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = isEdit
        ? await updateCertificate(id, form)
        : await createCertificate(form);
      if (res.success) {
        toast.success(isEdit ? "Certificate updated" : "Certificate created");
        navigate("/global-content/certificates");
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
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/global-content/certificates")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isEdit ? "Edit Certificate" : "Add Certificate"}
          </h1>
          <p className="text-slate-500 text-sm">{isEdit ? "Update trust logo details" : "Add a new trust logo or certificate"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Certificate Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Certificate Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="ISO 9001:2015 Certified"
                error={!!errors.title}
                errorMessage={errors.title}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Image Alt Text</label>
              <Input name="image_alt" value={form.image_alt} onChange={handleChange} placeholder="ISO certification logo" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                External / Internal Link
              </label>
              <Input name="link" value={form.link} onChange={handleChange} placeholder="https://certifibody.org/verify/..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
              <Input type="number" min="0" name="sequence" value={form.sequence} onChange={handleChange} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={fieldStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
              Certificate Image <span className="text-red-500">*</span>
            </label>
            <Upload
              value={form.image_url}
              onChange={(url) => {
                setForm((prev) => ({ ...prev, image_url: url }));
                if (errors.image_url) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.image_url;
                    return next;
                  });
                }
              }}
              mediaType="image"
              accept="image/*"
              maxSizeKB={500}
            />
            {errors.image_url && (
              <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                {errors.image_url}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/global-content/certificates")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update" : "Create"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
