import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import StockManagement from "./pages/stock-management";
import InvoiceForm from "./pages/invoice-form";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={StockManagement} />
      <Route path="/stock" component={StockManagement} />
      <Route path="/invoice/new" component={InvoiceForm} />
      <Route path="/invoice/print" component={InvoiceForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activePage, setActivePage] = useState("stock");

  const navigateTo = (page: string) => {
    setActivePage(page);
    window.location.pathname = page === "stock" ? "/stock" : page === "invoice" ? "/invoice/new" : "/invoices";
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <nav style={{ backgroundColor: "#333", color: "white", padding: "15px", display: "flex", gap: "20px" }}>
            <button
              onClick={() => navigateTo("stock")}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: activePage === "stock" ? "bold" : "normal",
                textDecoration: activePage === "stock" ? "underline" : "none",
              }}
            >
              Stock Management
            </button>
            <button
              onClick={() => navigateTo("invoice")}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: activePage === "invoice" ? "bold" : "normal",
                textDecoration: activePage === "invoice" ? "underline" : "none",
              }}
            >
              New Invoice
            </button>
          </nav>
          <main style={{ flex: 1 }}>
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
