/**
 * Smart Categorization Engine
 * Two-step classifier: domain lookup -> keyword fallback
 */

const CuteCategories = (() => {
  'use strict';

  // Category id -> display label. Ids are used in data-category attributes.
  const LABELS = {
    coding: 'Coding & Tech',
    cooking: 'Cooking & Food',
    shopping: 'Shopping',
    video: 'Video & Media',
    gaming: 'Gaming',
    learning: 'Learning & Wiki',
    social: 'Social & Forums',
    general: 'General/Web',
  };

  // Step 1: Known domains per category. Subdomains match automatically
  // (e.g. en.wikipedia.org -> wikipedia.org).
  const DOMAINS = {
    coding: [
      'github.com', 'gitlab.com', 'stackoverflow.com', 'stackexchange.com',
      'developer.mozilla.org', 'npmjs.com', 'pypi.org', 'dev.to', 'medium.com',
      'hashnode.dev', 'crates.io', 'docs.microsoft.com', 'learn.microsoft.com',
      'developer.apple.com', 'developers.google.com', 'digitalocean.com',
      'freecodecamp.org', 'codepen.io', 'jsfiddle.net', 'replit.com',
      'news.ycombinator.com', 'techcrunch.com', 'arstechnica.com',
      'theverge.com', 'wired.com',
    ],
    cooking: [
      'allrecipes.com', 'foodnetwork.com', 'epicurious.com', 'bonappetit.com',
      'seriouseats.com', 'simplyrecipes.com', 'tasty.co', 'delish.com',
      'food52.com', 'cookinglight.com', 'kingarthurbaking.com', 'budgetbytes.com',
    ],
    shopping: [
      'amazon.com', 'amazon.co.uk', 'ebay.com', 'walmart.com', 'target.com',
      'etsy.com', 'bestbuy.com', 'aliexpress.com', 'shopify.com', 'wayfair.com',
      'newegg.com', 'costco.com', 'homedepot.com', 'ikea.com',
    ],
    video: [
      'youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'dailymotion.com',
      'netflix.com', 'hulu.com', 'disneyplus.com', 'spotify.com',
      'soundcloud.com', 'imdb.com', 'rottentomatoes.com', 'letterboxd.com',
    ],
    gaming: [
      'steampowered.com', 'ign.com', 'gamespot.com', 'kotaku.com', 'polygon.com',
      'pcgamer.com', 'nintendo.com', 'playstation.com', 'xbox.com',
      'epicgames.com', 'gog.com', 'roblox.com',
    ],
    learning: [
      'wikipedia.org', 'wikihow.com', 'britannica.com', 'khanacademy.org',
      'coursera.org', 'udemy.com', 'edx.org', 'quizlet.com', 'scholar.google.com',
      'researchgate.net', 'academia.edu', 'arxiv.org', 'nature.com',
      'sciencedirect.com',
    ],
    social: [
      'reddit.com', 'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
      'linkedin.com', 'pinterest.com', 'tumblr.com', 'quora.com', 'discord.com',
      'threads.net', 'mastodon.social', 'bsky.app',
    ],
  };

  const DOMAIN_MAP = new Map(
    Object.entries(DOMAINS).flatMap(([id, domains]) => domains.map(d => [d, id]))
  );

  // Step 2: Keyword patterns per category (global flag so match() counts hits).
  // Very generic words ("like", "post", "cup", "review"...) are left out on
  // purpose — they appear on almost any page and skew the score.
  const KEYWORDS = {
    coding: [
      /\b(code|coding|programming|developer|software|api|bug|debug|deploy|framework)\b/gi,
      /\b(javascript|python|java|rust|golang|typescript|react|node\.?js|css|html)\b/gi,
      /\b(git|docker|kubernetes|devops|backend|frontend|fullstack|database|sql)\b/gi,
      /\b(npm|pip|compiler|runtime|algorithm|data.?structure|open.?source)\b/gi,
    ],
    cooking: [
      /\b(recipe|recipes|cook|cooking|bake|baking|ingredient|ingredients)\b/gi,
      /\b(dinner|breakfast|lunch|dessert|appetizer|meal|cuisine|chef)\b/gi,
      /\b(oven|stove|whisk|tablespoon|teaspoon|preheat|simmer|saute)\b/gi,
      /\b(vegan|vegetarian|gluten.?free|keto|paleo|nutrition|calories)\b/gi,
    ],
    shopping: [
      /\b(buy|shop|shopping|price|deal|deals|discount|coupon|sale)\b/gi,
      /\b(product|shipping|delivery|cart|checkout)\b/gi,
      /\b(cheap|affordable|store|marketplace|retail)\b/gi,
      /\$\d+|\b\d+\.\d{2}\b/g,
    ],
    video: [
      /\b(video|watch|stream|streaming|movie|movies|film|episode|series)\b/gi,
      /\b(trailer|clip|channel|subscribe|playlist|podcast|music|song|album)\b/gi,
      /\b(director|actor|actress|documentary|animation|anime)\b/gi,
    ],
    gaming: [
      /\b(game|games|gaming|gamer|gameplay|playthrough|walkthrough)\b/gi,
      /\b(xbox|playstation|nintendo|steam|fps|rpg|mmorpg|esports)\b/gi,
      /\b(controller|console|pc.?gaming|multiplayer|singleplayer|co-?op|dlc)\b/gi,
    ],
    learning: [
      /\b(learn|learning|education|tutorial|course|lesson|study|lecture)\b/gi,
      /\b(wiki|encyclopedia|definition|history|science|research|theory)\b/gi,
      /\b(university|college|school|professor|student|degree|certificate)\b/gi,
      /\b(math|physics|chemistry|biology|psychology|philosophy|literature)\b/gi,
    ],
    social: [
      /\b(forum|forums|community|discussion|thread|subreddit)\b/gi,
      /\b(social|profile|followers|tweet|retweet)\b/gi,
      /\b(opinion|ama|advice|rant|vent|unpopular)\b/gi,
    ],
  };

  /** Look up a hostname, stripping subdomains one level at a time. */
  function lookupDomain(hostname) {
    const parts = hostname.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      const id = DOMAIN_MAP.get(parts.slice(i).join('.'));
      if (id) return id;
    }
    return null;
  }

  /**
   * Classify a search result into a category.
   * @param {{ title: string, url: string, snippet: string }} result
   * @returns {string} category id (key of LABELS)
   */
  function classify({ title, url, snippet }) {
    let hostname = '';
    try { hostname = new URL(url).hostname; } catch {}

    const byDomain = hostname && lookupDomain(hostname);
    if (byDomain) return byDomain;

    const text = `${title} ${snippet}`;
    let best = 'general';
    let bestScore = 0;

    for (const [id, patterns] of Object.entries(KEYWORDS)) {
      let score = 0;
      for (const pattern of patterns) {
        score += text.match(pattern)?.length ?? 0;
      }
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }

    return best;
  }

  return { LABELS, classify };
})();
