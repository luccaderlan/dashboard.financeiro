/**
 * Cliente HTTP centralizado para comunicação com o backend.
 * Gerencia o access token e erros de autenticação.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

class ApiClient {
  #token = null;

  setToken(token) {
    this.#token = token;
  }

  getToken() {
    return this.#token;
  }

  async #request(method, path, body, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.#token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.#token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include', // Necessário para cookies HttpOnly (refresh token)
      body: body != null ? JSON.stringify(body) : undefined,
    });

    // Sem conteúdo (204)
    if (response.status === 204) return null;

    let data;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(response.status, 'Erro de comunicação com o servidor.');
      }
      return null;
    }

    if (!response.ok) {
      throw new ApiError(
        data.statusCode ?? response.status,
        data.message ?? 'Erro desconhecido.',
        data
      );
    }

    return data;
  }

  get(path, options)         { return this.#request('GET',    path, null, options); }
  post(path, body, options)  { return this.#request('POST',   path, body, options); }
  put(path, body, options)   { return this.#request('PUT',    path, body, options); }
  delete(path, options)      { return this.#request('DELETE', path, null, options); }
}

export class ApiError extends Error {
  constructor(statusCode, message, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }

  get isUnauthorized() { return this.statusCode === 401; }
  get isNotFound()     { return this.statusCode === 404; }
  get isConflict()     { return this.statusCode === 409; }
  get isServerError()  { return this.statusCode >= 500; }
}

// Singleton — uma única instância compartilhada em toda a aplicação
export const apiClient = new ApiClient();
