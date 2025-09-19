import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  renderRouter,
  screen,
  userEvent,
  waitFor
} from "expo-router/testing-library";

import HomeScreen from "@/app/(tabs)/index";
import RootLayout from "@/app/_layout";
import AddProjectScreen from "@/app/add-project";
import ProjectDetailScreen from "@/app/project/[id]";

describe("create new project", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates to add project screen, creates project, and navigates to project detail", async () => {
    const user = userEvent.setup();

    renderRouter(
      {
        _layout: () => <RootLayout />,
        index: () => <HomeScreen />,
        "add-project": () => <AddProjectScreen />,
        "project/[id]": () => <ProjectDetailScreen />,
      },
      {
        initialUrl: "/",
      }
    );

    const addProjectButton = await screen.findByText("Tap here to create your first project");
    await user.press(addProjectButton);

    // Only the name is required for project creation
    const nameInput = await screen.findByPlaceholderText("Enter a name for your project");
    const createButton = await screen.findByText("Create Project");

    await user.type(nameInput, "Test Project");
    await user.press(createButton);

    // Wait for navigation and data saving to complete
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'projects',
        expect.stringContaining('"name":"Test Project"')
      );
    });

    // Verify navigation to project detail screen
    await screen.findByText("Test Project");
    await screen.findByText("0 pages");
  });
});