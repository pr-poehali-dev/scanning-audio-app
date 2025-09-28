
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WBPVZApp from "./pages/WBPVZApp";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// 🧹 ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ПАМЯТИ ПРИ ЗАПУСКЕ
const clearMemoryOnStartup = () => {
  console.log('🧹 === ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ПАМЯТИ ===');
  
  // Очищаем все временные данные
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('temp') || 
      key.includes('cache') || 
      key.includes('backup') ||
      key.startsWith('wb-audio-files-backup') ||
      key.startsWith('wb-audio-files-cells-backup')
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Удален временный ключ: ${key}`);
  });
  
  // Принудительная сборка мусора (если поддерживается)
  if (window.gc) {
    window.gc();
    console.log('🔄 Принудительная сборка мусора выполнена');
  }
  
  console.log(`✅ Очистка завершена. Удалено ${keysToRemove.length} временных ключей`);
};

const App = () => {
  useEffect(() => {
    clearMemoryOnStartup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WBPVZApp />} />
          <Route path="/warehouse" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;