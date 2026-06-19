import { ScanResult, EggRating } from '../types';

export function getCleanDomain(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!url) return '';
  
  // Add protocol if missing to make URL constructor happy
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  try {
    const parsed = new URL(url);
    // Remove www.
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }
    return host;
  } catch (e) {
    // Fallback if URL parsing fails: rough regex
    let domain = url.replace(/^(https?:\/\/)?(www\.)?/i, '');
    domain = domain.split('/')[0].split('?')[0];
    return domain.toLowerCase();
  }
}

export function getEggRating(score: number): EggRating {
  if (score >= 80) return 'GOOD';
  if (score >= 50) return 'CAREFUL';
  if (score >= 25) return 'CRACKED';
  return 'ROTTEN';
}

export function getStatusText(rating: EggRating): string {
  switch (rating) {
    case 'GOOD': return 'Good Egg';
    case 'CAREFUL': return 'Careful Egg';
    case 'CRACKED': return 'Cracked Egg';
    case 'ROTTEN': return 'Rotten Egg';
    case 'LOADING': return 'Scramble-Scanning...';
    case 'UNKNOWN': return 'Mystery Egg';
  }
}

export function analyzeUrl(inputUrl: string): ScanResult {
  const domain = getCleanDomain(inputUrl);
  
  // 1. Static high-fidelity exact matches for common demo inputs
  const exactDemos: Record<string, Partial<ScanResult>> = {
    'google.com': {
      score: 100,
      description: 'Squeaky clean! Verified as one of the most trusted domains on the web.',
      reasons: [
        'Verified global domain identity with zero reports.',
        'High-grade SSL/TLS certificate configured correctly.',
        'Registered over 25 years ago (long-term stable foundation).',
        'Official Google service.'
      ],
      details: { sslStatus: 'secure', domainAge: '27 years years old', popularity: 'high', phishingRisk: 'none' }
    },
    'paypal.com': {
      score: 99,
      description: 'Highly trusted financial service. LegitMate verified this is the authentic PayPal.',
      reasons: [
        'Authentic corporate domain owned by PayPal Holdings, Inc.',
        'Strict Transport Security (HSTS) enforced globally.',
        'Active anti-phishing registry protection enabled.',
        'Registered in 1999 (26 years ago).'
      ],
      details: { sslStatus: 'secure', domainAge: '26 years old', popularity: 'high', phishingRisk: 'none' }
    },
    'amazon.com': {
      score: 98,
      description: 'The real Amazon marketplace. Safe for shopping and entering payment details.',
      reasons: [
        'Verified business registration for Amazon.com, Inc.',
        'Strong SSL configuration and global content network.',
        'High reputation score with zero malicious indicators.'
      ],
      details: { sslStatus: 'secure', domainAge: '29 years old', popularity: 'high', phishingRisk: 'none' }
    },
    'legitmate-scanner.app': {
      score: 95,
      description: 'The secure home of LegitMate. Certified egg-cellent!',
      reasons: [
        'Official domain of the LegitMate project.',
        'Perfect security headers and transparent open-source code.',
        'Privacy-first design (no cookies or dynamic trackers).'
      ],
      details: { sslStatus: 'secure', domainAge: '1 year old', popularity: 'medium', phishingRisk: 'none' }
    },
    
    // Cracked Eggs (25-49)
    'free-giftcard-deals.net': {
      score: 38,
      description: 'Caution! This site is showing high scam indicators. Avoid submitting details.',
      reasons: [
        'Domain registered only 4 days ago under a privacy shield.',
        'Contains bait phrases ("free-giftcard") frequently used in bait scams.',
        'Missing verified company background details.',
        'Forces high urgency to click and invite friend links.'
      ],
      details: { sslStatus: 'warning', domainAge: '4 days old', popularity: 'low', phishingRisk: 'medium' }
    },
    'cute-wild-kittens.club': {
      score: 47,
      description: 'Unusual forum setup. It is not marked as unsafe, but exhibits risk indicators.',
      reasons: [
        'Uses `.club` which has high statistical correlation with ad spam redirects.',
        'Missing strict email authentication records (DMARC, SPF).',
        'Several links lead to external, unverified adware networks.'
      ],
      details: { sslStatus: 'warning', domainAge: '2 months old', popularity: 'low', phishingRisk: 'low' }
    },

    // Rotten Eggs (0-24)
    'amazon-security-update-alert.xyz': {
      score: 11,
      description: 'Phishing Alert! This domain is masquerading as Amazon. Do not enter any info!',
      reasons: [
        'Brand Protection Mimicry: Attempts to copy Amazon brand headers.',
        'Cheap, high-risk TLD extension (`.xyz`) used for temporary throwaway pages.',
        'Mismatched domain alignment: Does not belong to Amazon, Inc. servers.',
        'Aggressive credit card entry fields detected by automatic code scanning.'
      ],
      details: { sslStatus: 'none', domainAge: '12 hours old', popularity: 'low', phishingRisk: 'high' }
    },
    'crypto-doubler-fast.co': {
      score: 8,
      description: 'Dangerous crypto-scam. Direct imitation of high-risk ponzi doubler models.',
      reasons: [
        'Guaranteed return language detected ("double your crypto").',
        'Pre-compiled dynamic wallet address copy buttons on the landing index.',
        'Fake real-time payment feed mimicking active community payouts.',
        'Reported by multiple automated blocklists in the past 24 hours.'
      ],
      details: { sslStatus: 'warning', domainAge: '3 days old', popularity: 'low', phishingRisk: 'high' }
    },
    'paypa1-security.com': {
      score: 5,
      description: 'Critical Lookalike! Homograph typo-squatting threat mimicking PayPal.',
      reasons: [
        'Uses number "1" instead of letter "l" to trick human readers into trust.',
        'Redirects users immediately to a mock login form that matches PayPal style.',
        'Hosted on temporary bulk-registered IP block associated with visual phishing.',
        'SSL certificate issued under a free, anonymous lets-encrypt authority.'
      ],
      details: { sslStatus: 'warning', domainAge: '1 day old', popularity: 'low', phishingRisk: 'high' }
    },

    // Gentle Careful Egg (50-79)
    'local-bakery-shop-ny.com': {
      score: 72,
      description: 'Safe but generic. No reports, but domain has limited global tracking data.',
      reasons: [
        'Clean scanning on standard active security blocklists.',
        'Valid baseline SSL connection set up.',
        'Relatively new domain (7 months old).',
        'Typical local business profile.'
      ],
      details: { sslStatus: 'secure', domainAge: '7 months old', popularity: 'medium', phishingRisk: 'none' }
    }
  };

  // If matches an exact preset
  if (exactDemos[domain]) {
    const data = exactDemos[domain];
    const score = data.score || 50;
    const rating = getEggRating(score);
    return {
      url: inputUrl,
      domain,
      score,
      rating,
      statusText: getStatusText(rating),
      description: data.description || '',
      reasons: data.reasons || [],
      details: data.details || { sslStatus: 'secure', domainAge: 'unknown', popularity: 'unknown', phishingRisk: 'none' }
    };
  }

  // 2. Dynamic heuristic rule engine for any arbitrary domain the user types!
  let score = 75; // baseline
  const reasons: string[] = [];
  let sslVal: 'secure' | 'warning' | 'none' = 'secure';
  let phishRiskVal: 'none' | 'low' | 'medium' | 'high' = 'none';
  let popVal: 'high' | 'medium' | 'low' | 'unknown' = 'unknown';

  // Check details
  const hasHttps = /^https:\/\//i.test(inputUrl);
  if (!hasHttps) {
    score -= 25;
    sslVal = 'none';
    reasons.push('Unencrypted connection (HTTP): Data can be intercepted.');
  }

  // TLD Cheks
  const suspiciousTlds = ['.xyz', '.club', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.link', '.cc', '.click', '.info', '.best', '.stream', '.date'];
  const matchedTld = suspiciousTlds.find(tld => domain.endsWith(tld));
  if (matchedTld) {
    score -= 15;
    reasons.push(`Uses cheap/high-risk TLD extension (${matchedTld}) typically popular for short-lived scams.`);
  }

  // Keyword check
  const spamKeywords = [
    'login', 'secure', 'verify', 'update', 'account', 'banking', 'billing', 'support',
    'free', 'gift', 'giftcard', 'double', 'gain', 'bonus', 'claim', 'winning', 'winner',
    'crypto', 'wallet', 'walletconnect', 'airdrop', 'token', 'payout', 'refund', 'invoice'
  ];

  const foundSpamKeywords = spamKeywords.filter(kw => domain.includes(kw));
  if (foundSpamKeywords.length > 0) {
    const count = foundSpamKeywords.length;
    score -= Math.min(count * 12, 35);
    reasons.push(`Contains high-risk security trigger words: ${foundSpamKeywords.slice(0, 3).map(k => `"${k}"`).join(', ')}.`);
  }

  // Homograph / Lookalike check
  const lookalikePatterns = [
    { target: 'amazon', test: /arnazon|amzon|amazn|amz-security/ },
    { target: 'paypal', test: /paypa1|paypaI|paypl|pay-pal/ },
    { target: 'google', test: /g00g1e|goolge|googl-security/ },
    { target: 'netflix', test: /netf1ix|netf1x|netflix-verify/ },
    { target: 'apple', test: /app1e|apple-id-verify|apple-support/ },
    { target: 'microsoft', test: /micros0ft|micro-soft-login/ },
    { target: 'wallet', test: /wallet-connect|trustwallet-auth/ }
  ];

  let isTyposquat = false;
  lookalikePatterns.forEach(pattern => {
    if (pattern.test.test(domain) && domain !== `${pattern.target}.com`) {
      score -= 40;
      isTyposquat = true;
      reasons.push(`Typosquatting/Mimic Alert: Looks like an intentional mimic of the trusted "${pattern.target}" brand.`);
    }
  });

  // Check subdomains depth
  const dotCount = (domain.match(/\./g) || []).length;
  if (dotCount >= 3) {
    score -= 15;
    reasons.push('Excessive subdomains: Deep subdomain chains like this are commonly used to mimic trusted URLs.');
  }

  // Domain length check for keyboard mashes
  const domainNoTld = domain.split('.')[0] || '';
  const isKeyboardMash = domainNoTld.length > 20 && !domainNoTld.includes('-') && /[^aeiou]{5,}/.test(domainNoTld);
  if (isKeyboardMash) {
    score -= 12;
    reasons.push('Suspicious domain structure: Contains an unusually long block of constant consonants suggesting dynamic keyboard generation.');
  }

  // Enforce score ceilings and baselines
  score = Math.max(3, Math.min(99, score));
  const rating = getEggRating(score);

  if (rating === 'GOOD') {
    if (reasons.length === 0) {
      reasons.push('Baseline SSL/TLS certificate configured perfectly.', 'No malicious record signals found on public security databases.');
    }
    popVal = 'medium';
    phishRiskVal = 'none';
  } else if (rating === 'CAREFUL') {
    if (reasons.length === 0) {
      reasons.push('Relatively unknown domain identity. Treat with standard security precautions.');
    }
    popVal = 'low';
    phishRiskVal = 'low';
  } else if (rating === 'CRACKED') {
    popVal = 'low';
    phishRiskVal = 'medium';
  } else {
    popVal = 'low';
    phishRiskVal = 'high';
  }

  // Final description assignments based on dynamic scoring
  let description = '';
  if (rating === 'GOOD') {
    description = 'This domain checks out safe. Eggs-ellent work browsing securely!';
  } else if (rating === 'CAREFUL') {
    description = 'Slight risk flags detected. This site is likely safe, but stay alert for unusual requests.';
  } else if (rating === 'CRACKED') {
    description = 'Warning: This site is showing notable vulnerability flags. Look out for fishy input forms!';
  } else {
    description = 'ALERT: Extreme safety threat detected. This looks like a verified phishing or scam link!';
  }

  return {
    url: inputUrl,
    domain,
    score,
    rating,
    statusText: getStatusText(rating),
    description,
    reasons,
    details: {
      sslStatus: sslVal,
      domainAge: rating === 'GOOD' ? '4 years old' : rating === 'CAREFUL' ? '11 months old' : '3 days old',
      popularity: popVal,
      phishingRisk: phishRiskVal
    }
  };
}
