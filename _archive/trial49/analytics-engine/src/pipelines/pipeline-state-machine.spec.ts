import { BadRequestException } from '@nestjs/common';
import {
  VALID_TRANSITIONS,
  validatePipelineTransition,
} from './pipeline-state-machine';

describe('Pipeline State Machine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should allow DRAFT -> ACTIVE', () => {
      expect(VALID_TRANSITIONS.DRAFT).toContain('ACTIVE');
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

    it('should not allow any transitions from ARCHIVED', () => {
      expect(VALID_TRANSITIONS.ARCHIVED).toHaveLength(0);
    });

    it('should not allow DRAFT -> PAUSED', () => {
      expect(VALID_TRANSITIONS.DRAFT).not.toContain('PAUSED');
    });

    it('should not allow DRAFT -> ARCHIVED', () => {
      expect(VALID_TRANSITIONS.DRAFT).not.toContain('ARCHIVED');
    });
  });

  describe('validatePipelineTransition', () => {
    it('should not throw for DRAFT -> ACTIVE', () => {
      expect(() => validatePipelineTransition('DRAFT', 'ACTIVE')).not.toThrow();
    });

    it('should not throw for ACTIVE -> PAUSED', () => {
      expect(() => validatePipelineTransition('ACTIVE', 'PAUSED')).not.toThrow();
    });

    it('should not throw for ACTIVE -> ARCHIVED', () => {
      expect(() => validatePipelineTransition('ACTIVE', 'ARCHIVED')).not.toThrow();
    });

    it('should not throw for PAUSED -> ACTIVE', () => {
      expect(() => validatePipelineTransition('PAUSED', 'ACTIVE')).not.toThrow();
    });

    it('should not throw for PAUSED -> ARCHIVED', () => {
      expect(() => validatePipelineTransition('PAUSED', 'ARCHIVED')).not.toThrow();
    });

    it('should throw BadRequestException for DRAFT -> PAUSED', () => {
      expect(() => validatePipelineTransition('DRAFT', 'PAUSED')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for DRAFT -> ARCHIVED', () => {
      expect(() => validatePipelineTransition('DRAFT', 'ARCHIVED')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for ARCHIVED -> ACTIVE', () => {
      expect(() => validatePipelineTransition('ARCHIVED', 'ACTIVE')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for ARCHIVED -> DRAFT', () => {
      expect(() => validatePipelineTransition('ARCHIVED', 'DRAFT')).toThrow(
        BadRequestException,
      );
    });

    it('should include from and to in error message', () => {
      try {
        validatePipelineTransition('ARCHIVED', 'ACTIVE');
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as BadRequestException).message).toContain('ARCHIVED');
        expect((error as BadRequestException).message).toContain('ACTIVE');
      }
    });
  });
});
