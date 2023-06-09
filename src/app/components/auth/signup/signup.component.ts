import { AuthService } from 'src/app/services/auth.service';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SignupResponse, User } from 'src/app/models/user.interface';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm !: FormGroup;
  errorMessage: string = "";
  user = {} as User;
  loading:boolean=false;
  constructor(private authService: AuthService, private router: Router, private tokenService: TokenService) { }
  ngOnInit(): void {
   this.formInit();// initialize form
  }
  formInit() {
    this.signupForm = new FormGroup({ // initialize form group
      'firstname': new FormControl("", [Validators.required]),
      'lastname': new FormControl("", [Validators.required]),
      'username': new FormControl("", [Validators.required]),
      'email': new FormControl("", [Validators.required, Validators.email]),
      'password': new FormControl("", [Validators.required]),
      'confirmPassword': new FormControl("", [Validators.required]),
    });
  }

  signup() {
    this.loading=true;
    const user = this.signupForm.value; // get form value
    this.authService.register(user).subscribe({ // subscribe to register method
      next: (response: SignupResponse) => {
        this.user = response.user; // set user
        response.token && this.tokenService.setToken(response.token); // save token in cookie
        this.signupForm.reset(); // reset form
        this.errorMessage=""; // reset error message
       },
      error: (error: any) => { 
        this.errorMessage = error.error.message; // set error message
        this.loading=false; // stop loading
      },
      complete: () => { 
        this.router.navigate(['/streams']); // navigate to streams
        this.loading=false; // stop loading
      }
    });  // call register method from auth service
  }
}
