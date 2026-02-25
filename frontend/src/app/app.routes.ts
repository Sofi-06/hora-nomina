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
import { EditCode} from './pages/admin/codigos/edit-code/edit-code';
import { ListDepartments } from './pages/admin/departamentos/list-departments/list-departments';
import { ListActivities } from './pages/admin/actividades/list-activities/list-activities';
import { AuthGuard } from './auth.guard';
import { StateActivities } from './pages/admin/actividades/state-activities/state-activities';
import { ViewTypes } from './pages/admin/tipos/view-types/view-types';
import { Reportes } from './pages/reportes/reportes';
import { PreviewReports } from './pages/reportes/preview-reports/preview-reports';
import { CreateActivities } from './pages/docente/create-activities/create-activities';
import { EditActivities } from './pages/docente/edit-activities/edit-activities';

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
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [AuthGuard]
  },
  // Rutas Admin
  {
    path: 'usuarios',
    component: ListUsers,
    canActivate: [AuthGuard]
  },
  {
    path: 'crearUsuarios',
    component: CreateUser,
    canActivate: [AuthGuard]
  },
  {
    path: 'editarUsuarios/:id',
    component: EditUser,
    canActivate: [AuthGuard]
  },
  //Unidades
  {
    path: 'unidades',
    component: ListUnits,
    canActivate: [AuthGuard]
  },
    //Codigos
  {
    path: 'codigos',
    component: ListCodes,
    canActivate: [AuthGuard]
  },
    {
    path: 'crearCodigos',
    component: CreateCode,
    canActivate: [AuthGuard]
  },
    {
    path: 'editarCodigos/:id',
    component: EditCode,
    canActivate: [AuthGuard]
  },
  {
    path: 'verActividades/:id',
    component: ViewTypes,
    canActivate: [AuthGuard]
  },
    //Departamentos
  {
    path: 'departamentos',
    component: ListDepartments,
    canActivate: [AuthGuard]
  },
  {
    path: 'docente',
    component: Docente,
    canActivate: [AuthGuard]
  },
  //Actividades
  {
    path: 'actividades',
    component: ListActivities,
    canActivate: [AuthGuard]
  },
  {
    path: 'estadoActividades/:id',
    component: StateActivities,

  },
  {
    path: 'reportes',
    component: Reportes,
    canActivate: [AuthGuard]
  },
    {
    path: 'verReportes',
    component: PreviewReports,
    canActivate: [AuthGuard]
  },
      {
    path: 'crearActividad',
    component: CreateActivities,
    canActivate: [AuthGuard]
  }, 
    {
    path: 'editarActividad/:id',
    component: EditActivities,
    canActivate: [AuthGuard]
  }, 
    {
    path: 'director',
    component: Director,
    canActivate: [AuthGuard]
  }, 
];
