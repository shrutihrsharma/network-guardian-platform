import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
  token: string;
}

const STORAGE_KEY_USER = 'ng_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<UserProfile | null>(this.loadUserFromStorage());

  /** Reactive error message for the login page to display */
  readonly loginError = signal<string | null>(null);
  /** Loading state during login */
  readonly isLoggingIn = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  /**
   * Sends the Google ID token to the backend for verification.
   * On success, stores the user profile and navigates to /dashboard.
   */
  loginWithGoogle(idToken: string): void {
    this.loginError.set(null);
    this.isLoggingIn.set(true);

    this.http
      .post<UserProfile>(`${environment.apiBaseUrl}/auth/google`, { idToken })
      .subscribe({
        next: (response) => {
          this.userSignal.set(response);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response));
          this.isLoggingIn.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Google auth failed:', err);
          this.isLoggingIn.set(false);

          if (err.status === 0) {
            this.loginError.set('Cannot reach the server. Make sure the backend is running.');
          } else if (err.status === 401) {
            this.loginError.set('Token verification failed. Please try again.');
          } else {
            this.loginError.set('Authentication failed. Please try again.');
          }

          this.clearAuth();
        }
      });
  }

  /**
   * Clears authentication state and redirects to login.
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Returns the stored auth token for use in HTTP interceptors.
   */
  getToken(): string | null {
    return this.userSignal()?.token ?? null;
  }

  /**
   * Returns the current user profile.
   */
  getUser(): UserProfile | null {
    return this.userSignal();
  }

  private clearAuth(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  private loadUserFromStorage(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    return null;
  }
}
