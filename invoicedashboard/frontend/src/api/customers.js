import client from './client';

export const getCustomers       = ()   => client.get('/customers').then(r => r.data);
export const getTop5Customers   = ()   => client.get('/customers/top5').then(r => r.data);
export const getCustomerProfile = (id) => client.get(`/customers/${id}`).then(r => r.data);