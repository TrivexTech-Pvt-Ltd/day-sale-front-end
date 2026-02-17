
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routeConfig } from './routes/RouteConfig';

function App() {
 
 const router = createBrowserRouter(routeConfig);
  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App
