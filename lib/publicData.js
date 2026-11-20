import { allowLocalFallback, connectToDatabase } from './mongoose';
import { initialSiteInfo, initialProjects, initialServices, initialExperiences } from './dummyData';
import { publicRoutes, siteOrigin } from './publicRoutes';
import SiteInfo from '../models/SiteInfo';
import Project from '../models/Project';
import Service from '../models/Service';
import Experience from '../models/Experience';
import { readLocalCollection, readLocalSiteInfo } from './localStore';

export const collections = {
  projects: { Model: Project, sort: '-createdAt', fallback: initialProjects },
  services: { Model: Service, sort: 'createdAt', fallback: initialServices },
  experience: { Model: Experience, sort: '-createdAt', fallback: initialExperiences },
};

export async function readSiteInfo() {
  return (await SiteInfo.findOne().lean()) || initialSiteInfo;
}

export function readCollection(key, limit = 0) {
  const { Model, sort } = collections[key];
  return Model.find().sort(sort).limit(limit).lean();
}

export async function publicPageProps(page, collection, limit = 0) {
  const collectionNames = (Array.isArray(collection) ? collection : collection ? [collection] : []).filter(Boolean);
  let siteInfo = initialSiteInfo;
  let entries = Object.fromEntries(collectionNames.map((key) => [key, collections[key].fallback]));
  try {
    await connectToDatabase();
    const values = await Promise.all([
      readSiteInfo(),
      ...collectionNames.map((key) => readCollection(key, key === 'projects' ? limit : 0)),
    ]);
    siteInfo = values[0];
    entries = Object.fromEntries(collectionNames.map((key, index) => [key, values[index + 1]]));
  } catch (error) {
    if (allowLocalFallback()) {
      const values = await Promise.all([
        readLocalSiteInfo(),
        ...collectionNames.map((key) => readLocalCollection(key, key === 'projects' ? limit : 0)),
      ]);
      siteInfo = values[0];
      entries = Object.fromEntries(collectionNames.map((key, index) => [key, values[index + 1]]));
    }
    if (process.env.PORTFOLIO_STORAGE !== 'local' && process.env.MONGODB_URI) console.warn('Portfolio content unavailable:', error.name);
  }

  return {
    props: JSON.parse(JSON.stringify({
      page,
      siteInfo,
      origin: siteOrigin(siteInfo.siteContent?.seo?.siteUrl || undefined),
      ...entries,
      ...(limit && { hasMoreProjects: (entries.projects || []).length > 6 }),
    })),
    revalidate: 300,
  };
}

export async function refreshPages(res, pages = Object.keys(publicRoutes)) {
  if (process.env.NODE_ENV === 'development') return;
  const results = await Promise.allSettled(pages.map((page) => res.revalidate(publicRoutes[page])));
  for (const result of results) {
    if (result.status === 'rejected') console.warn('Portfolio cache refresh failed:', result.reason?.message);
  }
}
