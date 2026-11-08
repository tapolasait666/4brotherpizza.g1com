import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

let cached = null;

export function useSiteSettings() {
  const [data, setData] = useState(cached);

  useEffect(() => {
    if (cached) return;
    let active = true;
    api
      .get('/settings/public')
      .then((result) => {
        cached = result;
        if (active) setData(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return data;
}

export const FALLBACK_SETTINGS = {
  name: '4 Brothers Pizza',
  tagline: 'Best Pizza In Town',
  phone: '+92 81 2853377',
  altPhone: '+92 343 3733272',
  email: 'hello@4brothers.pk',
  address: 'Spinny Road, Quetta City',
  deliveryFee: 150,
  minOrder: 500,
  openTime: '11:00 AM',
  closeTime: '12:00 AM',
  isOpen: true,
  paymentProvider: 'COD',
};
