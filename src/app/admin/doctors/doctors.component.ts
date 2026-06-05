import { HttpClient } from '@angular/common/http';
import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class AdminDoctorsComponent implements OnInit {

  doctors: any[] = []

  addDoctorData: any = {
    name: '',
    hospital: '',
    specialization: '',
    availability: '',
    image: ''
  }

  editMode: boolean = false
  editId: string = ''

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {

    // 🔒 protect route
    const role = sessionStorage.getItem('role')

    if (role !== 'admin') {
      this.router.navigateByUrl('/')
      return
    }

    this.getDoctors()
  }

  // ✅ GET DOCTORS
  getDoctors() {
    this.http.get('http://localhost:3000/get-doctors')
      .subscribe((res: any) => {
        this.doctors = res
      })
  }

  // ✅ ADD DOCTOR
  addDoctor() {

    if (
      !this.addDoctorData.name ||
      !this.addDoctorData.hospital ||
      !this.addDoctorData.specialization ||
      !this.addDoctorData.availability
    ) {
      alert('Please fill all fields')
      return
    }

    this.http.post('http://localhost:3000/admin/add-doctor', this.addDoctorData)
      .subscribe(() => {
        alert('Doctor added')
        this.resetForm()
        this.getDoctors()
      })
  }

  // ✅ DELETE DOCTOR
  deleteDoctor(id: string) {
    this.http.delete(`http://localhost:3000/admin/delete-doctor/${id}`)
      .subscribe(() => {
        alert('Doctor deleted')
        this.getDoctors()
      })
  }

  // ✅ EDIT DOCTOR
  editDoctor(doc: any) {
    this.editMode = true
    this.editId = doc._id
    this.addDoctorData = { ...doc }
  }

  // ✅ UPDATE DOCTOR
  updateDoctor() {

    const token = sessionStorage.getItem('token')
  
    this.http.put(
      `http://localhost:3000/admin/update-doctor/${this.editId}`,
      this.addDoctorData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: () => {
        alert('Doctor updated')
        this.editMode = false
        this.resetForm()
        this.getDoctors()
      },
      error: (err) => {
        console.log(err)
        alert('Update failed')
      }
    })
  }
  cancelEdit() {
    this.editMode = false
    this.resetForm()
  }
  // ✅ RESET FORM
  resetForm() {
    this.addDoctorData = {
      name: '',
      hospital: '',
      specialization: '',
      availability: '',
      image: ''
    }
  }

}
