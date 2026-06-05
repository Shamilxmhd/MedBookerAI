import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const authStatus = inject(ApiService)
  const toaster = inject(ToastrService)
  const router = inject(Router)

  const role = sessionStorage.getItem('role')
  const expectedRole = route.data['role']

  // ✅ If already logged in AND trying to access auth page
  if (route.routeConfig?.path === 'auth' && authStatus.isLoggedIn()) {

    if (role === 'admin') {
      router.navigateByUrl('/admin')
    } else {
      router.navigateByUrl('/')
    }

    return false
  }

  // ❌ Not logged in
  if (!authStatus.isLoggedIn()) {

    // allow public routes
    if (!expectedRole) {
      return true
    }

    toaster.warning('Please login first')
    router.navigateByUrl('/auth')
    return false
  }

  // ❌ Role mismatch
  if (expectedRole && role !== expectedRole) {

    if (role === 'admin') {
      router.navigateByUrl('/admin')
    } else {
      router.navigateByUrl('/')
    }

    return false
  }

  return true
}