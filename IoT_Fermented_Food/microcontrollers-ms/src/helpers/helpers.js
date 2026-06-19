const isValidIpAddress = ip => {
  if (!ip) return false
  if (isNaN(Number(ip[0]))) {
    // If it's a hostname, at least check it doesn't have spaces and has a reasonable length
    return ip.length >= 3 && !ip.includes(' ')
  }
  return !!ip.match(
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(:\d{1,5})?$/m
  )
}

const isValidMicrocontroller = ({ ip, measure, sensor, username } = {}) => {
  return !!(ip && isValidIpAddress(ip.trim()) && measure && sensor && username)
}

module.exports = { isValidMicrocontroller, isValidIpAddress }
