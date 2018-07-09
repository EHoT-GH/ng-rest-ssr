import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IUser} from '../models/user.model';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {

  }

  addNewUserToDb(user: IUser) {
    return this.http.post('http://localhost:3000/api/', user);
  // .subscribe(
  //     response => {
  //       // this.getUsers();
  //       console.log(response);
  //     }, error => {
  //       console.log(error);
  //     }
  //   );
  }

  getUserToLogin(login: string, password: string) {
    return this.http.post(`http://localhost:3000/api/auth/`, {login, password});
  }

  getUsers() {
    return this.http.get('http://localhost:3000/api/');
  }

  deleteUser(id: string) {
    this.http.delete(`http://localhost:3000/api/${id}/`).subscribe(
      response => {
        console.log(response);
        this.getUsers();
      }, error => {
        console.log(error);
      }
    );
  }

  updateUser(user: IUser) {

    const updatedUser = Object.assign({}, user);

    updatedUser.name = 'new Name';

    this.http.put('http://localhost:3000/api/', updatedUser).subscribe(
      response => {
        console.log(response);
        this.getUsers();
      }, error => {
        console.log(error);
      }
    );
  }

}