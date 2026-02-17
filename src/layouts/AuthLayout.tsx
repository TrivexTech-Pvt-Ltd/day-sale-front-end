import { LoginBg } from "../utils/staticImages"
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex">
            <div className="w-1/2 relative hidden md:flex items-center justify-center bg-black">
                <img
                    src={LoginBg}
                    alt="bizDailyFlow"
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
            </div>
            <div className="w-full md:w-1/2 bg-linear-to-br from-white via-white to-primaryLight px-6 sm:px-10 md:px-20 xl:px-36 py-16 flex flex-col justify-center relative">
                <Outlet />
            </div>
        </div>
    )
}

export default AuthLayout