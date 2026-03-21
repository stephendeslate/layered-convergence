import { BadRequestException } from '@nestjs/common';
import { PipelineStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  DRAFT: [PipelineStatus.ACTIVE],
  ACTIVE: [PipelineStatus.PAUSED, PipelineStatus.ARCHIVED],
  PAUSED: [PipelineStatus.ACTIVE, PipelineStatus.ARCHIVED],
  ARCHIVED: [],
};

export function validatePipelineTransition(
  from: PipelineStatus,
  to: PipelineStatus,
): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid pipeline transition from ${from} to ${to}`,
    );
  }
}
