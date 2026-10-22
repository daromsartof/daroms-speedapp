import { AppError, toAppError, unwrap } from '../errors'

describe('toAppError', () => {
  it.each([
    [{ code: 'PGRST116', message: 'no rows' }, 'notFound'],
    [{ code: '23505', message: 'duplicate' }, 'conflict'],
    [{ code: '42501', message: 'rls' }, 'forbidden'],
    [{ status: 401, message: 'jwt expired' }, 'unauthorized'],
    [{ status: 429, message: 'slow down' }, 'rateLimit'],
    [new TypeError('Network request failed'), 'network'],
    [{ name: 'ZodError', message: 'bad' }, 'validation'],
    ['boom', 'unknown'],
  ])('%p -> %s', (input, code) => {
    const error = toAppError(input)
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe(code)
    expect(error.messageKey).toBe(`daroms:errors.${code}`)
  })

  it('unwrap renvoie data ou lève', () => {
    expect(unwrap({ data: [1], error: null })).toEqual([1])
    expect(() => unwrap({ data: null, error: { code: '42501', message: 'rls' } })).toThrow(AppError)
  })
})
