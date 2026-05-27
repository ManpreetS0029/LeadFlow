import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import {useNavigate} from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import {ClipLoader} from "react-spinners";

export default function SignInForm() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
    ...form,
    [e.target.name]: e.target.value
    });
  };

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL;

    try
    {

      const response = await axios.post(`${apiUrl}/login`, form);

      if(response.data.success)
      {
        localStorage.setItem("user_id", response.data.user.id);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("role_id", response.data.role_id);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("avatar_url", response.data.avatar_url || "");
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("permissions", JSON.stringify(response.data.permissions));
        navigate("/dashboard");
      }

    }
    catch(error)
    {
     if(error.response?.status == 422)
     {
      setErrors(error.response?.data.errors);
     }
     else
     {
      Swal.fire({
        title: "Something went wrong!",
        icon: "error"
      });
     }
    }
    finally
    {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="flex flex-col flex-1">
     
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
     
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="info@gmail.com" name="email" id="email" value={form.email} onChange={handleChange}/>
                   {errors.email && <p className="text-red-500">{errors.email[0]}</p>}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      name="password"
                      id="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                     {errors.password && <p className="text-red-500">{errors.password[0]}</p>}
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div> */}
                <div>
                  <Button className="w-full" size="sm">
                    {loading ? (<><ClipLoader size={18} color="#fff" /></>) : ("Sign In")}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
