"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState(null);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", new_password2: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login?next=/account");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  if (!profileForm) return <p className="max-w-2xl mx-auto px-5 py-16 text-ink-muted">Loading…</p>;

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    try {
      await api.patch("/accounts/profile/", profileForm, { auth: true });
      await refreshUser();
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileErr(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    try {
      await api.post("/accounts/change-password/", pwForm, { auth: true });
      setPwMsg("Password changed.");
      setPwForm({ old_password: "", new_password: "", new_password2: "" });
    } catch (err) {
      setPwErr(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-14 space-y-14">
      <div>
        <h1 className="font-display text-3xl mb-8">Profile</h1>
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-caps text-ink-muted block mb-2">First Name</label>
              <input
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Last Name</label>
              <input
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
              />
            </div>
          </div>
          <div>
            <label className="label-caps text-ink-muted block mb-2">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="label-caps text-ink-muted block mb-2">Phone Number</label>
            <input
              value={profileForm.phone_number}
              onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
          {profileMsg && <p className="text-emerald-500 text-sm">{profileMsg}</p>}
          {profileErr && <p className="text-error text-sm">{profileErr}</p>}
          <button type="submit" className="px-8 py-3 bg-gold text-bg label-caps rounded hover:opacity-90">
            Save Changes
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-8">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-5">
          <div>
            <label className="label-caps text-ink-muted block mb-2">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.old_password}
              onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="label-caps text-ink-muted block mb-2">New Password</label>
            <input
              type="password"
              required
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="label-caps text-ink-muted block mb-2">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwForm.new_password2}
              onChange={(e) => setPwForm({ ...pwForm, new_password2: e.target.value })}
              className="w-full bg-surface-1 border border-outline-soft rounded px-4 py-3 text-ink focus:border-gold outline-none"
            />
          </div>
          {pwMsg && <p className="text-emerald-500 text-sm">{pwMsg}</p>}
          {pwErr && <p className="text-error text-sm">{pwErr}</p>}
          <button type="submit" className="px-8 py-3 border border-outline-soft label-caps rounded hover:border-gold hover:text-gold">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
