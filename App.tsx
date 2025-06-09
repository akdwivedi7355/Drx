import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import AuthTabs from './src/navigation/AuthTabs';
import AppStack from './src/navigation/AppStack';
import CustomSafeArea from './src/components/CustomSafeArea';

type RootState = ReturnType<typeof store.getState>;

function Main() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <AppStack /> : <AuthTabs />;
}

export default function App() {
  return (
    <Provider store={store}>
      <CustomSafeArea backgroundColor="#f2f2f2" statusBarColor="dark-content">
        <NavigationContainer>
          <Main />
        </NavigationContainer>
      </CustomSafeArea>
    </Provider>
  );
}
