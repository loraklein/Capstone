import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const resolveDevBaseUrl = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:3001/api`;
    }
  }
  return 'http://localhost:3001/api';
};

const resolveBaseUrl = () => {
  const explicit =
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    (typeof process !== 'undefined' && process.env?.API_BASE_URL);

  if (explicit) {
    return explicit;
  }

  if (__DEV__) {
    return resolveDevBaseUrl();
  }

  return 'https://capstone-backend-og2c.onrender.com/api';
};

const API_BASE_URL = resolveBaseUrl();

// API service for backend communication
export class ApiService {
  private baseURL: string;
  private getAccessToken: (() => string | null) | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  // Set the access token provider function
  setAccessTokenProvider(provider: () => string | null) {
    this.getAccessToken = provider;
  }

  // Helper method to make API requests
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have an access token
    const accessToken = this.getAccessToken?.();
    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[apiService] Error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  // Project management
  async createProject(title: string, description?: string, project_type?: string): Promise<any> {
    return this.makeRequest('/projects', {
      method: 'POST',
      body: JSON.stringify({ title, description, project_type }),
    });
  }

  async getProjects(): Promise<any> {
    return this.makeRequest('/projects');
  }

  async getProject(projectId: string): Promise<any> {
    return this.makeRequest(`/projects/${projectId}`);
  }

  async updateProject(projectId: string, updates: { title?: string; description?: string; project_type?: string }): Promise<any> {
    return this.makeRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<any> {
    return this.makeRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Page management
  async addPage(projectId: string, photoUrl: string, rotation: number = 0): Promise<any> {
    return this.makeRequest(`/pages/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ photoUrl, rotation }),
    });
  }

  async getPages(projectId: string): Promise<any> {
    return this.makeRequest(`/pages/project/${projectId}`);
  }

  async getPage(pageId: string): Promise<any> {
    return this.makeRequest(`/pages/${pageId}`);
  }

  async updatePage(pageId: string, updates: { rotation?: number }): Promise<any> {
    return this.makeRequest(`/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updatePageText(pageId: string, editedText: string): Promise<any> {
    return this.makeRequest(`/pages/${pageId}/text`, {
      method: 'PUT',
      body: JSON.stringify({ editedText }),
    });
  }

  async updatePageReviewStatus(pageId: string, reviewStatus: 'unreviewed' | 'needs_attention' | 'reviewed'): Promise<any> {
    return this.makeRequest(`/pages/${pageId}/review-status`, {
      method: 'PUT',
      body: JSON.stringify({ reviewStatus }),
    });
  }

  async getProjectReviewStats(projectId: string): Promise<any> {
    return this.makeRequest(`/pages/project/${projectId}/review-stats`);
  }

  async deletePage(pageId: string): Promise<any> {
    return this.makeRequest(`/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  // AI processing
  async processPageWithAI(pageId: string, provider: string = 'google_vision'): Promise<any> {
    return this.makeRequest(`/ai/pages/${pageId}/process`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  async getPageText(pageId: string): Promise<any> {
    return this.makeRequest(`/ai/pages/${pageId}/text`);
  }

  async getAvailableAIProviders(): Promise<string[]> {
    return this.makeRequest('/ai/providers');
  }

  // Batch AI processing
  async batchProcessProject(projectId: string, provider: string = 'google_vision'): Promise<any> {
    return this.makeRequest(`/ai/projects/${projectId}/batch-process`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  // Chapter management
  async getProjectChapters(projectId: string): Promise<any> {
    return this.makeRequest(`/chapters/project/${projectId}`);
  }

  async createChapter(projectId: string, chapter: {
    title: string;
    start_page_number: number;
    end_page_number?: number;
    chapter_type?: string;
    description?: string;
  }): Promise<any> {
    return this.makeRequest(`/chapters/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(chapter),
    });
  }

  async updateChapter(chapterId: string, updates: {
    title?: string;
    start_page_number?: number;
    end_page_number?: number;
    chapter_type?: string;
    description?: string;
    chapter_order?: number;
  }): Promise<any> {
    return this.makeRequest(`/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteChapter(chapterId: string): Promise<any> {
    return this.makeRequest(`/chapters/${chapterId}`, {
      method: 'DELETE',
    });
  }

  async reorderChapters(projectId: string, chapterIds: string[]): Promise<any> {
    return this.makeRequest(`/chapters/project/${projectId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ chapterIds }),
    });
  }

  async getSuggestedChapters(projectId: string): Promise<any> {
    return this.makeRequest(`/chapters/project/${projectId}/suggestions`);
  }

  async executeReorganization(projectId: string, reorganization: any): Promise<any> {
    return this.makeRequest(`/chapters/project/${projectId}/reorganize`, {
      method: 'POST',
      body: JSON.stringify(reorganization),
    });
  }

  // Text enhancement
  async correctPageText(pageId: string, provider?: string): Promise<any> {
    return this.makeRequest(`/text-enhancement/pages/${pageId}/correct`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  async applyTextCorrection(pageId: string, correctedText: string): Promise<any> {
    return this.makeRequest(`/text-enhancement/pages/${pageId}/apply`, {
      method: 'PUT',
      body: JSON.stringify({ correctedText }),
    });
  }

  async getTextEnhancementProviders(): Promise<{ providers: string[] }> {
    return this.makeRequest('/text-enhancement/providers');
  }

  async getBookPreviewHtml(projectId: string, bookSettings: any): Promise<string> {
    const params = new URLSearchParams({
      includeImages: bookSettings.includeImages?.toString() || 'false',
      bookSettings: JSON.stringify(bookSettings),
    });

    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/export/book/html?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAccessToken && this.getAccessToken()
            ? { Authorization: `Bearer ${this.getAccessToken()}` }
            : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }

    return response.text();
  }
}

// Export singleton instance
export const apiService = new ApiService();
