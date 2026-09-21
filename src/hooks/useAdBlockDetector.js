import { useEffect, useState } from 'react';

/**
 * Определяет, активен ли блокировщик рекламы.
 * Создаёт невидимый div с "рекламными" классами — большинство
 * блокировщиков скрывают такие элементы по CSS-правилам их фильтров.
 */
export function useAdBlockDetector() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ads adsbygoogle ad-placement';
    bait.style.cssText =
      'position:absolute; top:-9999px; left:-9999px; width:10px; height:10px;';
    document.body.appendChild(bait);

    const timer = setTimeout(() => {
      const hidden =
        !document.body.contains(bait) ||
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        getComputedStyle(bait).display === 'none';
      setBlocked(hidden);
      bait.remove();
    }, 200);

    return () => {
      clearTimeout(timer);
      bait.remove();
    };
  }, []);

  return blocked;
}
