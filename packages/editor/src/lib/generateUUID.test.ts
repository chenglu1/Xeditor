import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateUUID } from './generateUUID';

const originalCrypto = globalThis.crypto;

function setCrypto(value: Crypto | undefined) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value,
  });
}

describe('generateUUID', () => {
  afterEach(() => {
    setCrypto(originalCrypto);
    vi.restoreAllMocks();
  });

  it('uses crypto.randomUUID when available', () => {
    setCrypto({
      randomUUID: vi.fn(() => '11111111-2222-4333-8444-555555555555'),
    } as unknown as Crypto);

    expect(generateUUID()).toBe('11111111-2222-4333-8444-555555555555');
  });

  it('falls back to crypto.getRandomValues and emits a UUID v4', () => {
    setCrypto({
      getRandomValues: vi.fn((buffer: Uint8Array) => {
        buffer.set([
          0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa,
          0xbb, 0xcc, 0xdd, 0xee, 0xff,
        ]);
        return buffer;
      }),
    } as unknown as Crypto);

    expect(generateUUID()).toBe('00112233-4455-4677-8899-aabbccddeeff');
  });

  it('falls back to Math.random in non-crypto environments', () => {
    setCrypto(undefined);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(generateUUID()).toBe('88888888-8888-4888-8888-888888888888');
    expect(randomSpy).toHaveBeenCalled();
  });
});
