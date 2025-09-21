import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Generate realistic demo data for employee dashboard
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Demo employee profile
    const profile = {
      user_id: "demo:employee",
      name: "Sarah Mitchell",
      email: "sarah.mitchell@company.com",
      department: "Product Design",
      employee_id: "EMP007",
      found: true
    };

    // Demo KPIs - realistic attendance patterns
    const kpis = {
      attendancePercent: 89,
      halfPct: 8,
      pending: 2
    };

    // Demo leave requests
    const leaveRequests = {
      items: [
        {
          id: "1",
          start_date: "2024-12-20",
          end_date: "2024-12-22",
          reason: "Holiday vacation",
          status: "approved",
          created_at: "2024-12-01T10:00:00Z"
        },
        {
          id: "2",
          start_date: "2024-11-15",
          end_date: "2024-11-15",
          reason: "Personal day",
          status: "pending",
          created_at: "2024-11-10T14:30:00Z"
        },
        {
          id: "3",
          start_date: "2024-10-05",
          end_date: "2024-10-07",
          reason: "Medical appointment",
          status: "approved",
          created_at: "2024-09-28T09:15:00Z"
        }
      ]
    };

    // Demo regularizations
    const regularizations = {
      items: [
        {
          id: "1",
          date: "2024-11-12",
          reason: "Missed punch",
          kind: "attendance",
          status: "pending",
          created_at: "2024-11-13T08:00:00Z"
        },
        {
          id: "2",
          date: "2024-11-08",
          reason: "Network disconnect",
          kind: "disconnect",
          status: "approved",
          created_at: "2024-11-08T16:45:00Z"
        }
      ]
    };

    // Demo attendance events (punch in/out)
    const attendanceEvents = [
      {
        id: "1",
        at: `${today}T09:15:00Z`,
        type: "in",
        method: "wifi"
      },
      {
        id: "2",
        at: `${today}T17:30:00Z`,
        type: "out",
        method: "wifi"
      },
      {
        id: "3",
        at: "2024-11-12T09:00:00Z",
        type: "in",
        method: "wifi"
      },
      {
        id: "4",
        at: "2024-11-12T18:15:00Z",
        type: "out",
        method: "wifi"
      },
      {
        id: "5",
        at: "2024-11-11T08:45:00Z",
        type: "in",
        method: "wifi"
      }
    ];

    // Demo network status
    const networkStatus = {
      allowed: true,
      message: "Connected to office WiFi"
    };

    // Demo user info
    const whoami = {
      ip: "demo:192.168.1.100",
      role: "employee",
      userId: "demo:employee"
    };

    return NextResponse.json({
      profile,
      kpis,
      leaveRequests,
      regularizations,
      attendanceEvents,
      networkStatus,
      whoami,
      isDemoData: true
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Demo data error" }, { status: 500 });
  }
}