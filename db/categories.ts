import { databaseIsConfigured, execute, executeBatch, queryOne, queryRows } from "./client";
import type { Category, CategoryInput, CategoryTreeNode } from "./types";
import { fallbackCategories, fallbackCategory, fallbackCategoryChildren, fallbackLaunchArticles } from "./fallback-content";

export type { Category, CategoryInput, CategoryTreeNode } from "./types";

type CategoryRow = {
  id: number | string;
  parent_id: number | string | null;
  name: string;
  slug: string;
  path: string;
  intro: string;
  color: string;
  mark: string;
  status: "active" | "inactive";
  show_in_nav: boolean;
  sort_order: number | string;
  seo_title: string;
  seo_description: string;
  social_image: string;
  seo_index: boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

function dateString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: Number(row.id),
    parentId: row.parent_id === null ? null : Number(row.parent_id),
    name: row.name,
    slug: row.slug,
    path: row.path,
    intro: row.intro,
    color: row.color,
    mark: row.mark,
    status: row.status,
    showInNav: Boolean(row.show_in_nav),
    sortOrder: Number(row.sort_order),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    socialImage: row.social_image,
    seoIndex: Boolean(row.seo_index),
    createdAt: dateString(row.created_at),
    updatedAt: dateString(row.updated_at),
  };
}

const CATEGORY_SELECT = `SELECT id, parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order, seo_title, seo_description, social_image, seo_index, created_at, updated_at FROM categories`;

const fallbackNavigationCategories = fallbackCategories.filter((category) => category.showInNav);

export async function getCategories(options: { includeInactive?: boolean } = {}): Promise<Category[]> {
  if (!databaseIsConfigured() && !options.includeInactive) return fallbackCategories;
  try {
    const rows = await queryRows<CategoryRow>(
      `${CATEGORY_SELECT}${options.includeInactive ? "" : " WHERE status = 'active'"} ORDER BY sort_order ASC, name ASC`,
    );
    const dbCategories = rows.map(rowToCategory);
    const dbPaths = new Set(dbCategories.map((c) => c.path));
    const missing = fallbackCategories.filter((c) => !dbPaths.has(c.path));
    if (missing.length === 0) return dbCategories;
    return [...dbCategories, ...missing];
  } catch (error) {
    if (options.includeInactive) throw error;
    console.error("Unable to load categories; using bundled launch taxonomy.", error);
    return fallbackCategories;
  }
}

export async function getAdminCategories(): Promise<Category[]> {
  return getCategories({ includeInactive: true });
}

export async function getCategoryById(id: number, options: { includeInactive?: boolean } = {}): Promise<Category | null> {
  const bundled = fallbackCategories.find((category) => category.id === id) ?? null;
  if (!databaseIsConfigured() && !options.includeInactive) return bundled;
  try {
    const row = await queryOne<CategoryRow>(
      `${CATEGORY_SELECT} WHERE id = ?${options.includeInactive ? "" : " AND status = 'active'"} LIMIT 1`,
      [id],
    );
    return row ? rowToCategory(row) : bundled;
  } catch (error) {
    if (options.includeInactive) throw error;
    console.error(`Unable to load category id ${id}; using bundled launch taxonomy.`, error);
    return bundled;
  }
}

export async function getCategoryByPath(path: string, options: { includeInactive?: boolean } = {}): Promise<Category | null> {
  if (!databaseIsConfigured() && !options.includeInactive) return fallbackCategory(path);
  try {
    const row = await queryOne<CategoryRow>(
      `${CATEGORY_SELECT} WHERE path = ?${options.includeInactive ? "" : " AND status = 'active'"} LIMIT 1`,
      [path],
    );
    return row ? rowToCategory(row) : fallbackCategory(path);
  } catch (error) {
    if (options.includeInactive) throw error;
    console.error(`Unable to load category ${path}; using bundled launch taxonomy.`, error);
    return fallbackCategory(path);
  }
}

export async function getNavigationCategories(): Promise<Category[]> {
  const rows = await queryRows<CategoryRow>(
    `${CATEGORY_SELECT} WHERE status = 'active' AND show_in_nav = TRUE ORDER BY sort_order ASC, name ASC`,
  );
  return rows.map(rowToCategory);
}

export async function getPublicNavigationCategories(): Promise<Category[]> {
  if (!databaseIsConfigured()) return fallbackNavigationCategories;
  try {
    const nav = await getNavigationCategories();
    const navPaths = new Set(nav.map((c) => c.path));
    const missing = fallbackNavigationCategories.filter((c) => !navPaths.has(c.path));
    if (missing.length === 0) return nav;
    return [...nav, ...missing].sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error("Unable to load public navigation categories; using the launch fallback.", error);
    return fallbackNavigationCategories;
  }
}

export async function getChildCategories(parentId: number, options: { includeInactive?: boolean } = {}): Promise<Category[]> {
  if (!databaseIsConfigured() && !options.includeInactive) return fallbackCategoryChildren(parentId);
  try {
    const rows = await queryRows<CategoryRow>(
      `${CATEGORY_SELECT} WHERE parent_id = ?${options.includeInactive ? "" : " AND status = 'active'"} ORDER BY sort_order ASC, name ASC`,
      [parentId],
    );
    const dbChildren = rows.map(rowToCategory);
    if (dbChildren.length > 0) return dbChildren;
    return fallbackCategoryChildren(parentId);
  } catch (error) {
    if (options.includeInactive) throw error;
    console.error("Unable to load child categories; using bundled launch taxonomy.", error);
    return fallbackCategoryChildren(parentId);
  }
}

