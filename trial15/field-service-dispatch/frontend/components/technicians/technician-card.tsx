import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityIndicator } from "./availability-indicator";
import type { Technician } from "@/lib/types";
import { Mail, MapPin, Phone } from "lucide-react";

interface TechnicianCardProps {
  technician: Technician;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  return (
    <Link href={`/technicians/${technician.id}`}>
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        data-testid="technician-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold">
              {technician.name}
            </CardTitle>
            <AvailabilityIndicator availability={technician.availability} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {technician.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{technician.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{technician.phone}</span>
            </div>
            {technician.latitude !== null && technician.longitude !== null && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {technician.latitude.toFixed(4)},{" "}
                  {technician.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
