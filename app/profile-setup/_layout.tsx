import { Stack } from "expo-router";

export default function ProfileSetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="location" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="upload-avatar" />
    </Stack>
  );
}
