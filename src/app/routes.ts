import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Editor from "./pages/Editor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/editor",
    Component: Editor,
  },
]);
