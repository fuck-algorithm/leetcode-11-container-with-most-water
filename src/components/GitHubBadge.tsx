import { useEffect, useState } from 'react';
import GitHubIcon from '../assets/github.svg';
import { getCached, getCachedEvenExpired, setCached } from '../services/storage/indexedDbStore';

const REPOSITORY = 'fuck-algorithm/leetcode-11-container-with-most-water';
const CACHE_KEY = `github-stars:${REPOSITORY}`;

export function GitHubBadge() {
  const [stars, setStars] = useState(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const fresh = await getCached<number>(CACHE_KEY);
        if (typeof fresh === 'number') { if (active) setStars(fresh); return; }
        const response = await fetch(`https://api.github.com/repos/${REPOSITORY}`);
        if (!response.ok) throw new Error('GitHub API unavailable');
        const value = ((await response.json()) as { stargazers_count?: number }).stargazers_count ?? 0;
        if (active) setStars(value);
        await setCached(CACHE_KEY, value, 3600);
      } catch {
        const fallback = await getCachedEvenExpired<number>(CACHE_KEY).catch(() => undefined);
        if (active) setStars(fallback ?? 0);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <a className="header-link github-badge" href={`https://github.com/${REPOSITORY}`} target="_blank" rel="noopener noreferrer" aria-label={`GitHub ${stars} stars`}>
      <img src={GitHubIcon} alt="GitHub" className="github-icon" />
      <span className="github-stars">★ {stars}</span>
    </a>
  );
}
