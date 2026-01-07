const NEWS_IMAGES = [
  "/news_images/ai-generated-8714005_1280.jpg",
  "/news_images/business-3972328_1280.jpg",
  "/news_images/business-8598081_1280.jpg",
  "/news_images/dices-over-newspaper-2656028_1280.jpg",
  "/news_images/finance-8037839_1280.jpg",
  "/news_images/man-8959733_1280.jpg",
  "/news_images/shares-5279686_1280.jpg",
  "/news_images/stock-5051155_1280.jpg",
  "/news_images/stock-trading-6525081.jpg",
  "/news_images/stock-trading-6525084.jpg",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getNewsImage(
  articleId: string,
  index: number,
  totalImages: number = NEWS_IMAGES.length
): string {
  const effectiveTotal = Math.min(totalImages, NEWS_IMAGES.length);
  const baseIndex = hashString(articleId) % effectiveTotal;
  const offset = Math.floor(index / 4) * 3;
  const finalIndex = (baseIndex + offset) % effectiveTotal;
  
  return NEWS_IMAGES[finalIndex];
}

export function getDistributedImages(
  articles: Array<{ link: string; id?: string }>,
  minDistance: number = 4
): Map<string, string> {
  const imageMap = new Map<string, string>();
  const usedRecently: string[] = [];
  const effectiveTotal = NEWS_IMAGES.length;

  articles.forEach((article) => {
    const articleKey = article.id || article.link;
    let imageIndex = hashString(articleKey) % effectiveTotal;
    let image = NEWS_IMAGES[imageIndex];
    
    let attempts = 0;
    while (usedRecently.includes(image) && attempts < effectiveTotal) {
      imageIndex = (imageIndex + 1) % effectiveTotal;
      image = NEWS_IMAGES[imageIndex];
      attempts++;
    }
    
    imageMap.set(articleKey, image);
    usedRecently.push(image);
    
    if (usedRecently.length > minDistance) {
      usedRecently.shift();
    }
  });

  return imageMap;
}

export function getImageForArticle(
  articleLink: string,
  articleIndex: number,
  pageSize: number = 12
): string {
  const hash = hashString(articleLink);
  const pageOffset = Math.floor(articleIndex / pageSize);
  const positionInPage = articleIndex % pageSize;
  const imageIndex = (hash + positionInPage + pageOffset * 7) % NEWS_IMAGES.length;
  
  return NEWS_IMAGES[imageIndex];
}

export { NEWS_IMAGES };
