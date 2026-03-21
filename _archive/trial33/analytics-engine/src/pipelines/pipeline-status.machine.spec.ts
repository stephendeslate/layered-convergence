import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { validateTransition, VALID_TRANSITIONS } from './pipeline-status.machine';

describe('Pipeline Status Machine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should allow DRAFT -> ACTIVE', () => {
      expect(VALID_TRANSITIONS.DRAFT).toContain('ACTIVE');
    });

    it('should not allow DRAFT -> PAUSED', () => {
      expect(VALID_TRANSITIONS.DRAFT).not.toContain('PAUSED');
    });

    it('should not allow DRAFT -> ARCHIVED', () => {
      expect(VALID_TRANSITIONS.DRAFT).not.toContain('ARCHIVED');
    });

    it('should allow ACTIVE -> PAUSED', () => {
      expect(VALID_TRANSITIONS.ACTIVE).toContain('PAUSED');
    });

    it('should allow ACTIVE -> ARCHIVED', () => {
      expect(VALID_TRANSITIONS.ACTIVE).toContain('ARCHIVED');
    });

    it('should allow PAUSED -> ACTIVE', () => {
      expect(VALID_TRANSITIONS.PAUSED).toContain('ACTIVE');
    });

    it('should allow PAUSED -> ARCHIVED', () => {
      expect(VALID_TRANSITIONS.PAUSED).toContain('ARCHIVED');
    });

    it('should not allow any transition from ARCHIVED', () => {
      expect(VALID_TRANSITIONS.ARCHIVED).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    it('should not throw for valid DRAFT -> ACTIVE', () => {
      expect(() => validateTransition('DRAFT' as any, 'ACTIVE' as any)).not.toThrow();
    });

    it('should throw BadRequestException for DRAFT -> PAUSED', () => {
      expect(() => validateTransition('DRAFT' as any, 'PAUSED' as any)).toThrow(
        BadRequestException,
      );
    });

    it('should throw with descriptive message', () => {
      expect(() => validateTransition('ARCHIVED' as any, 'ACTIVE' as any)).toThrow(
        /Invalid status transition from ARCHIVED to ACTIVE/,
      );
    });

    it('should not throw for ACTIVE -> PAUSED', () => {
      expect(() => validateTransition('ACTIVE' as any, 'PAUSED' as any)).not.toThrow();
    });

    it('should not throw for PAUSED -> ACTIVE', () => {
      expect(() => validateTransition('PAUSED' as any, 'ACTIVE' as any)).not.toThrow();
    });

    it('should throw for ARCHIVED -> DRAFT', () => {
      expect(() => validateTransition('ARCHIVED' as any, 'DRAFT' as any)).toThrow(
        BadRequestException,
      );
    });
  });
});
