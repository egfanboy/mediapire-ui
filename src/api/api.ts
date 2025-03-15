import { mediapireService } from '../services/mediapire/mediapire';

class ApiGateway {
  private get apiHost(): string {
    const config = this.getConfig();

    // here we assume config is set since if nothing is in localstorage an error would be thrown before getting here
    const { scheme, host, port } = config;
    return `${scheme}://${host}:${port}`;
  }

  private getConfig(): MediapireManageConfig {
    const config = mediapireService.getManagerConfig();

    if (config === null) {
      throw Error('No mediapire config found');
    }

    return config;
  }

  private async request(url: string, options: RequestInit): Promise<Response> {
    const baseHeaders = {
      'Content-Type': 'application/json',
    };

    if (options.body) {
      options = {
        ...options,
        // body: shouldStringify ? JSON.stringify(body) : body,
        body: JSON.stringify(options.body),
      };
    }

    return fetch(this.buildUrl(url), {
      ...options,
      headers: { ...baseHeaders, ...options.headers },
    })
      .then((response) => {
        if (response.status >= 300) {
          return Promise.reject(response);
        }

        return response;
      })
      .catch((err) => Promise.reject(err));
  }

  get(url: string, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  post(url: string, options = {}) {
    return this.request(url, { ...options, method: 'POST' });
  }

  patch(url: string, options = {}) {
    return this.request(url, { ...options, method: 'PATCH' });
  }

  delete(url: string, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  put(url: string, options = {}) {
    return this.request(url, { ...options, method: 'PUT' });
  }

  buildUrl(url: string): string {
    return `${this.apiHost}${url}`;
  }
}

export default new ApiGateway();
