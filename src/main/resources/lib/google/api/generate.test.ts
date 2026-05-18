import { createResponse } from '/tests/testUtils/testHelpers';
import { describe, expect, it, vi } from 'vitest';

import type { GenerateContentRequest } from '../types';

import { content } from '../../../../../../tests/testUtils/fixtures/google';
import { ERRORS } from '../../../shared/errors';
import * as Client from '../client';
import { generate } from './generate';

vi.mock('../client', async (importOriginal) => {
  const original = await importOriginal<typeof Client>();
  return {
    ...original,
    sendPostRequest: vi.fn(),
  };
});

describe('generate', () => {
  const params: GenerateContentRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Write a haiku about a mountain.' }],
      },
    ],
  };

  it('should generate content', () => {
    const mockedSend = vi.mocked(Client.sendPostRequest);
    mockedSend.mockImplementationOnce(() => [createResponse(content), null]);

    const [result, err] = generate(params);

    expect(result).toEqual(content);
    expect(err).toBeNull();

    expect(mockedSend).toHaveBeenCalledWith(params);
  });

  it('should return an error if content cannot be generated', () => {
    const mockedSend = vi.mocked(Client.sendPostRequest);
    mockedSend.mockImplementationOnce(() => [null, ERRORS.REST_REQUEST_FAILED]);

    const [result, err] = generate(params);

    expect(result).toBeNull();
    expect(err).toEqual(ERRORS.REST_REQUEST_FAILED);
  });
});
