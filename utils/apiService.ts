import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API configuration
const API_BASE_URL = 'http://144.38.182.71:3001/api';
const TEST_USER_ID = '39fcd9b8-7c1b-41b1-8980-931a616ead82'; // Temporary test user

// API service for backend communication
export class ApiService {
  private baseURL: string;
  private userId: string;

  constructor(baseURL: string = API_BASE_URL, userId: string = TEST_USER_ID) {
    this.baseURL = baseURL;
    this.userId = userId;
  }

  // Helper method to make API requests
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Project management
  async createProject(title: string, description?: string): Promise<any> {
    return this.makeRequest('/projects', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async getProjects(): Promise<any> {
    return this.makeRequest('/projects');
  }

  async getProject(projectId: string): Promise<any> {
    return this.makeRequest(`/projects/${projectId}`);
  }

  async updateProject(projectId: string, updates: { title?: string; description?: string }): Promise<any> {
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

  async deletePage(pageId: string): Promise<any> {
    return this.makeRequest(`/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  // AI processing
  async processPageWithAI(pageId: string, provider: string = 'ollama'): Promise<any> {
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
  async batchProcessProject(projectId: string, provider: string = 'ollama'): Promise<any> {
    return this.makeRequest(`/ai/projects/${projectId}/batch-process`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
