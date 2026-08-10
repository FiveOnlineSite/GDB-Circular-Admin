import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Upload from "../../../components/common/Upload";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { getCaseStudyById, createCaseStudy, updateCaseStudy } from "../../../services/productListing";

const ss = "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white   ";
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};
const QUILL_FORMATS = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link", "image"];
const INIT = { title: "", short_description: "", tag: "", image_url: "", image_alt: "", description: "", sources: "", sequence: 0, status: "active" };

export default function CaseStudyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const quillRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getCaseStudyById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            title: d.title || "",
            short_description: d.short_description || "",
            tag: d.tag || "",
            image_url: d.image_url || "",
            image_alt: d.image_alt || "",
            description: d.description || "",
            sources: d.sources || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Case study not found");
          navigate("/product-listing/case-study");
        }
      } catch {
        toast.error("Failed to load");
        navigate("/product-listing/case-study");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, navigate]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
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
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.short_description.trim()) newErrors.short_description = "Short description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        tag: form.tag.trim(),
        image_alt: form.image_alt.trim(),
        sources: form.sources.trim(),
        sequence: Number(form.sequence),
      };
      const res = isEdit ? await updateCaseStudy(id, payload) : await createCaseStudy(payload);
      if (res.success) {
        toast.success(isEdit ? "Case study updated" : "Case study created");
        navigate("/product-listing/case-study");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;

  const pageTitle = isView ? "View Case Study" : isEdit ? "Edit Case Study" : "Add Case Study";

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/product-listing/case-study")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800  tracking-tight">{pageTitle}</h1>
          <p className="text-slate-500 text-sm">{isView ? "Case study details" : isEdit ? "Update case study" : "Add a new case study"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Case Study Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600  block mb-1">Title <span className="text-red-500">*</span></label>
              <Input name="title" value={form.title} onChange={handle} placeholder="Case study title" disabled={isView} error={!!errors.title} errorMessage={errors.title} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Tag</label>
              <Input name="tag" value={form.tag} onChange={handle} placeholder="e.g. Film Recycling / Packaging" disabled={isView} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600  block mb-1">Short Description <span className="text-red-500">*</span></label>
              <Textarea name="short_description" value={form.short_description} onChange={handle} rows={3} placeholder="Brief summary of the case study..." disabled={isView} />
              {errors.short_description && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.short_description}</span>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handle} className={ss} disabled={isView}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Cover Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-2">Image Upload</label>
              <Upload value={form.image_url} onChange={(url) => setForm((p) => ({ ...p, image_url: url }))} mediaType="image" accept="image/*" maxSizeKB={500} disabled={isView} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-2">Image Alt Text</label>
              <Input name="image_alt" value={form.image_alt} onChange={handle} placeholder="Describe the image" disabled={isView} />
            </div>
          </div>
        </div>

        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Description</h2>
          {isView ? (
            <div className="prose max-w-none text-slate-700  ql-editor" dangerouslySetInnerHTML={{ __html: form.description || "<p class='text-slate-400'>No description provided</p>" }} />
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <ReactQuill ref={quillRef} theme="snow" value={form.description} onChange={(val) => setForm((p) => ({ ...p, description: val }))} modules={QUILL_MODULES} formats={QUILL_FORMATS} placeholder="Write the case study description here..." style={{ minHeight: 300 }} />
            </div>
          )}
        </div>

        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Sources</h2>
          <Textarea name="sources" value={form.sources} onChange={handle} rows={4} placeholder="Enter source links, notes, or citations..." disabled={isView} />
        </div>

        {!isView ? (
          <div className="flex justify-end gap-3">
            {/* Delete Case Study button hidden as requested.
            <EditPageDeleteAction
              id={isEdit ? id : null}
              permission="product.casestudy.delete"
              endpoint={`/product-listing/case-study/${id}`}
              redirectTo="/product-listing/case-study"
              title="Delete Case Study"
              message="Are you sure you want to delete this case study?"
              successMessage="Case study deleted"
            />
            */}
            <Button type="button" variant="outline" onClick={() => navigate("/product-listing/case-study")}>Cancel</Button>
            <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update" : "Create"} Case Study</>}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/product-listing/case-study")}>Back to List</Button>
            <Button type="button" style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90" onClick={() => navigate(`/product-listing/case-study/edit/${id}`)}>Edit</Button>
          </div>
        )}
      </form>
    </div>
  );
}
