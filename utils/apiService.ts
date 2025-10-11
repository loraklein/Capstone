import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Backend API configuration
// Priority: Environment variable > hardcoded fallback
// Production: Uses Render deployment
// Local dev: Set EXPO_PUBLIC_API_URL=http://192.168.0.207:3001/api in your environment
const API_BASE_URL = 
  Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'https://capstone-backend-og2c.onrender.com/api'; // Render production URL

// API service for backend communication
export class ApiService {
  private baseURL: string;
  private getAccessToken: (() => string | null) | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
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