export async function getCategoryAncestors(category: Category, options: { includeInactive?: boolean } = {}): Promise<Category[]> {
  const all = await getCategories(options);
  const byId = new Map(all.map((item) => [item.id, item]));
  const ancestors: Category[] = [];
  let parentId = category.parentId;
  while (parentId !== null) {
    const parent = byId.get(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }
  return ancestors;
}

export async function getCategoryTree(options: { includeInactive?: boolean } = {}): Promise<CategoryTreeNode[]> {
  const categories = await getCategories(options);
  const nodes = new Map<number, CategoryTreeNode>();
  categories.forEach((category) => nodes.set(category.id, { ...category, children: [] }));
  const roots: CategoryTreeNode[] = [];
  nodes.forEach((node) => {
    if (node.parentId !== null && nodes.has(node.parentId)) nodes.get(node.parentId)!.children.push(node);
    else roots.push(node);
  });
  const sortNodes = (items: CategoryTreeNode[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    items.forEach((item) => sortNodes(item.children));
  };
  sortNodes(roots);
  return roots;
}

function categoryPath(parent: Category | null, slug: string) {
  return parent ? `${parent.path}/${slug}` : slug;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const parent = input.parentId === null
    ? null
    : await getCategoryById(input.parentId, { includeInactive: true });
  if (input.parentId !== null && !parent) throw new Error("Parent category not found.");
  const path = categoryPath(parent, input.slug);
  const row = await queryOne<CategoryRow>(
    `INSERT INTO categories (parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order, seo_title, seo_description, social_image, seo_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    [input.parentId, input.name, input.slug, path, input.intro, input.color, input.mark, input.status, input.showInNav, input.sortOrder, input.seoTitle, input.seoDescription, input.socialImage, input.seoIndex],
  );
  if (!row) throw new Error("Unable to create category.");
  return rowToCategory(row);
}

export async function updateCategory(id: number, input: CategoryInput): Promise<Category | null> {
  const current = await getCategoryById(id, { includeInactive: true });
  if (!current) return null;
  if (input.parentId === id) throw new Error("A category cannot be its own parent.");

  const parent = input.parentId === null
    ? null
    : await getCategoryById(input.parentId, { includeInactive: true });
  if (input.parentId !== null && !parent) throw new Error("Parent category not found.");
  if (parent && (parent.path === current.path || parent.path.startsWith(`${current.path}/`))) {
    throw new Error("A category cannot be moved inside one of its descendants.");
  }

  const newPath = categoryPath(parent, input.slug);
  const affectedRows = await queryRows<CategoryRow>(
    `${CATEGORY_SELECT} WHERE path = ? OR path LIKE ? ORDER BY LENGTH(path) ASC`,
    [current.path, `${current.path}/%`],
  );
  const affected = affectedRows.map(rowToCategory);

  const statements = affected.map((category) => {
    const suffix = category.path === current.path ? "" : category.path.slice(current.path.length);
    const path = `${newPath}${suffix}`;
    if (category.id === current.id) {
      return {
        text: `UPDATE categories SET parent_id = ?, name = ?, slug = ?, path = ?, intro = ?, color = ?, mark = ?, status = ?, show_in_nav = ?, sort_order = ?, seo_title = ?, seo_description = ?, social_image = ?, seo_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params: [input.parentId, input.name, input.slug, path, input.intro, input.color, input.mark, input.status, input.showInNav, input.sortOrder, input.seoTitle, input.seoDescription, input.socialImage, input.seoIndex, id],
      };
    }
    return {
      text: "UPDATE categories SET path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      params: [path, category.id],
    };
  });

  // Keep the legacy denormalized article columns synchronized while the app transitions.
  statements.push({
    text: `UPDATE articles a SET category = c.name, category_slug = c.path
           FROM categories c WHERE a.category_id = c.id AND (c.id = ? OR c.path LIKE ?)`,
    params: [id, `${newPath}/%`],
  });
  await executeBatch(statements);
  return getCategoryById(id, { includeInactive: true });
}

export async function categoryHasPublishedArticles(path: string): Promise<boolean> {
  const fallbackHasContent = fallbackLaunchArticles.some((article) => article.categoryPath === path || article.categoryPath.startsWith(`${path}/`));
  if (fallbackHasContent) return true;
  if (!databaseIsConfigured()) return false;
  try {
    const row = await queryOne<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM articles a JOIN categories c ON c.id = a.category_id
         WHERE a.status = 'published' AND c.status = 'active' AND (c.path = ? OR c.path LIKE ?)
       ) AS exists`,
      [path, `${path}/%`],
    );
    return Boolean(row?.exists);
  } catch (error) {
    console.error(`Unable to count published content for ${path}; using bundled launch content.`, error);
    return fallbackHasContent;
  }
}

export async function countPublishedArticlesByCategory(path: string): Promise<number> {
  const fallbackCount = fallbackLaunchArticles.filter((article) => article.categoryPath === path || article.categoryPath.startsWith(`${path}/`)).length;
  if (!databaseIsConfigured()) return fallbackCount;
  try {
    const row = await queryOne<{ count: number | string }>(
      `SELECT COUNT(*) AS count FROM articles a JOIN categories c ON c.id = a.category_id
       WHERE a.status = 'published' AND c.status = 'active' AND (c.path = ? OR c.path LIKE ?)`,
      [path, `${path}/%`],
    );
    const dbCount = Number(row?.count ?? 0);
    return Math.max(dbCount, fallbackCount);
  } catch (error) {
    console.error(`Unable to count articles for ${path}; using bundled launch content.`, error);
    return fallbackCount;
  }
}

export async function setCategoryNavigation(id: number, showInNav: boolean) {
  await execute("UPDATE categories SET show_in_nav = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [showInNav, id]);
}
