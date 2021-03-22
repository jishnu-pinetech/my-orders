import React from 'react';

const Dashboard = React.lazy(() => import('./views'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/orders', name: 'Orders', component: Dashboard },
];

export default routes;
