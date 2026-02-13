import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './pages/home/home';
import { Admin } from './pages/admin/admin';
import { ListUsers } from './pages/admin/usuarios/list-users/list-users';
import { Docente } from './pages/docente/docente';
import { Director } from './pages/director/director';
import { CreateUser } from './pages/admin/usuarios/create-user/create-user';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'admin',
        component: Admin
    },
    // Rutas Admin
    {
        path: 'usuarios',
        component: ListUsers
    },
    {
        path: 'crearUsuarios',
        component: CreateUser
    },
    {
        path: 'docente',
        component: Docente
    },
    {
        path: 'director',
        component: Director
    }
];
