import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css']
})
export class AdminAppointmentsComponent implements OnInit {

  appointments: any[] = []

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAppointments()
  }

  getAppointments() {
    this.http.get('http://localhost:3000/admin/get-all-ap')
      .subscribe((res: any) => {
        this.appointments = res
      })
  }

  deleteAppointment(id: string) {
    this.http.delete(`http://localhost:3000/admin/delete-ap/${id}`)
      .subscribe(() => {
        this.getAppointments()
      })
  }


}