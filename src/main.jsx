import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Game from './components/game/Game.jsx'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from './Layout.jsx'

const router = createBrowserRouter([
  {
    path:"/",
    element: <Layout />,
    children: [
      {
        path:"",
        element: <App/>
      },
      {
        path:"Game",
        element: <Game/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
)
