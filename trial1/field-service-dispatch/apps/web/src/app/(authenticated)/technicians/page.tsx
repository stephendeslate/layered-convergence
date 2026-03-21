'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { TECH_STATUS_COLORS } from '@/lib/constants';
import { getInitials, serviceTypeLabel } from '@/lib/utils';
import type { TechnicianDto } from '@fsd/shared';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<TechnicianDto[] | { data: TechnicianDto[] }>('/technicians')
      .then((res) => {
        setTechnicians(Array.isArray(res) ? res : (res as any).data || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = technicians.filter((t) => {
    const name = `${t.user.firstName} ${t.user.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
          <p className="text-sm text-gray-500 mt-1">{technicians.length} team members</p>
        </div>
      </div>

      <Input
        placeholder="Search technicians..."
        className="max-w-xs"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tech) => {
            const statusConfig = TECH_STATUS_COLORS[tech.status];
            const initials = getInitials(tech.user.firstName, tech.user.lastName);

            return (
              <Link key={tech.id} href={`/technicians/${tech.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback
                            className="text-sm font-semibold"
                            style={{ backgroundColor: tech.color + '25', color: tech.color }}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusConfig.dot}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          {tech.user.firstName} {tech.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{tech.user.email}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                          />
                          <span className="text-xs text-gray-600">{statusConfig.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {tech.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">
                          {serviceTypeLabel(skill)}
                        </Badge>
                      ))}
                      {tech.skills.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{tech.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Max {tech.maxJobsPerDay} jobs/day</span>
                      {tech.vehicleInfo && <span>{tech.vehicleInfo}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
