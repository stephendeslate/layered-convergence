import { BadRequestException } from '@nestjs/common';
import { PipelineStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.DRAFT]: [PipelineStatus.ACTIVE],
  [PipelineStatus.ACTIVE]: [PipelineStatus.PAUSED, PipelineStatus.ARCHIVED],
  [PipelineStatus.PAUSED]: [PipelineStatus.ACTIVE, PipelineStatus.ARCHIVED],
  [PipelineStatus.ARCHIVED]: [],
};

export function validateTransition(
  from: PipelineStatus,
  to: PipelineStatus,
): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid status transition from ${from} to ${to}`,
    );
  }
}
