import { TreeItem } from 'vscode';

export interface SearchableItem extends TreeItem {
    uri?: string;
    namespace?: string;
    collectionName?: string;
}

/**
 * Filters items based on the search query
 * @param items Items to filter
 * @param query Search query
 * @returns Filtered items matching the search query
 */
export function filterItems(items: SearchableItem[], query: string): SearchableItem[] {
    if (!query) return items;

    const searchQuery = query.toLowerCase();
    return items.filter(item => {
        const label = item.label?.toString().toLowerCase() || '';
        const uri = item.uri?.toLowerCase() || '';
        const namespace = item.namespace?.toLowerCase() || '';
        const collection = item.collectionName?.toLowerCase() || '';

        return label.includes(searchQuery) ||
               uri.includes(searchQuery) ||
               namespace.includes(searchQuery) ||
               collection.includes(searchQuery);
    });
}
