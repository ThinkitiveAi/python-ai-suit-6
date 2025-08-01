/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as RegisterRouteImport } from './routes/register'
import { Route as ProviderAvailabilityRouteImport } from './routes/provider-availability'
import { Route as PatientRegisterRouteImport } from './routes/patient-register'
import { Route as PatientLoginRouteImport } from './routes/patient-login'
import { Route as PatientDashboardRouteImport } from './routes/patient-dashboard'
import { Route as LoginRouteImport } from './routes/login'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as IndexRouteImport } from './routes/index'

const RegisterRoute = RegisterRouteImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRouteImport,
} as any)
const ProviderAvailabilityRoute = ProviderAvailabilityRouteImport.update({
  id: '/provider-availability',
  path: '/provider-availability',
  getParentRoute: () => rootRouteImport,
} as any)
const PatientRegisterRoute = PatientRegisterRouteImport.update({
  id: '/patient-register',
  path: '/patient-register',
  getParentRoute: () => rootRouteImport,
} as any)
const PatientLoginRoute = PatientLoginRouteImport.update({
  id: '/patient-login',
  path: '/patient-login',
  getParentRoute: () => rootRouteImport,
} as any)
const PatientDashboardRoute = PatientDashboardRouteImport.update({
  id: '/patient-dashboard',
  path: '/patient-dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const DashboardRoute = DashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/login': typeof LoginRoute
  '/patient-dashboard': typeof PatientDashboardRoute
  '/patient-login': typeof PatientLoginRoute
  '/patient-register': typeof PatientRegisterRoute
  '/provider-availability': typeof ProviderAvailabilityRoute
  '/register': typeof RegisterRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/login': typeof LoginRoute
  '/patient-dashboard': typeof PatientDashboardRoute
  '/patient-login': typeof PatientLoginRoute
  '/patient-register': typeof PatientRegisterRoute
  '/provider-availability': typeof ProviderAvailabilityRoute
  '/register': typeof RegisterRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/login': typeof LoginRoute
  '/patient-dashboard': typeof PatientDashboardRoute
  '/patient-login': typeof PatientLoginRoute
  '/patient-register': typeof PatientRegisterRoute
  '/provider-availability': typeof ProviderAvailabilityRoute
  '/register': typeof RegisterRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/dashboard'
    | '/login'
    | '/patient-dashboard'
    | '/patient-login'
    | '/patient-register'
    | '/provider-availability'
    | '/register'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/dashboard'
    | '/login'
    | '/patient-dashboard'
    | '/patient-login'
    | '/patient-register'
    | '/provider-availability'
    | '/register'
  id:
    | '__root__'
    | '/'
    | '/dashboard'
    | '/login'
    | '/patient-dashboard'
    | '/patient-login'
    | '/patient-register'
    | '/provider-availability'
    | '/register'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DashboardRoute: typeof DashboardRoute
  LoginRoute: typeof LoginRoute
  PatientDashboardRoute: typeof PatientDashboardRoute
  PatientLoginRoute: typeof PatientLoginRoute
  PatientRegisterRoute: typeof PatientRegisterRoute
  ProviderAvailabilityRoute: typeof ProviderAvailabilityRoute
  RegisterRoute: typeof RegisterRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/provider-availability': {
      id: '/provider-availability'
      path: '/provider-availability'
      fullPath: '/provider-availability'
      preLoaderRoute: typeof ProviderAvailabilityRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/patient-register': {
      id: '/patient-register'
      path: '/patient-register'
      fullPath: '/patient-register'
      preLoaderRoute: typeof PatientRegisterRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/patient-login': {
      id: '/patient-login'
      path: '/patient-login'
      fullPath: '/patient-login'
      preLoaderRoute: typeof PatientLoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/patient-dashboard': {
      id: '/patient-dashboard'
      path: '/patient-dashboard'
      fullPath: '/patient-dashboard'
      preLoaderRoute: typeof PatientDashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DashboardRoute: DashboardRoute,
  LoginRoute: LoginRoute,
  PatientDashboardRoute: PatientDashboardRoute,
  PatientLoginRoute: PatientLoginRoute,
  PatientRegisterRoute: PatientRegisterRoute,
  ProviderAvailabilityRoute: ProviderAvailabilityRoute,
  RegisterRoute: RegisterRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
