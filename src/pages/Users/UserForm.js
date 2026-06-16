import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { getRoles } from "../../services/role";

export default function UserForm({ user = null, onClose, onSuccess }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    status: "active",
  });

  useEffect(() => {
    // Fetch roles list for dropdown
    const fetchRoles = async () => {
      try {
        const res = await getRoles();
        if (res.success) {
          setRoles(res.data);
        }
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(" ") : ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData({
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
        roleId: user.role_ids && user.role_ids.length > 0 ? user.role_ids[0].toString() : "",
        status: user.status || "active",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.roleId) newErrors.roleId = "Role is required";

    if (!user) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must contain minimum 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      if (formData.password) {
        if (formData.password.length < 8) {
          newErrors.password = "Password must contain minimum 8 characters";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    if (formData.phone && formData.phone.trim()) {
      const mobileRegex = /^\+?[0-9\s-]{8,15}$/;
      if (!mobileRegex.test(formData.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        roleIds: [Number(formData.roleId)],
        status: formData.status,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await onSuccess(payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-600 block mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            error={!!errors.firstName}
            errorMessage={errors.firstName}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600 block mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            error={!!errors.lastName}
            errorMessage={errors.lastName}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600 block mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john.doe@example.com"
          error={!!errors.email}
          errorMessage={errors.email}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600 block mb-1">Phone Number (Optional)</label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1234567890"
          error={!!errors.phone}
          errorMessage={errors.phone}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-600 block mb-1">
            Password {!user && <span className="text-red-500">*</span>} {user && "(Leave blank to keep)"}
          </label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="******"
            error={!!errors.password}
            errorMessage={errors.password}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600 block mb-1">
            Confirm Password {!user && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="******"
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-600 block mb-1">
            User Role <span className="text-red-500">*</span>
          </label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={`w-full border ${errors.roleId ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-[#E6E6E6] focus:border-[#981B1F] focus:ring-[#981B1F]/15'} text-[#111111] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition`}
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {errors.roleId && (
            <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
              {errors.roleId}
            </span>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-600 block mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
