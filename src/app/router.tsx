import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { DashboardPage } from "../features/dashboard/routes/DashboardPage";
import { ClientsPage } from "../features/clients/routes/ClientsPage";
import { ClientDetailPage } from "../features/clients/routes/ClientDetailPage";
import { CoachesPage } from "../features/coaches/routes/CoachesPage";
import { CoachDetailPage } from "../features/coaches/routes/CoachDetailPage";
import { ProgramsPage } from "../features/programs/routes/ProgramsPage";
import { ProgramDetailPage } from "../features/programs/routes/ProgramDetailPage";
import { AssessmentsPage } from "../features/assessments/routes/AssessmentsPage";
import { AssessmentDetailPage } from "../features/assessments/routes/AssessmentDetailPage";
import { SessionsPage } from "../features/sessions/routes/SessionsPage";
import { TasksPage } from "../features/tasks/routes/TasksPage";
import { MessagesPage } from "../features/messages/routes/MessagesPage";
import { ThreadPage } from "../features/messages/routes/ThreadPage";
import { BillingPage } from "../features/billing/routes/BillingPage";
import { ReportsPage } from "../features/reports/routes/ReportsPage";
import { AICoachPage } from "../features/aiCoach/routes/AICoachPage";
import { SettingsPage } from "../features/settings/routes/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "clients",
        element: <ClientsPage />,
      },
      {
        path: "clients/:id",
        element: <ClientDetailPage />,
      },
      {
        path: "coaches",
        element: <CoachesPage />,
      },
      {
        path: "coaches/:id",
        element: <CoachDetailPage />,
      },
      {
        path: "programs",
        element: <ProgramsPage />,
      },
      {
        path: "programs/:id",
        element: <ProgramDetailPage />,
      },
      {
        path: "assessments",
        element: <AssessmentsPage />,
      },
      {
        path: "assessments/:id",
        element: <AssessmentDetailPage />,
      },
      {
        path: "sessions",
        element: <SessionsPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "messages",
        element: <MessagesPage />,
      },
      {
        path: "messages/:id",
        element: <ThreadPage />,
      },
      {
        path: "billing",
        element: <BillingPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "ai-coach",
        element: <AICoachPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
], {
  // Ensure the app works under /thrive-circle locally too
  basename: new URL(process.env.PUBLIC_URL || '/thrive-circle', window.location.origin).pathname,
});
