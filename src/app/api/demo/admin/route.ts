import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Generate comprehensive demo data for admin dashboard
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Demo admin KPIs
    const adminKpis = {
      pendingLeaves: 8,
      pendingRegularizations: 5,
      employeesPresentToday: 42,
      punchesToday: 78,
      halfDaysToday: 3,
      disconnectsToday: 12,
      weekDisconnects: [8, 12, 6, 15, 9, 7, 12],
      weekHalfDays: [2, 4, 1, 3, 2, 1, 3],
      topDisconnects: [
        { user_id: "emp:john.doe", count: 15 },
        { user_id: "emp:jane.smith", count: 12 },
        { user_id: "emp:mike.wilson", count: 8 },
        { user_id: "emp:sarah.johnson", count: 6 },
        { user_id: "emp:david.brown", count: 4 }
      ]
    };

    // Demo pending requests
    const pendingRequests = {
      leaves: [
        {
          id: "L001",
          user_id: "emp:alice.cooper",
          start_date: "2024-12-23",
          end_date: "2024-12-27",
          reason: "Christmas vacation",
          status: "pending",
          created_at: "2024-12-01T10:00:00Z"
        },
        {
          id: "L002",
          user_id: "emp:bob.marley",
          start_date: "2024-12-15",
          end_date: "2024-12-15",
          reason: "Medical appointment",
          status: "pending",
          created_at: "2024-12-10T14:30:00Z"
        },
        {
          id: "L003",
          user_id: "emp:carol.king",
          start_date: "2024-11-28",
          end_date: "2024-11-29",
          reason: "Personal emergency",
          status: "pending",
          created_at: "2024-11-25T09:15:00Z"
        },
        {
          id: "L004",
          user_id: "emp:diana.ross",
          start_date: "2024-12-20",
          end_date: "2024-12-22",
          reason: "Family wedding",
          status: "pending",
          created_at: "2024-12-05T11:45:00Z"
        },
        {
          id: "L005",
          user_id: "emp:frank.sinatra",
          start_date: "2024-12-18",
          end_date: "2024-12-18",
          reason: "Sick leave",
          status: "pending",
          created_at: "2024-12-17T08:30:00Z"
        }
      ],
      regularizations: [
        {
          id: "R001",
          user_id: "emp:elvis.presley",
          date: "2024-11-15",
          reason: "Missed punch",
          kind: "attendance",
          status: "pending",
          created_at: "2024-11-16T08:00:00Z"
        },
        {
          id: "R002",
          user_id: "emp:madonna.ciccone",
          date: "2024-11-14",
          reason: "Network disconnect",
          kind: "disconnect",
          status: "pending",
          created_at: "2024-11-14T16:45:00Z"
        },
        {
          id: "R003",
          user_id: "emp:prince.rogers",
          date: "2024-11-13",
          reason: "System error",
          kind: "attendance",
          status: "pending",
          created_at: "2024-11-13T10:20:00Z"
        },
        {
          id: "R004",
          user_id: "emp:whitney.houston",
          date: "2024-11-12",
          reason: "Power outage",
          kind: "disconnect",
          status: "pending",
          created_at: "2024-11-12T15:30:00Z"
        },
        {
          id: "R005",
          user_id: "emp:michael.jackson",
          date: "2024-11-11",
          reason: "Forgot to punch out",
          kind: "attendance",
          status: "pending",
          created_at: "2024-11-12T09:00:00Z"
        }
      ]
    };

    // Demo attendance data
    const attendanceData = {
      items: [
        {
          user_id: "emp:alice.cooper",
          day: today,
          half_day: false,
          disconnects: 2
        },
        {
          user_id: "emp:bob.marley",
          day: today,
          half_day: true,
          disconnects: 1
        },
        {
          user_id: "emp:carol.king",
          day: today,
          half_day: false,
          disconnects: 0
        },
        {
          user_id: "emp:diana.ross",
          day: today,
          half_day: false,
          disconnects: 3
        },
        {
          user_id: "emp:elvis.presley",
          day: today,
          half_day: false,
          disconnects: 1
        },
        {
          user_id: "emp:frank.sinatra",
          day: today,
          half_day: true,
          disconnects: 4
        },
        {
          user_id: "emp:madonna.ciccone",
          day: today,
          half_day: false,
          disconnects: 0
        },
        {
          user_id: "emp:prince.rogers",
          day: today,
          half_day: false,
          disconnects: 2
        },
        {
          user_id: "emp:whitney.houston",
          day: today,
          half_day: false,
          disconnects: 1
        },
        {
          user_id: "emp:michael.jackson",
          day: today,
          half_day: true,
          disconnects: 5
        },
        {
          user_id: "emp:tina.turner",
          day: today,
          half_day: false,
          disconnects: 0
        },
        {
          user_id: "emp:aretha.franklin",
          day: today,
          half_day: false,
          disconnects: 2
        },
        {
          user_id: "emp:stevie.wonder",
          day: today,
          half_day: false,
          disconnects: 1
        },
        {
          user_id: "emp:ray.charles",
          day: today,
          half_day: false,
          disconnects: 3
        },
        {
          user_id: "emp:dolly.parton",
          day: today,
          half_day: false,
          disconnects: 0
        }
      ]
    };

    return NextResponse.json({
      adminKpis,
      pendingRequests,
      attendanceData,
      isDemoData: true
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Demo data error" }, { status: 500 });
  }
}