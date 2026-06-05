import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // SERVER_URL = 'https://medbooker-server.onrender.com';
  SERVER_URL = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  // register API
  registerAPI(user: any) {
    return this.http.post(`${this.SERVER_URL}/register`, user)
  }

  // login API
  loginAPI(user: any) {
    return this.http.post(`${this.SERVER_URL}/login`, user)
  }

  // token append
  appendTokenToHeader() {
    const token = sessionStorage.getItem('token')
    let headers = new HttpHeaders()
    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`)
    }
    return { headers }
  }
  // get doctors API
  getDoctorsAPI() {
    return this.http.get(`${this.SERVER_URL}/get-doctors`)
  }
  // addAppointmentAPI
  addApAPI(ApDetails: any) {
    return this.http.post(`${this.SERVER_URL}/add-ap`, ApDetails, this.appendTokenToHeader())
  }

  // getAppointmentAPI
  getApAPI() {
    return this.http.get(`${this.SERVER_URL}/get-ap`, this.appendTokenToHeader())
  }

  // deleteAppointmentAPI
  cancelApAPI(id: any) {
    return this.http.put(`http://localhost:3000/cancel-ap/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    })
  }

  // guarding
  isLoggedIn() {
    return !!sessionStorage.getItem('token')
  }
  // getNOtificationAPI
  getNotificationsAPI() {
    const token = sessionStorage.getItem('token')

    return this.http.get('http://localhost:3000/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
  // Notification MarkAsRead
  markAsReadAPI(id: any) {
    const token = sessionStorage.getItem('token')
  
    return this.http.put(
      `http://localhost:3000/notifications/read/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  }


}


