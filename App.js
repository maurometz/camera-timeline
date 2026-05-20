import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AntDesign from "@expo/vector-icons/AntDesign";

import CameraScreen from './src/screens/CameraScreen';
import TimelineScreen from './src/screens/TimelineScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'Câmera') {
                iconName = 'camera';
              } else if (route.name === 'Linha do Tempo') {
                iconName = 'picture';
              }

              return <AntDesign name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'red',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Câmera" component={CameraScreen} />
          <Tab.Screen 
            name="Linha do Tempo" 
            component={TimelineScreen} 
            options={{ headerShown: true }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
