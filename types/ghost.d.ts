declare module "@tryghost/content-api" {
  interface GhostContentAPIOptions {
    url: string;
    key: string;
    version: string;
  }

  interface BrowseOptions {
    limit?: number | string;
    page?: number;
    filter?: string;
    include?: string[];
  }

  interface ReadOptions {
    include?: string[];
  }

  class GhostContentAPI {
    constructor(options: GhostContentAPIOptions);
    posts: {
      browse(options?: BrowseOptions): Promise<any[]>;
      read(
        params: { id?: string; slug?: string },
        options?: ReadOptions
      ): Promise<any>;
    };
    tags: {
      browse(options?: BrowseOptions): Promise<any[]>;
    };
    authors: {
      browse(options?: BrowseOptions): Promise<any[]>;
    };
    pages: {
      browse(options?: BrowseOptions): Promise<any[]>;
      read(
        params: { id?: string; slug?: string },
        options?: ReadOptions
      ): Promise<any>;
    };
  }

  export = GhostContentAPI;
}

declare module "@tryghost/admin-api" {
  interface GhostAdminAPIOptions {
    url: string;
    key: string;
    version: string;
  }

  class GhostAdminAPI {
    constructor(options: GhostAdminAPIOptions);
    posts: {
      add(data: any): Promise<any>;
      edit(data: any): Promise<any>;
      delete(data: { id: string }): Promise<any>;
    };
    pages: {
      add(data: any): Promise<any>;
      edit(data: any): Promise<any>;
      delete(data: { id: string }): Promise<any>;
    };
  }

  export = GhostAdminAPI;
}
