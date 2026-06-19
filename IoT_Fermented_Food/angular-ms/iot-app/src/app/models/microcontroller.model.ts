export interface Microcontroller {
  ip: string,
  isInactive?: boolean,
  measure: string,
  sensor: string,
  username: string,
  thresholdMin?: number,
  thresholdMax?: number
}
