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
              const iconName = route.name === 'Câmera' ? 'camera' : 'picture';
              return <AntDesign name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#E53935',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: {
              backgroundColor: '#111',
              borderTopWidth: 0,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              height: 64,
              paddingBottom: 10,
              paddingTop: 6,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Câmera" component={CameraScreen} />
          <Tab.Screen
            name="Linha do Tempo"
            component={TimelineScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: '#111' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
              headerShadowVisible: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
