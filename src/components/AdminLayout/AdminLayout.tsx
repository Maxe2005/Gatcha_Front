// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';

const AdminLayout = () => (
  <>
    <Header title="Administration" />
    <Outlet />
  </>
);

export default AdminLayout;
