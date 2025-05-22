import {View, TextInput, Button} from 'react-native';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../../redux/authSlice';

export default function LoginWithMobile() {
  const dispatch = useDispatch();

  const handleLogin = () => {
    // Simulated login
    const dummyUser = {
      id: 1,
      name: 'John Doe',
      method: 'mobile',
    };
    dispatch(loginSuccess(dummyUser));
  };

  return (
    <View>
      <TextInput placeholder="Enter mobile" />
      <TextInput placeholder="OTP or Password" />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
