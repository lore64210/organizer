import { useEffect, useRef, type ReactNode } from 'react';
import { CREATE_REMINDER } from '../config/redux/actions';
import { useAppDispatch, useAppSelector } from '../config/redux/hooks';
import { DEMO_MODE, getDemoReminders } from '../config/demo';

/**
 * Seeds demo content once, only on demo builds and only when the persisted
 * store is empty. PersistGate guarantees rehydration finished before mounting.
 */
const DemoSeeder = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector(state => state.remindersReducer.reminders);
  const seeded = useRef(false);

  useEffect(() => {
    if (!DEMO_MODE || seeded.current || reminders.length > 0) {
      return;
    }
    seeded.current = true;
    getDemoReminders().forEach(reminder =>
      dispatch({ type: CREATE_REMINDER, payload: reminder }),
    );
  }, [dispatch, reminders.length]);

  return <>{children}</>;
};

export default DemoSeeder;
