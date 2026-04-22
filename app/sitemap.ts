import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getAllExhibitions, getAllGalleries } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [galleries, exhibitions] = await Promise.all([
    getAllGalleries(),
    getAllExhibitions(),
  ]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    {
      url: `${SITE_URL}/exhibitions`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/galleries`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const exhibitionRoutes: MetadataRoute.Sitemap = exhibitions.map((e) => ({
    url: `${SITE_URL}/exhibitions/${e.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const galleryRoutes: MetadataRoute.Sitemap = galleries.map((g) => ({
    url: `${SITE_URL}/galleries/${g.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...exhibitionRoutes, ...galleryRoutes];
}
