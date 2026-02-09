import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Component } from '@angular/core';
import { Home } from './pages/home/home';

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
    }

];
