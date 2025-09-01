import { http, HttpResponse } from "msw";
import {
  clients,
  coaches,
  programs,
  assessmentTemplates,
  assessmentAssignments,
  assessmentResults,
  sessions,
  tasks,
  goals,
  goalMilestones,
  goalMetrics,
  messageThreads,
  messages,
  attachments,
  typingIndicators,
  moderationReports,
  auditLogs,
  invoices,
  dashboardSummary,
} from "./db";
import type { Goal, GoalMilestone, GoalMetric, MetricHistory } from "../lib/types";

// Helper function to get paginated results
const getPaginatedResults = <T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  filters?: Record<string, any>,
) => {
  let filteredData = [...data];

  // Apply search filter
  if (search) {
    filteredData = filteredData.filter((item: any) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }

  // Apply other filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        filteredData = filteredData.filter((item: any) => item[key] === value);
      }
    });
  }

  const total = filteredData.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const results = filteredData.slice(start, end);

  return {
    data: results,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const handlers = [
  // Dashboard
  http.get("/api/dashboard/summary", () => {
    return HttpResponse.json(dashboardSummary);
  }),

  // Clients
  http.get("/api/clients", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("q") || undefined;
    const status = url.searchParams.get("status") || undefined;

    return HttpResponse.json(
      getPaginatedResults(clients, page, pageSize, search, { status }),
    );
  }),

  http.get("/api/clients/:id", ({ params }) => {
    const client = clients.find((c) => c.id === params.id);
    if (!client) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(client);
  }),

  http.post("/api/clients", async ({ request }) => {
    const body = (await request.json()) as any;
    const newClient = {
      ...body,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(newClient);
    return HttpResponse.json(newClient, { status: 201 });
  }),

  http.put("/api/clients/:id", async ({ params, request }) => {
    const index = clients.findIndex((c) => c.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    clients[index] = {
      ...clients[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(clients[index]);
  }),

  // Coaches
  http.get("/api/coaches", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("q") || undefined;

    return HttpResponse.json(
      getPaginatedResults(coaches, page, pageSize, search),
    );
  }),

  http.get("/api/coaches/:id", ({ params }) => {
    const coach = coaches.find((c) => c.id === params.id);
    if (!coach) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(coach);
  }),

  // Programs
  http.get("/api/programs", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("q") || undefined;

    return HttpResponse.json(
      getPaginatedResults(programs, page, pageSize, search),
    );
  }),

  http.get("/api/programs/:id", ({ params }) => {
    const program = programs.find((p) => p.id === params.id);
    if (!program) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(program);
  }),

  // Assessment Templates
  http.get("/api/assessment-templates", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const category = url.searchParams.get("category") || undefined;

    return HttpResponse.json(
      getPaginatedResults(assessmentTemplates, page, pageSize, undefined, {
        category,
      }),
    );
  }),

  http.get("/api/assessment-templates/:id", ({ params }) => {
    const template = assessmentTemplates.find((t) => t.id === params.id);
    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(template);
  }),

  // Sessions
  http.get("/api/sessions", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status") || undefined;
    const coachId = url.searchParams.get("coachId") || undefined;
    const clientId = url.searchParams.get("clientId") || undefined;

    return HttpResponse.json(
      getPaginatedResults(sessions, page, pageSize, undefined, {
        status,
        coachId,
        clientId,
      }),
    );
  }),

  http.get("/api/sessions/:id", ({ params }) => {
    const session = sessions.find((s) => s.id === params.id);
    if (!session) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(session);
  }),

  http.post("/api/sessions", async ({ request }) => {
    const body = (await request.json()) as any;
    const newSession = {
      ...body,
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    return HttpResponse.json(newSession, { status: 201 });
  }),

  // Tasks
  http.get("/api/tasks", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status") || undefined;
    const priority = url.searchParams.get("priority") || undefined;

    return HttpResponse.json(
      getPaginatedResults(tasks, page, pageSize, undefined, {
        status,
        priority,
      }),
    );
  }),

  http.get("/api/tasks/:id", ({ params }) => {
    const task = tasks.find((t) => t.id === params.id);
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.post("/api/tasks", async ({ request }) => {
    const body = (await request.json()) as any;
    const newTask = {
      ...body,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.put("/api/tasks/:id", async ({ params, request }) => {
    const index = tasks.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    tasks[index] = { ...tasks[index], ...body };
    if (body.status === "completed") {
      tasks[index].completedAt = new Date().toISOString();
    }
    return HttpResponse.json(tasks[index]);
  }),

  // Message Threads
  http.get("/api/message-threads", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

    return HttpResponse.json(
      getPaginatedResults(messageThreads, page, pageSize),
    );
  }),

  http.get("/api/message-threads/:id", ({ params }) => {
    const thread = messageThreads.find((t) => t.id === params.id);
    if (!thread) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(thread);
  }),

  http.put("/api/message-threads/:id/mute", async ({ params, request }) => {
    const thread = messageThreads.find((t) => t.id === params.id);
    if (!thread) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    thread.isMuted = body.muted;
    return HttpResponse.json(thread);
  }),

  http.put("/api/message-threads/:id/archive", async ({ params, request }) => {
    const thread = messageThreads.find((t) => t.id === params.id);
    if (!thread) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    thread.isArchived = body.archived;
    return HttpResponse.json(thread);
  }),

  // Messages
  http.get("/api/messages", ({ request }) => {
    const url = new URL(request.url);
    const threadId = url.searchParams.get("threadId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50");
    
    if (threadId) {
      const threadMessages = messages.filter((m) => m.threadId === threadId);
      return HttpResponse.json(
        getPaginatedResults(threadMessages, page, pageSize)
      );
    }
    
    return HttpResponse.json(
      getPaginatedResults(messages, page, pageSize)
    );
  }),

  http.get("/api/messages/:id", ({ params }) => {
    const message = messages.find((m) => m.id === params.id);
    if (!message) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(message);
  }),

  http.post("/api/messages", async ({ request }) => {
    const body = (await request.json()) as any;
    const newMessage = {
      ...body,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      readBy: [],
      isTyping: false,
      isDeleted: false,
      moderationStatus: "pending",
      reportCount: 0,
    };
    messages.push(newMessage);
    return HttpResponse.json(newMessage, { status: 201 });
  }),

  http.put("/api/messages/:id/read", async ({ params, request }) => {
    const message = messages.find((m) => m.id === params.id);
    if (!message) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    message.isRead = true;
    if (!message.readBy.includes(body.userId)) {
      message.readBy.push(body.userId);
    }
    message.readAt = new Date().toISOString();
    return HttpResponse.json(message);
  }),

  // Typing Indicators
  http.post("/api/typing", async ({ request }) => {
    const body = (await request.json()) as any;
    const existingIndicator = typingIndicators.find(
      (t) => t.userId === body.userId && t.threadId === body.threadId
    );
    
    if (existingIndicator) {
      existingIndicator.isTyping = body.isTyping;
      existingIndicator.lastActivity = new Date().toISOString();
    } else {
      typingIndicators.push({
        id: `typing-${Date.now()}`,
        userId: body.userId,
        threadId: body.threadId,
        isTyping: body.isTyping,
        lastActivity: new Date().toISOString(),
      });
    }
    
    return HttpResponse.json({ success: true });
  }),

  http.get("/api/typing/:threadId", ({ params }) => {
    const threadTyping = typingIndicators.filter((t) => t.threadId === params.threadId);
    return HttpResponse.json(threadTyping);
  }),

  // Attachments
  http.post("/api/attachments/upload", async ({ request }) => {
    const body = (await request.json()) as any;
    const newAttachment = {
      ...body,
      id: `att-${Date.now()}`,
      isVirusScanned: false,
      virusScanStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    attachments.push(newAttachment);
    
    // Simulate virus scanning
    setTimeout(() => {
      newAttachment.isVirusScanned = true;
      newAttachment.virusScanStatus = "clean";
      newAttachment.cdnUrl = `https://cdn.example.com/files/${newAttachment.name}`;
    }, 2000);
    
    return HttpResponse.json(newAttachment, { status: 201 });
  }),

  http.get("/api/attachments/:id", ({ params }) => {
    const attachment = attachments.find((a) => a.id === params.id);
    if (!attachment) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(attachment);
  }),

  // Search within conversations
  http.get("/api/messages/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const threadId = url.searchParams.get("threadId");
    
    let searchResults = messages.filter((m) => 
      m.content.toLowerCase().includes(query.toLowerCase()) &&
      (!threadId || m.threadId === threadId)
    );
    
    return HttpResponse.json({
      results: searchResults,
      total: searchResults.length,
      query,
    });
  }),

  // Export conversation to PDF
  http.post("/api/messages/export", async ({ request }) => {
    const body = (await request.json()) as any;
    
    // Simulate PDF generation
    return HttpResponse.json({
      id: `export-${Date.now()}`,
      threadId: body.threadId,
      status: "processing",
      downloadUrl: null,
      createdAt: new Date().toISOString(),
    });
  }),

  http.get("/api/messages/export/:id", ({ params }) => {
    // Simulate completed export
    return HttpResponse.json({
      id: params.id,
      status: "completed",
      downloadUrl: `https://example.com/exports/${params.id}.pdf`,
      createdAt: new Date().toISOString(),
    });
  }),

  // Moderation Reports
  http.get("/api/moderation/reports", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status") || undefined;
    
    return HttpResponse.json(
      getPaginatedResults(moderationReports, page, pageSize, undefined, { status })
    );
  }),

  http.post("/api/moderation/reports", async ({ request }) => {
    const body = (await request.json()) as any;
    const newReport = {
      ...body,
      id: `report-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    moderationReports.push(newReport);
    return HttpResponse.json(newReport, { status: 201 });
  }),

  http.put("/api/moderation/reports/:id", async ({ params, request }) => {
    const report = moderationReports.find((r) => r.id === params.id);
    if (!report) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    Object.assign(report, body);
    if (body.status === "resolved") {
      report.resolvedAt = new Date().toISOString();
    }
    return HttpResponse.json(report);
  }),

  // Audit Logs
  http.get("/api/audit-logs", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50");
    const action = url.searchParams.get("action") || undefined;
    const userId = url.searchParams.get("userId") || undefined;
    
    return HttpResponse.json(
      getPaginatedResults(auditLogs, page, pageSize, undefined, { action, userId })
    );
  }),

  http.post("/api/audit-logs", async ({ request }) => {
    const body = (await request.json()) as any;
    const newLog = {
      ...body,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    auditLogs.push(newLog);
    return HttpResponse.json(newLog, { status: 201 });
  }),

  // Invoices
  http.get("/api/invoices", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status") || undefined;

    return HttpResponse.json(
      getPaginatedResults(invoices, page, pageSize, undefined, { status }),
    );
  }),

  http.get("/api/invoices/:id", ({ params }) => {
    const invoice = invoices.find((i) => i.id === params.id);
    if (!invoice) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(invoice);
  }),

  // Reports
  http.get("/api/reports/trends", ({ request }) => {
    const url = new URL(request.url);
    const metric = url.searchParams.get("metric") || "revenue";
    const period = url.searchParams.get("period") || "30d";

    // Generate mock trend data
    const days =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const data = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      value: Math.floor(Math.random() * 1000) + 500,
    }));

    return HttpResponse.json({
      metric,
      data,
      period,
    });
  }),

  // Assessment Templates
  http.get("/api/assessment-templates", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const category = url.searchParams.get("category") || undefined;
    const search = url.searchParams.get("q") || undefined;
    
    return HttpResponse.json(
      getPaginatedResults(assessmentTemplates, page, pageSize, search, { category })
    );
  }),

  http.get("/api/assessment-templates/:id", ({ params }) => {
    const template = assessmentTemplates.find((t) => t.id === params.id);
    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(template);
  }),

  http.post("/api/assessment-templates", async ({ request }) => {
    const body = (await request.json()) as any;
    const newTemplate = {
      ...body,
      id: `template-${Date.now()}`,
      version: "1.0",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assessmentTemplates.push(newTemplate);
    return HttpResponse.json(newTemplate, { status: 201 });
  }),

  http.put("/api/assessment-templates/:id", async ({ params, request }) => {
    const index = assessmentTemplates.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    assessmentTemplates[index] = { 
      ...assessmentTemplates[index], 
      ...body, 
      updatedAt: new Date().toISOString() 
    };
    return HttpResponse.json(assessmentTemplates[index]);
  }),

  // Assessment Assignments
  http.get("/api/assessment-assignments", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status") || undefined;
    const clientId = url.searchParams.get("clientId") || undefined;
    const coachId = url.searchParams.get("coachId") || undefined;
    
    return HttpResponse.json(
      getPaginatedResults(assessmentAssignments, page, pageSize, undefined, { status, clientId, coachId })
    );
  }),

  http.post("/api/assessment-assignments", async ({ request }) => {
    const body = (await request.json()) as any;
    const template = assessmentTemplates.find((t) => t.id === body.assessmentId);
    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const newAssignment = {
      ...body,
      id: `assignment-${Date.now()}`,
      assignedAt: new Date().toISOString(),
      status: "assigned",
      progress: 0,
      lastAccessedAt: new Date().toISOString(),
      settings: template.settings,
      branding: template.branding,
    };
    assessmentAssignments.push(newAssignment);
    return HttpResponse.json(newAssignment, { status: 201 });
  }),

  http.put("/api/assessment-assignments/:id", async ({ params, request }) => {
    const index = assessmentAssignments.findIndex((a) => a.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as any;
    assessmentAssignments[index] = { 
      ...assessmentAssignments[index], 
      ...body, 
      lastAccessedAt: new Date().toISOString() 
    };
    return HttpResponse.json(assessmentAssignments[index]);
  }),

  // Assessment Results
  http.get("/api/assessment-results", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status") || undefined;
    const clientId = url.searchParams.get("clientId") || undefined;
    
    return HttpResponse.json(
      getPaginatedResults(assessmentResults, page, pageSize, undefined, { status, clientId })
    );
  }),

  http.get("/api/assessment-results/:id", ({ params }) => {
    const result = assessmentResults.find((r) => r.id === params.id);
    if (!result) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(result);
  }),

  http.post("/api/assessment-results", async ({ request }) => {
    const body = (await request.json()) as any;
    const newResult = {
      ...body,
      id: `result-${Date.now()}`,
      completedAt: new Date().toISOString(),
      status: "completed",
    };
    assessmentResults.push(newResult);
    return HttpResponse.json(newResult, { status: 201 });
  }),

  // AI Coach
  http.post("/api/ai-coach/generate-plan", async ({ request }) => {
    const body = (await request.json()) as any;

    // Mock AI response
    return HttpResponse.json({
      id: `plan-${Date.now()}`,
      prompt: body.prompt,
      generatedPlan: `Based on your request: "${body.prompt}", here's a personalized coaching plan:

1. **Week 1-2: Assessment & Foundation**
   - Complete initial assessment
   - Set clear, measurable goals
   - Establish baseline metrics

2. **Week 3-6: Core Development**
   - Focus on key areas identified
   - Weekly check-ins and adjustments
   - Progress tracking and celebration

3. **Week 7-8: Integration & Sustainability**
   - Apply learnings to daily life
   - Create long-term maintenance plan
   - Schedule follow-up sessions

This plan will be customized further based on your specific needs and progress.`,
      createdAt: new Date().toISOString(),
    });
  }),

  // Goals handlers
  http.get("/api/goals", () => {
    return HttpResponse.json({ data: goals });
  }),

  http.get("/api/goals/:id", ({ params }) => {
    const goal = goals.find((g) => g.id === params.id);
    if (!goal) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(goal);
  }),

  http.post("/api/goals", async ({ request }) => {
    const body = await request.json() as Partial<Goal>;
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: body.title || '',
      description: body.description || '',
      category: body.category || '',
      clientId: body.clientId || '',
      coachId: body.coachId,
      targetDate: body.targetDate || new Date().toISOString(),
      successCriteria: body.successCriteria || [],
      status: body.status || 'active',
      progress: body.progress || 0,
      milestones: [],
      metrics: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    return HttpResponse.json(newGoal, { status: 201 });
  }),

  http.put("/api/goals/:id", async ({ params, request }) => {
    const body = await request.json() as Partial<Goal>;
    const goalIndex = goals.findIndex((g: Goal) => g.id === params.id);
    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    goals[goalIndex] = { ...goals[goalIndex], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(goals[goalIndex]);
  }),

  // Milestones handlers
  http.get("/api/milestones", () => {
    return HttpResponse.json({ data: goalMilestones });
  }),

  http.post("/api/milestones", async ({ request }) => {
    const body = await request.json() as Partial<GoalMilestone>;
    const newMilestone: GoalMilestone = {
      id: `milestone-${Date.now()}`,
      goalId: body.goalId || '',
      title: body.title || '',
      description: body.description || '',
      targetDate: body.targetDate || new Date().toISOString(),
      status: body.status || 'pending',
      order: body.order || 1,
      createdAt: new Date().toISOString(),
    };
    goalMilestones.push(newMilestone);
    return HttpResponse.json(newMilestone, { status: 201 });
  }),

  // Metrics handlers
  http.get("/api/metrics", () => {
    return HttpResponse.json({ data: goalMetrics });
  }),

  http.post("/api/metrics/:id/history", async ({ params, request }) => {
    const metricId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!metricId) {
      return new HttpResponse(null, { status: 400 });
    }
    const body = await request.json() as { value: number; notes?: string };
    const metric = goalMetrics.find((m: GoalMetric) => m.id === metricId);
    if (!metric) {
      return new HttpResponse(null, { status: 404 });
    }
    const newHistory: MetricHistory = {
      id: `hist-${Date.now()}`,
      metricId: metricId,
      value: body.value,
      notes: body.notes,
      date: new Date().toISOString(),
    };
    metric.history.push(newHistory);
    metric.currentValue = body.value;
    return HttpResponse.json(newHistory, { status: 201 });
  }),
];
