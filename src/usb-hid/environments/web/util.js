export function pad(arr, len, val=0x00) {
  return arr.concat(new Array(len - arr.length).fill(val));
}
