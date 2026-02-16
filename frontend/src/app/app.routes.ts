import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './pages/home/home';
import { Admin } from './pages/admin/admin';
import { ListUsers } from './pages/admin/usuarios/list-users/list-users';
import { Docente } from './pages/docente/docente';
import { Director } from './pages/director/director';
import { CreateUser } from './pages/admin/usuarios/create-user/create-user';
import { EditUser } from './pages/admin/usuarios/edit-user/edit-user';
import { ListUnits } from './pages/admin/unidades/list-units/list-units';
import { ListCodes } from './pages/admin/codigos/list-codes/list-codes';
import { CreateCode } from './pages/admin/codigos/create-code/create-code';
import { EditCode

 } from './pages/admin/codigos/edit-code/edit-code';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'admin',
    component: Admin,
  },
  // Rutas Admin
  {
    path: 'usuarios',
    component: ListUsers,
  },
  {
    path: 'crearUsuarios',
    component: CreateUser,
  },
  {
    path: 'editarUsuarios/:id',
    component: EditUser,
  },
  //Unidades
  {
    path: 'unidades',
    component: ListUnits,
  },
    //Codigos
  {
    path: 'codigos',
    component: ListCodes,
  },
    {
    path: 'crearCodigos',
    component: CreateCode,
  },
    {
    path: 'editarCodigos/:id',
    component: EditCode,
  },
  {
    path: 'docente',
    component: Docente,
  },
  {
    path: 'director',
    component: Director,
  },
];
