import { Redirect } from 'expo-router';

export default function Index() {
  // Always redirect to config screen first
  return <Redirect href="/config" />;
}
