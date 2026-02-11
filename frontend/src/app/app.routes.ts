import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './pages/home/home';
import { Admin } from './pages/admin/admin';
import { Docente } from './pages/docente/docente';
import { Director } from './pages/director/director';

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
    {
        path: 'docente',
        component: Docente
    },
    {
        path: 'director',
        component: Director
    }
];
