import { RenderMode, ServerRoute } from '@angular/ssr';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsListComponent } from './components/settings-list/settings-list.component';
import { EventTesterComponent } from './components/event-tester/event-tester.component';
import { AuthGuard } from './services/auth.guard';
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
