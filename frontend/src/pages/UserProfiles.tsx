import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { useModal } from "../hooks/useModal";

interface UserProfile {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  roles: number;
  avatar: string | null;
  avatar_url: string | null;
}

export default function UserProfiles() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/profile`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setUser(response.data.user);
        resetFormState(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = (profile: UserProfile) => {
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setEmail(profile.email);
    setPhone(profile.phone || "");
    setCurrentPassword("");
    setPassword("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    setSuccessMsg(null);
  };

  useEffect(() => {
    fetchProfile();
  }, [apiUrl, token]);

  // Handle local state updates when opening modal
  useEffect(() => {
    if (isOpen && user) {
      resetFormState(user);
    }
  }, [isOpen, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaveLoading(true);

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("phone", phone);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (password) {
        formData.append("current_password", currentPassword);
        formData.append("password", password);
      }

      const response = await axios.post(`${apiUrl}/profile`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Sync local storage display details
        localStorage.setItem("name", response.data.user.name);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("avatar_url", response.data.user.avatar_url || "");

        setSuccessMsg("Profile updated successfully!");

        // Trigger page re-fetch
        fetchProfile();

        setTimeout(() => {
          closeModal();
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ClipLoader size={35} color="#465fff" />
      </div>
    );
  }

  const avatarDisplay = user?.avatar_url || "/images/user/owner.jpg";

  return (
    <>
      <PageMeta
        title="Profile | LeadFlow"
        description="Leads Management System"
      />
      <PageBreadcrumb pageTitle="Profile" />

      <div className="space-y-6">
        {/* Unified Profile Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-xs">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-6 sm:flex-row text-center sm:text-left w-full">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-brand-500 shadow-md">
                <img
                  src={avatarDisplay}
                  alt="user avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-850 dark:text-white/90">
                  {user?.name}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {user?.roles === 1 ? "Admin" : "Sales Representative"}
                </p>
              </div>
            </div>
            <button
              onClick={openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:inline-flex sm:w-auto cursor-pointer"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Detailed Information Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-xs">
          <h4 className="text-lg font-bold text-gray-850 dark:text-white/90 mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                {user?.first_name}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                {user?.last_name}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Phone Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                {user?.phone || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your personal details, profile picture, and security password.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3 space-y-6">

              {/* Status Notifications */}
              {error && (
                <div className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-emerald-600 dark:text-emerald-400">
                  {successMsg}
                </div>
              )}

              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center gap-4 sm:flex-row bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-500 shadow-sm flex-shrink-0">
                  <img
                    src={avatarPreview || avatarDisplay}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-850 dark:text-white/90 mb-1">
                    Profile Picture
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    PNG, JPG or JPEG. Max 2MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                  >
                    Choose Photo
                  </button>
                </div>
              </div>

              {/* Personal details inputs */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Current Password (to change password)</Label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label>New Password (min 8 chars)</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saveLoading}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
              <Button size="sm" disabled={saveLoading}>
                {saveLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
