/** Stable checksum for comparing a sketch with the last successful compile. Not a cryptographic claim. */
export function sketchChecksum(source: string): string {
  let hash = 5381
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash * 33) ^ source.charCodeAt(index)) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
