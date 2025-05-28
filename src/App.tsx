
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/components/auth/AuthProvider"
import Index from "./pages/Index"
import Auth from "./pages/Auth"
import Drive from "./pages/Drive"
import Chat from "./pages/Chat"
import Agent from "./pages/Agent"
import ImagenGenerator from "./pages/ImagenGenerator"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/drive" element={<Drive />} />
            {/* Add redirect for handling OAuth callbacks with hash */}
            <Route path="/drive#" element={<Navigate to="/drive" replace />} />
            <Route path="/#" element={<Navigate to="/" replace />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/imagen" element={<ImagenGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
