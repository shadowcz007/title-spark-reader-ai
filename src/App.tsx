import { useState } from 'react';
import { Toaster, TooltipProvider } from "@/ui";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import InputPage from "./pages/InputPage";
import ProgressPage from "./pages/ProgressPage";
import ResultsPage from "./pages/ResultsPage";
import ReadersPage from "./pages/ReadersPage";
import { ProgressStage, ProgressState } from "@/types";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/simulate" element={<Index />} />
            <Route path="/input" element={<InputPage title="" onTitleChange={() => {}} onGenerate={() => {}} />} /> {/* Dummy props for now */}
            <Route path="/progress" element={<ProgressPage progressState={{ stage: ProgressStage.IDLE, currentStep: 0, totalSteps: 0, currentTitle: "", currentPersona: "", stageDescription: "" }} />} /> {/* Dummy props for now */}
            <Route path="/results" element={<ResultsPage results={[]} />} /> {/* Dummy props for now */}
            <Route path="/readers" element={<ReadersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
