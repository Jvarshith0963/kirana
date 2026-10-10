
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PROFILE_KEY = "kirana_user_profile";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let savedProfile = {};

    try {
      savedProfile = JSON.parse(
        localStorage.getItem(PROFILE_KEY) || "{}"
      );
    } catch {
      savedProfile = {};
    }

    setProfile({
      name:
        savedProfile.name ||
        savedProfile.fullName ||
        user?.name ||
        user?.full_name ||
        user?.fullName ||
        "",
      email:
        savedProfile.email ||
        user?.email ||
        "",
      phone:
        savedProfile.phone ||
        savedProfile.phone_number ||
        user?.phone ||
        user?.phone_number ||
        "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    const updatedProfile = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    };

    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(updatedProfile)
    );

    setProfile(updatedProfile);
    setIsEditing(false);
    setMessage("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const accountType =
    user?.role || user?.accountType || "customer";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account information
        </p>

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-green-700">
            {message}
          </p>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.name || "Not available"}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.email || "Not available"}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.phone || "Not available"}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="mt-1 font-semibold capitalize text-gray-800">
                {accountType}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setIsEditing(true);
              }}
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              Edit Profile
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <Link
            to="/"
            className="font-medium text-green-700 hover:underline"
          >
            ← Back to Home
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-600 hover:bg-red-100"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
