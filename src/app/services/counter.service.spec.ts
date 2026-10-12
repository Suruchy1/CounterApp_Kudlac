import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    getMock.mockResolvedValue({ value: null });
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    service = TestBed.inject(CounterService);
  });

  // Test 1 - Inicializácia iba raz
  it('should initialize only once', async () => {
    await Promise.all([
      service.initialize(),
      service.initialize(),
    ]);

    await service.initialize();

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  // Test 2 - Načítanie uložených dát
  it('should load saved counters', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();

    expect(service.counters()).toEqual([first, second]);
    expect(service.initialized()).toBe(true);

    expect(getMock).toHaveBeenCalledWith({
      key: 'saved-counters',
    });
  });

  // Test 3 - Pridanie nového záznamu
  it('should add counter at the beginning', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([second]),
    });

    await service.initialize();
    await service.add(first);

    expect(service.counters()).toEqual([first, second]);

    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([first, second]),
    });
  });

  // Test 4 - Odstránenie jedného záznamu
  it('should remove counter by id', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();
    await service.remove('first');

    expect(service.counters()).toEqual([second]);

    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  // Test 5 - Vymazanie histórie
  it('should clear all counters', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();
    await service.clear();

    expect(service.counters()).toEqual([]);

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith({
      key: 'saved-counters',
    });

    expect(setMock).not.toHaveBeenCalled();
  });

  // Test 6 - Poškodený JSON
  it('should recover from invalid JSON', async () => {
    getMock.mockResolvedValue({
      value: 'this is not a valid JSON',
    });

    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      await service.initialize();

      expect(service.counters()).toEqual([]);
      expect(service.initialized()).toBe(true);

      expect(errorSpy).toHaveBeenCalledWith(
        'Historii počítadel se nepodařilo načíst.',
        expect.any(Error),
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});