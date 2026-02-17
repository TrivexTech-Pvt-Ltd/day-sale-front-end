import { Navigate } from "react-router-dom";
import { lazy } from "react";

//Layouts
import AuthLayout from "../layouts/AuthLayout";


//Routes
const Login = lazy(() => import("../pages/Login"));


export const routeConfig = [
  {

    children: [
      {
        path: "/",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Login />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Navigate to="/" replace />,
  },
];

