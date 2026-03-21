import { describe, it, expect } from 'vitest';
import { VALID_TRANSITIONS, DATA_SOURCE_TRANSITIONS } from './transitions';

describe('VALID_TRANSITIONS (SyncRun)', () => {
  it('should allow pending -> running', () => {
    expect(VALID_TRANSITIONS.pending).toContain('running');
  });

  it('should allow running -> completed', () => {
    expect(VALID_TRANSITIONS.running).toContain('completed');
  });

  it('should allow running -> failed', () => {
    expect(VALID_TRANSITIONS.running).toContain('failed');
  });

  it('should allow failed -> pending', () => {
    expect(VALID_TRANSITIONS.failed).toContain('pending');
  });

  it('should not allow completed -> anything', () => {
    expect(VALID_TRANSITIONS.completed).toHaveLength(0);
  });

  it('should not allow pending -> completed directly', () => {
    expect(VALID_TRANSITIONS.pending).not.toContain('completed');
  });

  it('should not allow pending -> failed directly', () => {
    expect(VALID_TRANSITIONS.pending).not.toContain('failed');
  });
});

describe('DATA_SOURCE_TRANSITIONS', () => {
  it('should allow active -> paused', () => {
    expect(DATA_SOURCE_TRANSITIONS.active).toContain('paused');
  });

  it('should allow active -> archived', () => {
    expect(DATA_SOURCE_TRANSITIONS.active).toContain('archived');
  });

  it('should allow paused -> active', () => {
    expect(DATA_SOURCE_TRANSITIONS.paused).toContain('active');
  });

  it('should allow paused -> archived', () => {
    expect(DATA_SOURCE_TRANSITIONS.paused).toContain('archived');
  });

  it('should not allow archived -> anything', () => {
    expect(DATA_SOURCE_TRANSITIONS.archived).toHaveLength(0);
  });
});
