import {FlatList, Text, View} from 'react-native';

const dummyPatients = [
  {id: 1, name: 'Alice Johnson', age: 28},
  {id: 2, name: 'Bob Smith', age: 42},
];

export default function Patients() {
  return (
    <FlatList
      data={dummyPatients}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <View>
          <Text>
            {item.name} - {item.age} yrs
          </Text>
        </View>
      )}
    />
  );
}
