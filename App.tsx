import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
type RootState = ReturnType<typeof store.getState>;
import AuthTabs from './src/navigation/AuthTabs';
// import AppDrawer from './src/navigation/AppDrawer';
import AppStack from './src/navigation/AppStack';

function Main() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <AppStack /> : <AuthTabs />;
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Main />
      </NavigationContainer>
    </Provider>
  );
}
