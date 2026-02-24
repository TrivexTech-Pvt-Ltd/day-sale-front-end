
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routeConfig } from './routes/RouteConfig';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { APP_CONFIG } from './config';

function App() {

  const router = createBrowserRouter(routeConfig);
  return (
    <>
      <GoogleOAuthProvider clientId={APP_CONFIG.GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </>
  )
}

export default App
