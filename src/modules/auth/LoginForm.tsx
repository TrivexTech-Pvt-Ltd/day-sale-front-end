import { LockIcon, Mail, Chrome, Facebook, Apple } from "lucide-react"
import Button from "../../components/ui/Button"
import TextField from "../../components/ui/TextField"
import { usePasswordToggle } from "../../hooks/common/usePasswordToggle";

const LoginForm = () => {
    const { Icon, inputType, toggleVisibility } = usePasswordToggle();

    return (
        <>
            <h2 className="text-3xl sm:text-5xl text-gray-900 text-center md:text-left mb-5 montserrat-bold">
                Welcome Back
            </h2>

            <p className="text-gray-500 mb-8 text-center md:text-left text-base sm:text-xl font-medium">
                Please enter your credentials to sign in!
            </p>

            <form className="space-y-5">
                <TextField
                    placeholder="Enter your email"
                    label="Email" icon={<Mail size={20} />} />
                <TextField
                    placeholder="Enter your password"
                    label="Password"
                    icon={<LockIcon size={20} />}
                    rightIcon={<Icon size={20} onClick={toggleVisibility} className="cursor-pointer" />}
                    type={inputType}
                />
                <Button type="submit" label="Login" variant="primary" className="w-full" />
            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 text-sm shadow-sm hover:shadow"
                >
                    <Chrome size={20} className="text-[#4285F4]" />
                    Continue with Google
                </button>

                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 text-sm shadow-sm hover:shadow"
                >
                    <Facebook size={20} className="text-[#1877F2]" />
                    Continue with Facebook
                </button>

                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 text-sm shadow-sm hover:shadow"
                >
                    <Apple size={20} className="text-black" />
                    Continue with Apple
                </button>
            </div>
        </>
    )
}

export default LoginForm