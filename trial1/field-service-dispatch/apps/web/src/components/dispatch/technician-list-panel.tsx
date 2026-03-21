'use client';

import type { TechnicianDto } from '@fsd/shared';
import { TECH_STATUS_COLORS } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDispatchStore } from '@/stores/dispatch-store';

export function TechnicianListPanel() {
  const { technicians, selectedTechnicianId, selectTechnician } = useDispatchStore();

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
        Technicians
      </h3>
      {technicians.map((tech) => {
        const statusConfig = TECH_STATUS_COLORS[tech.status];
        const isSelected = selectedTechnicianId === tech.id;
        const initials = getInitials(tech.user.firstName, tech.user.lastName);

        return (
          <button
            key={tech.id}
            onClick={() => selectTechnician(isSelected ? null : tech.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs" style={{ backgroundColor: tech.color + '30', color: tech.color }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusConfig.dot}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {tech.user.firstName} {tech.user.lastName}
              </div>
              <div className="text-xs text-gray-500">{statusConfig.label}</div>
            </div>
            <div className="text-xs text-gray-400">
              {(tech as any).workOrders?.length || 0} jobs
            </div>
          </button>
        );
      })}
      {technicians.length === 0 && (
        <div className="text-xs text-gray-400 text-center py-4">
          No technicians found
        </div>
      )}
    </div>
  );
}
