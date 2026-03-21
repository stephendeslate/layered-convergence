import { create } from 'zustand';
import type { WorkOrderDto, TechnicianDto, RouteDto, GpsUpdate } from '@fsd/shared';
import type { WorkOrderStatus } from '@fsd/shared';
import { api } from '@/lib/api';

interface TechnicianWithRoute extends TechnicianDto {
  workOrders: WorkOrderDto[];
  route: RouteDto | null;
}

interface DispatchState {
  date: string;
  workOrders: WorkOrderDto[];
  technicians: TechnicianWithRoute[];
  selectedWorkOrderId: string | null;
  selectedTechnicianId: string | null;
  isLoading: boolean;
  setDate: (date: string) => void;
  loadDispatchData: () => Promise<void>;
  selectWorkOrder: (id: string | null) => void;
  selectTechnician: (id: string | null) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus, notes?: string) => Promise<void>;
  assignTechnician: (workOrderId: string, technicianId: string) => Promise<void>;
  updateTechnicianPosition: (update: GpsUpdate) => void;
  moveWorkOrder: (workOrderId: string, newStatus: WorkOrderStatus) => void;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export const useDispatchStore = create<DispatchState>((set, get) => ({
  date: todayString(),
  workOrders: [],
  technicians: [],
  selectedWorkOrderId: null,
  selectedTechnicianId: null,
  isLoading: false,

  setDate: (date) => {
    set({ date });
    get().loadDispatchData();
  },

  loadDispatchData: async () => {
    set({ isLoading: true });
    try {
      const [workOrders, technicians] = await Promise.all([
        api.get<WorkOrderDto[]>(`/work-orders?date=${get().date}`),
        api.get<TechnicianWithRoute[]>(`/technicians?include=workOrders,route&date=${get().date}`),
      ]);
      set({ workOrders, technicians, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectWorkOrder: (id) => set({ selectedWorkOrderId: id }),
  selectTechnician: (id) => set({ selectedTechnicianId: id }),

  updateWorkOrderStatus: async (id, status, notes) => {
    await api.patch(`/work-orders/${id}/transition`, { status, notes });
    // Optimistic: update local state
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === id ? { ...wo, status } : wo,
      ),
    }));
  },

  assignTechnician: async (workOrderId, technicianId) => {
    await api.post(`/work-orders/${workOrderId}/assign`, { technicianId });
    await get().loadDispatchData();
  },

  updateTechnicianPosition: (update) => {
    set((s) => ({
      technicians: s.technicians.map((t) =>
        t.id === update.technicianId
          ? {
              ...t,
              currentLatitude: update.latitude,
              currentLongitude: update.longitude,
              lastPositionAt: update.timestamp,
            }
          : t,
      ),
    }));
  },

  moveWorkOrder: (workOrderId, newStatus) => {
    set((s) => ({
      workOrders: s.workOrders.map((wo) =>
        wo.id === workOrderId ? { ...wo, status: newStatus } : wo,
      ),
    }));
  },
}));
