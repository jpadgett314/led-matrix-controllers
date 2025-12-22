export function pad(arr, len, val=0x00) {
  return arr.concat(Array.from({ length: len - arr.length }).fill(val));
}
