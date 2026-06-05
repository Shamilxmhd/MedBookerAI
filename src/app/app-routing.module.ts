import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AddApComponent } from './add-ap/add-ap.component';
import { AuthComponent } from './auth/auth.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { authGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminDoctorsComponent } from './admin/doctors/doctors.component';
import { AdminAppointmentsComponent } from './admin/admin-appointments/admin-appointments.component';



const routes: Routes = [
  { component: AuthComponent,canActivate:[authGuard], path: 'auth' },
  { component: HomeComponent, path: '' },
  { component: AddApComponent, canActivate: [authGuard], data:{role:'user'}, path: 'bookAppointment' },
  { component: AppointmentsComponent, canActivate: [authGuard], data: { role: 'user' }, path: 'appointments' },
  { component: AdminDashboardComponent,canActivate:[authGuard],data:{role:'admin'}, path: 'admin' },
  { component: AdminDoctorsComponent, canActivate:[authGuard],data:{role:'admin'}, path: 'admin/doctors' },
  { component: AdminAppointmentsComponent, canActivate:[authGuard],data:{role:'admin'}, path: 'admin/appointments' },
  { redirectTo: '', path: '**' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
