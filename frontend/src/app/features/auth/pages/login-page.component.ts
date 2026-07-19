import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  NgZone,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn', { static: false }) googleBtn!: ElementRef;

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  ngOnInit(): void {
    // If already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    // Wait for the Google Identity Services script to load
    if (typeof google === 'undefined' || !google.accounts) {
      setTimeout(() => this.initializeGoogleSignIn(), 200);
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleCredentialResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      width: 320,
      logo_alignment: 'left'
    });
  }

  private handleCredentialResponse(response: any): void {
    // Run inside Angular zone since the Google callback runs outside it
    this.ngZone.run(() => {
      this.authService.loginWithGoogle(response.credential);
    });
  }
}
