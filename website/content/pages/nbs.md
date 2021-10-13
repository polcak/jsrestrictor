Title: Network Boundary Shield
Slug: nbs

The Network Boundary Shield (NBS) is a protection against attacks from an
external network (the Internet) to an internal network - especially against a
reconnaissance attacks when a web browser is abused as a proxy. See, for
example, the [ForcePoint
report](https://www.forcepoint.com/blog/x-labs/attacking-internal-network-public-internet-using-browser-proxy).

The NBS functionality is based on filtering HTTP requests. The Network Boundary
Shield uses blocking webRequest API to handle HTTP requests. This means that
processing of each HTTP request is paused before it is analyzed and allowed (if
it seems benign) or blocked (if it is suspicious).

The main goal of NBS is to prevent attacks like a public website requests a
resource from the internal network (e.g. the logo of the manufacturer of the
local router); NBS will detect that a web page hosted on the public Internet
tries to connect to a local IP address. NBS blocks only HTTP requests from a web
page hosted on a public IP address to a private network resource. The user can
allow specific web pages to access local resources (e.g. when using Intranet
services).

NBS uses [CSV files provided by
IANA](https://www.iana.org/assignments/locally-served-dns-zones/locally-served-dns-zones.xml)
to determine public and local IP address prefixes. Both IPv4 and IPv6 is
supported. The CSV files are downloaded during the JShelter building process.

The NBS has only a small impact on the web browser performance. The impact
differs for each implementation.

More information about the Network Boundary Shield can be obtained from the
[master thesis by Pavel
Pohner](https://www.vutbr.cz/studenti/zav-prace/detail/129272) (in Czech).
