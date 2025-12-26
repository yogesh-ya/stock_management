import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateInvoiceRequest } from "@shared/schema";

export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return api.invoices.list.responses[200].parse(await res.json());
    },
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: [api.invoices.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.invoices.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch invoice");
      // Returns nested object, simplistic parse for now as schema defines nested structure in logic
      return await res.json(); 
    },
    enabled: !isNaN(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInvoiceRequest) => {
      const validated = api.invoices.create.input.parse(data);
      const res = await fetch(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create invoice");
      }
      return api.invoices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both invoices (to see new one) and items (stock decreased)
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
    },
  });
}
