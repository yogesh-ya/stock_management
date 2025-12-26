import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema, type InsertItem, type Item } from "@shared/schema";
import { z } from "zod";
import { useCreateItem, useUpdateItem } from "@/hooks/use-inventory";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "./Button";
import { X } from "lucide-react";
import { useEffect } from "react";

// Form schema with coercions for number inputs
const formSchema = insertItemSchema.extend({
  price: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid price"),
  stock: z.coerce.number().int().min(0),
});

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: Item | null;
}

export function InventoryModal({ open, onOpenChange, itemToEdit }: InventoryModalProps) {
  const { toast } = useToast();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const isEditing = !!itemToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0.00",
      stock: 0,
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      form.reset({
        name: itemToEdit.name,
        description: itemToEdit.description || "",
        price: itemToEdit.price,
        stock: itemToEdit.stock,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: "0.00",
        stock: 0,
      });
    }
  }, [itemToEdit, open, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && itemToEdit) {
        await updateItem.mutateAsync({ id: itemToEdit.id, ...data });
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        await createItem.mutateAsync(data);
        toast({ title: "Success", description: "Item created successfully" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <DialogTitle className="text-xl font-display font-bold text-gray-900">
            {isEditing ? "Edit Item" : "New Item"}
          </DialogTitle>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              {...form.register("name")}
              className="input-field"
              placeholder="e.g. Wireless Mouse"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Price ($)</label>
              <input
                {...form.register("price")}
                type="number"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Stock</label>
              <input
                {...form.register("stock")}
                type="number"
                className="input-field"
                placeholder="0"
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-red-500">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              {...form.register("description")}
              className="input-field min-h-[100px] resize-none"
              placeholder="Enter product details..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {isEditing ? "Save Changes" : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
