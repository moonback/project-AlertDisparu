/**
 * Service de pagination pour les scénarios de résolution
 * Améliore les performances en chargeant les données par chunks
 */

export interface PaginationConfig {
  pageSize: number;
  maxPages: number;
  preloadPages: number; // Nombre de pages à précharger
}

export interface PaginatedResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}

export class ScenarioPaginationService<T> {
  private config: PaginationConfig;
  private allData: T[] = [];
  private currentPage: number = 1;

  constructor(config: Partial<PaginationConfig> = {}) {
    this.config = {
      pageSize: config.pageSize || 5,
      maxPages: config.maxPages || 10,
      preloadPages: config.preloadPages || 2
    };
  }

  /**
   * Initialise la pagination avec les données
   */
  initialize(data: T[]): void {
    this.allData = [...data];
    this.currentPage = 1;
  }

  /**
   * Récupère la page actuelle
   */
  getCurrentPage(): PaginatedResult<T> {
    return this.getPage(this.currentPage);
  }

  /**
   * Récupère une page spécifique
   */
  getPage(page: number): PaginatedResult<T> {
    const totalPages = Math.ceil(this.allData.length / this.config.pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages));
    
    const startIndex = (validPage - 1) * this.config.pageSize;
    const endIndex = startIndex + this.config.pageSize;
    
    const pageData = this.allData.slice(startIndex, endIndex);
    
    return {
      data: pageData,
      currentPage: validPage,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1,
      totalItems: this.allData.length
    };
  }

  /**
   * Va à la page suivante
   */
  nextPage(): PaginatedResult<T> {
    const result = this.getCurrentPage();
    if (result.hasNextPage) {
      this.currentPage++;
      return this.getCurrentPage();
    }
    return result;
  }

  /**
   * Va à la page précédente
   */
  previousPage(): PaginatedResult<T> {
    const result = this.getCurrentPage();
    if (result.hasPreviousPage) {
      this.currentPage--;
      return this.getCurrentPage();
    }
    return result;
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number): PaginatedResult<T> {
    this.currentPage = page;
    return this.getCurrentPage();
  }

  /**
   * Récupère les pages à précharger
   */
  getPreloadPages(): PaginatedResult<T>[] {
    const result = this.getCurrentPage();
    const preloadPages: PaginatedResult<T>[] = [];
    
    // Précharger les pages suivantes
    for (let i = 1; i <= this.config.preloadPages; i++) {
      const nextPage = this.currentPage + i;
      if (nextPage <= result.totalPages) {
        preloadPages.push(this.getPage(nextPage));
      }
    }
    
    return preloadPages;
  }

  /**
   * Met à jour les données
   */
  updateData(newData: T[]): void {
    this.allData = [...newData];
    // Ajuster la page actuelle si nécessaire
    const totalPages = Math.ceil(this.allData.length / this.config.pageSize);
    if (this.currentPage > totalPages) {
      this.currentPage = Math.max(1, totalPages);
    }
  }

  /**
   * Ajoute de nouvelles données
   */
  addData(newItems: T[]): void {
    this.allData.push(...newItems);
  }

  /**
   * Supprime un élément par index
   */
  removeItem(index: number): void {
    if (index >= 0 && index < this.allData.length) {
      this.allData.splice(index, 1);
      // Ajuster la page actuelle si nécessaire
      const totalPages = Math.ceil(this.allData.length / this.config.pageSize);
      if (this.currentPage > totalPages) {
        this.currentPage = Math.max(1, totalPages);
      }
    }
  }

  /**
   * Recherche dans les données
   */
  search(query: string, searchFields: (keyof T)[]): PaginatedResult<T> {
    if (!query.trim()) {
      return this.getCurrentPage();
    }

    const filteredData = this.allData.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    });

    // Créer une instance temporaire pour la recherche
    const tempPagination = new ScenarioPaginationService<T>(this.config);
    tempPagination.initialize(filteredData);
    
    return tempPagination.getCurrentPage();
  }

  /**
   * Trie les données
   */
  sort(compareFn: (a: T, b: T) => number): void {
    this.allData.sort(compareFn);
  }

  /**
   * Retourne les statistiques de pagination
   */
  getStats(): {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    itemsOnCurrentPage: number;
  } {
    const result = this.getCurrentPage();
    return {
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: this.config.pageSize,
      itemsOnCurrentPage: result.data.length
    };
  }

  /**
   * Réinitialise la pagination
   */
  reset(): void {
    this.allData = [];
    this.currentPage = 1;
  }
}

/**
 * Hook React pour la pagination des scénarios
 */
export function useScenarioPagination<T>(
  data: T[],
  config: Partial<PaginationConfig> = {}
) {
  const pagination = new ScenarioPaginationService<T>(config);
  pagination.initialize(data);

  return {
    getCurrentPage: () => pagination.getCurrentPage(),
    nextPage: () => pagination.nextPage(),
    previousPage: () => pagination.previousPage(),
    goToPage: (page: number) => pagination.goToPage(page),
    getStats: () => pagination.getStats(),
    search: (query: string, fields: (keyof T)[]) => pagination.search(query, fields),
    sort: (compareFn: (a: T, b: T) => number) => pagination.sort(compareFn)
  };
}
