import { lookup } from 'node:dns/promises'
import { BlockList } from 'node:net'

export class UnsafeUrlError extends Error {
  constructor() {
    super('This URL cannot be fetched.')
    this.name = 'UnsafeUrlError'
  }
}

/* Loopback, private, link-local (cloud metadata), reserved and tunnelling ranges. */
const blockedAddresses = new BlockList()

const IPV4_RANGES: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]
const IPV6_RANGES: [string, number][] = [
  ['::', 96], // unspecified, loopback and IPv4-compatible
  ['64:ff9b::', 96], // NAT64
  ['100::', 64], // discard
  ['2001::', 32], // Teredo
  ['2001:db8::', 32], // documentation
  ['2002::', 16], // 6to4
  ['fc00::', 7], // unique local
  ['fe80::', 10], // link-local
  ['ff00::', 8], // multicast
]

IPV4_RANGES.forEach(([net, prefix]) =>
  blockedAddresses.addSubnet(net, prefix, 'ipv4')
)
IPV6_RANGES.forEach(([net, prefix]) =>
  blockedAddresses.addSubnet(net, prefix, 'ipv6')
)

export function isBlockedAddress(address: string, family: 4 | 6) {
  return blockedAddresses.check(address, family === 4 ? 'ipv4' : 'ipv6')
}

async function resolvesToPublicAddresses(hostname: string) {
  try {
    const addresses = await lookup(hostname.replace(/^\[|\]$/g, ''), {
      all: true,
    })
    return (
      addresses.length > 0 &&
      addresses.every(
        ({ address, family }) => !isBlockedAddress(address, family as 4 | 6)
      )
    )
  } catch {
    return false
  }
}

/* Returns a checker that only passes http(s) URLs whose host resolves to public addresses. */
export function createUrlGuard() {
  const verdicts = new Map<string, Promise<boolean>>()

  return async (rawUrl: string) => {
    let url: URL
    try {
      url = new URL(rawUrl)
    } catch {
      return false
    }

    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.username ||
      url.password
    ) {
      return false
    }

    let verdict = verdicts.get(url.hostname)
    if (!verdict) {
      verdict = resolvesToPublicAddresses(url.hostname)
      verdicts.set(url.hostname, verdict)
    }
    return verdict
  }
}
