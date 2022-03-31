import StackNavigator from './src/components/templates/StackNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/config/redux/store';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StackNavigator />
      </PersistGate>
    </Provider>
  );
}

export default App;