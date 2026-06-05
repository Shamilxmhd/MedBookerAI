import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-add-ap',
  templateUrl: './add-ap.component.html',
  styleUrls: ['./add-ap.component.css']
})
export class AddApComponent {
  constructor(private fb: FormBuilder, private toaster: ToastrService, private api: ApiService, private router: Router) { }
  doctors: any[] = []
  selectedDoctor: string = ''
  loading: boolean = false
  selectedHospital: string = ''

  ngOnInit() {

    const nav = this.router.getCurrentNavigation()
    // 👇 get doctor from route (if clicked from card)
    this.selectedDoctor = history.state?.doctor || ''
    this.getDoctors()
  }
  getDoctors() {
    this.api.getDoctorsAPI().subscribe((res: any) => {
      this.doctors = res

      // 👇 set default if coming from card
      if (this.selectedDoctor) {
        this.apForm.patchValue({
          doctor: this.selectedDoctor
        })
        this.onDoctorChange()
      }
    })
  }
  onDoctorChange() {
    const doc = this.doctors.find(d => d.name === this.apForm.value.doctor)
    this.selectedHospital = doc ? doc.hospital : ''
  }
  apForm = this.fb.group({
    doctor: ['', Validators.required],
    patientName: ['', Validators.required],
    age: ['', [Validators.required, Validators.min(1)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    visitType: ['', Validators.required],
    date: ['', Validators.required],
    description: ['', Validators.required],
    paymentMethod: ['', Validators.required]
  })

  save() {
    if (this.apForm.valid) {

      this.loading = true

      const formData = this.apForm.value

      const ApDetails = {
        doctor: formData.doctor,
        patientName: formData.patientName,
        age: formData.age,
        phone: formData.phone,
        visitType: formData.visitType,
        date: formData.date,
        description: formData.description,
        paymentMethod: formData.paymentMethod
      }

      // API CALL
      this.api.addApAPI(ApDetails).subscribe({
        next: (res: any) => {

          setTimeout(() => {
            this.loading = false
            // 🔥 Show token number (important upgrade)
            this.toaster.success("Booking successful!")

            this.apForm.reset()
            this.router.navigate(['/'], {
              state: { booking: res }
            })

          }, 800)
      
        },

        error: (reason: any) => {
          this.loading = false
          this.toaster.warning(reason.error)
        }

      })

    } else {
      this.toaster.warning('Please fill all fields correctly')
    }
   
  }

 

}
