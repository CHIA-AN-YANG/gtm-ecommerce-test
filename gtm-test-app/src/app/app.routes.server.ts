import { RenderMode, ServerRoute } from '@angular/ssr';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SettingsListComponent } from './features/settings/settings-list/settings-list.component';
import { EventTesterComponent } from './features/ecommerce/components/event-tester/event-tester.component';
import { AuthGuard } from './core/guards/auth.guard';
import { Route } from '@angular/router';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

export const routes: Route[] = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'settings', component: SettingsListComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventTesterComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/events', pathMatch: 'full' },
];
