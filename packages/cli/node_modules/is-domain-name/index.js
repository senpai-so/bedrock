'use strict'

// Adapted from RFC 2181 (See section 11)
//
// The RFC defines a Domain Name to be at most 255 chars including seperators
// between labels.
// Subdomains are labels plus a seperator. A label is a string starting and
// ending with an alphanum, with dashes allowed in the middle. It is between 1 and 63 chars.
//
// We make some assumptions below that go beyond the RFC. We assume the TLD
// to be at least 2 chars. The regex also allows domains longer than 255 chars,
// but allows at most 127 subdomains, as assuming a lower-bound of one char per
// subdomain will yield 252, and adding a TLD of 2 chars sums to 254.
/*
(?:                   // Group 1: This is for subdomain, which is composed of a label and a seperator (length = [1, 63] + 1)
  [a-z0-9]
  (?:
    [a-z0-9\-]{0,61} // Limited to 61 chars as we have at least two chars if we reach this group (61 + 2 = 63 which is the limit)
    [a-z0-9]
  )?
  \.                  // Label seperator
){0,126}             // If we assume the lower-bound of 1 char labels, we can at most have 126 groups before approaching the total limit of 255 chars
(?:                   // Group 2: Assume that the TLD is at least 2 chars (for sanity)
  [a-z0-9]
  [a-z0-9\-]{0,61}
  [a-z0-9]
)
\.?                   // Some consider a trailing dot to be considered valid as it signifies the root of the domain tree
 */
var domainNameRegex = /^(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.){0,126}(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9]))\.?$/i

/**
 * Test whether a string is a valid domain name, optionally checking for a root dot as well
 * @param  {String}  domainName
 * @param  {Boolean} rootDot    Check for a root dot eg. 'example.com.'. Defaults to false
 * @return {Boolean}
 */
module.exports = function isDomainName (domainName, rootDot) {
  if (rootDot == null) rootDot = false

  if (domainName.length < 2) return false
  if (domainName.length > 255) return false

  var lastChar = domainName[domainName.length - 1]
  if (rootDot) {
    if (lastChar !== '.') return false
  } else {
    if (lastChar === '.') return false
  }

  return domainNameRegex.test(domainName)
}
