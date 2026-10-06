declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void
}

declare module 'node:assert/strict' {
  namespace assert {
    function equal(actual: unknown, expected: unknown, message?: string | Error): void
    function deepEqual(actual: unknown, expected: unknown, message?: string | Error): void
    function ok(value: unknown, message?: string | Error): asserts value
  }
  export default assert
}
