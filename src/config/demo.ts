import i18n from './i18n';
import type { Item, Reminder } from './types';

/**
 * Demo mode is enabled at build time with EXPO_PUBLIC_DEMO=1.
 * It seeds a few reminders the first time the app opens with an empty store,
 * so the web demo never lands on an empty home screen.
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO === '1';

const HOUR = 60 * 60 * 1000;

const inHours = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();

const text = (id: string, value: string, checked = false): Item => ({
  id,
  type: 'text',
  value,
  checked,
});

const alarm = (id: string, title: string, hours: number): Item => ({
  id,
  type: 'alarm',
  value: {
    date: inHours(hours),
    title,
    notificationId: null,
  },
});

const image = (id: string, value: string): Item => ({
  id,
  type: 'image',
  value,
});

const BEACH =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80';
const MOUNTAINS =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80';

const demoEs: Reminder[] = [
  {
    id: 'demo-groceries',
    title: 'Lista del súper',
    checksEnabled: true,
    createdAt: Date.now() - 4 * 60000,
    items: [
      text('demo-groceries-1', 'Leche', true),
      text('demo-groceries-2', 'Pan integral'),
      text('demo-groceries-3', 'Café', true),
      text('demo-groceries-4', 'Frutas'),
      text('demo-groceries-5', 'Detergente'),
    ],
    imageItems: [],
  },
  {
    id: 'demo-weekend',
    title: 'Ideas para el finde',
    checksEnabled: false,
    createdAt: Date.now() - 3 * 60000,
    items: [
      text('demo-weekend-1', 'Caminata por la costa'),
      text('demo-weekend-2', 'Probar la receta de pasta'),
      alarm('demo-weekend-3', 'Reservar restaurante', 30),
      text('demo-weekend-4', 'Llamar a los abuelos'),
    ],
    imageItems: [image('demo-weekend-img-1', BEACH)],
  },
  {
    id: 'demo-work',
    title: 'Pendientes del trabajo',
    checksEnabled: true,
    createdAt: Date.now() - 2 * 60000,
    items: [
      text('demo-work-1', 'Terminar el informe', true),
      text('demo-work-2', 'Revisar el PR de la migración'),
      text('demo-work-3', 'Preparar la demo del viernes'),
      alarm('demo-work-4', 'Daily', 18),
    ],
    imageItems: [image('demo-work-img-1', MOUNTAINS)],
  },
  {
    id: 'demo-notes',
    title: 'Notas rápidas',
    checksEnabled: false,
    createdAt: Date.now() - 60000,
    items: [
      text('demo-notes-1', 'Comprar filtro de agua'),
      text('demo-notes-2', 'Renovar la tarjeta del subte'),
      text('demo-notes-3', 'Libro: Project Hail Mary'),
    ],
    imageItems: [],
  },
];

const demoEn: Reminder[] = [
  {
    id: 'demo-groceries',
    title: 'Groceries',
    checksEnabled: true,
    createdAt: Date.now() - 4 * 60000,
    items: [
      text('demo-groceries-1', 'Milk', true),
      text('demo-groceries-2', 'Whole-grain bread'),
      text('demo-groceries-3', 'Coffee', true),
      text('demo-groceries-4', 'Fruit'),
      text('demo-groceries-5', 'Dish soap'),
    ],
    imageItems: [],
  },
  {
    id: 'demo-weekend',
    title: 'Weekend ideas',
    checksEnabled: false,
    createdAt: Date.now() - 3 * 60000,
    items: [
      text('demo-weekend-1', 'Walk along the coast'),
      text('demo-weekend-2', 'Try the pasta recipe'),
      alarm('demo-weekend-3', 'Book a restaurant', 30),
      text('demo-weekend-4', 'Call the grandparents'),
    ],
    imageItems: [image('demo-weekend-img-1', BEACH)],
  },
  {
    id: 'demo-work',
    title: 'Work to-dos',
    checksEnabled: true,
    createdAt: Date.now() - 2 * 60000,
    items: [
      text('demo-work-1', 'Finish the report', true),
      text('demo-work-2', 'Review the migration PR'),
      text('demo-work-3', "Prepare Friday's demo"),
      alarm('demo-work-4', 'Daily stand-up', 18),
    ],
    imageItems: [image('demo-work-img-1', MOUNTAINS)],
  },
  {
    id: 'demo-notes',
    title: 'Quick notes',
    checksEnabled: false,
    createdAt: Date.now() - 60000,
    items: [
      text('demo-notes-1', 'Buy a water filter'),
      text('demo-notes-2', 'Renew the subway card'),
      text('demo-notes-3', 'Book: Project Hail Mary'),
    ],
    imageItems: [],
  },
];

export const getDemoReminders = (): Reminder[] =>
  i18n.locale.toLowerCase().startsWith('en') ? demoEn : demoEs;
