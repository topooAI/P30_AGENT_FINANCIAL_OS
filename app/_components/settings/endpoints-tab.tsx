"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Trash2, Layers, Globe, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

type WarehouseMapping = {
  warehouse_id: number;
  weight: number;
  priority: number;
};

type Endpoint = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "paused";
  mappings: WarehouseMapping[];
  created_at: string;
};

type Warehouse = {
  id: number;
  name: string;
  node_count: number;
};

export function EndpointsTab() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMappings, setSelectedMappings] = useState<WarehouseMapping[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [epRes, whRes] = await Promise.all([
        fetch("/api/v1/pool/endpoints"),
        fetch("/api/v1/pool/warehouses")
      ]);
      const epData = await epRes.json<{ endpoints: Endpoint[] }>();
      const whData = await whRes.json<{ warehouses: Warehouse[] }>();
      setEndpoints(epData.endpoints ?? []);
      setWarehouses(whData.warehouses ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleWarehouse = (whId: number) => {
    setSelectedMappings(prev => {
      const exists = prev.find(m => m.warehouse_id === whId);
      if (exists) {
        return prev.filter(m => m.warehouse_id !== whId);
      } else {
        return [...prev, { warehouse_id: whId, weight: 1, priority: 0 }];
      }
    });
  };

  const updateMappingWeight = (whId: number, weight: number) => {
    setSelectedMappings(prev => prev.map(m => 
      m.warehouse_id === whId ? { ...m, weight: Math.max(1, weight) } : m
    ));
  };

  async function handleCreateEndpoint() {
    if (!name || !slug) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/pool/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, mappings: selectedMappings })
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setSlug("");
        setDescription("");
        setSelectedMappings([]);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEndpoint(id: number) {
    if (!confirm("Are you sure you want to remove this endpoint?")) return;
    try {
      await fetch(`/api/v1/pool/endpoints/${id}`, { method: "DELETE" });
      loadData();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-foreground tracking-tight">API Endpoints</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Configure virtual API routes and map them to compute warehouses.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="size-3.5" />
          New Endpoint
        </button>
      </div>

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-9 px-4 text-[11px] font-medium text-muted-foreground tracking-tight uppercase">Endpoint</TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-medium text-muted-foreground tracking-tight uppercase">URL Slug</TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-medium text-muted-foreground tracking-tight uppercase">Pools</TableHead>
              <TableHead className="h-9 px-4 text-[11px] font-medium text-muted-foreground tracking-tight uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[12px] text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : endpoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[12px] text-muted-foreground italic">No custom endpoints.</TableCell>
              </TableRow>
            ) : (
              endpoints.map((ep) => (
                <TableRow key={ep.id} className="group border-b border-border/40 hover:bg-muted/10 transition-none">
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground leading-none">{ep.name}</span>
                      <span className="text-[11px] text-muted-foreground/60 mt-1 truncate max-w-[120px]">{ep.description || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <code className="text-[11px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">/v1/{ep.slug}</code>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Activity className="size-3 text-emerald-500" />
                      <span className="text-[12px] font-medium text-muted-foreground">{ep.mappings?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDeleteEndpoint(ep.id)}
                      className="p-1.5 rounded-md text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-white shadow-2xl rounded-2xl">
          <div className="px-6 py-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-medium tracking-tight text-zinc-950">New API Endpoint</DialogTitle>
              <DialogDescription className="text-[12px] text-zinc-500">
                Define a virtual route across multiple resource pools.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 ml-0.5 uppercase tracking-wider">Name</label>
                  <input 
                    type="text"
                    className="w-full h-9 bg-zinc-50 border border-zinc-100 rounded-lg px-3 text-[12px] focus:outline-none focus:border-zinc-300 transition-all"
                    placeholder="e.g. Pro Pool"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 ml-0.5 uppercase tracking-wider">URL Slug</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-[12px]">/v1/</span>
                    <input 
                      type="text"
                      className="w-full h-9 bg-zinc-50 border border-zinc-100 rounded-lg pl-9 pr-3 text-[12px] focus:outline-none focus:border-zinc-300 transition-all font-mono"
                      placeholder="topoox"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-400 ml-0.5 uppercase tracking-wider">Map to Warehouses</label>
                <div className="rounded-lg border border-zinc-100 overflow-hidden divide-y divide-zinc-50 bg-zinc-50/30 max-h-[160px] overflow-y-auto content-scrollbar">
                  {warehouses.length === 0 ? (
                    <div className="p-4 text-center text-zinc-400 text-[11px]">No pools found.</div>
                  ) : (
                    warehouses.map(wh => {
                      const isSelected = selectedMappings.find(m => m.warehouse_id === wh.id);
                      return (
                        <div key={wh.id} className="flex items-center justify-between p-3 group hover:bg-white transition-colors">
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleToggleWarehouse(wh.id)}
                              className="size-3.5 rounded border-zinc-200 text-zinc-900 focus:ring-zinc-900"
                            />
                            <div className="flex flex-col">
                              <span className="text-[12px] font-medium text-zinc-800">{wh.name}</span>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-zinc-400">WT</span>
                              <input 
                                type="number"
                                className="w-10 h-7 bg-white border border-zinc-100 rounded text-center text-[11px] focus:outline-none focus:border-zinc-300 shadow-sm"
                                value={isSelected.weight}
                                onChange={e => updateMappingWeight(wh.id, parseInt(e.target.value) || 1)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button 
                className="flex-1 h-10 text-[12px] font-medium text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-zinc-950 text-white hover:bg-zinc-900 h-10 text-[12px] font-medium rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={submitting || !name || !slug || selectedMappings.length === 0}
                onClick={handleCreateEndpoint}
              >
                <ShieldCheck className="size-3.5" />
                {submitting ? "Deploying..." : "Deploy Endpoint"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
