<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\LeadActivity;
use App\Models\User;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;
        $today = now()->toDateString();

        // Metric counts
        $totalLeads = Lead::where('user_id', $userId)->count();
        $newLeads = Lead::where('user_id', $userId)->where('status', 'new')->count();
        $convertedLeads = Lead::where('user_id', $userId)->where('status', 'converted')->count();
        $lostLeads = Lead::where('user_id', $userId)->where('status', 'lost')->count();

        $todayFollowUpsCount = Lead::where('user_id', $userId)
            ->whereDate('follow_up_date', $today)
            ->count();

        $overdueFollowUpsCount = Lead::where('user_id', $userId)
            ->whereDate('follow_up_date', '<', $today)
            ->whereNotIn('status', ['converted', 'lost'])
            ->count();

        $pipelineValue = Lead::where('user_id', $userId)
            ->whereNotIn('status', ['converted', 'lost'])
            ->sum('estimated_value');

        // Status Chart data
        $statusChart = Lead::where('user_id', $userId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        // Source Chart data
        $sourceChart = Lead::where('user_id', $userId)
            ->selectRaw('source, count(*) as count')
            ->groupBy('source')
            ->get();

        // Today's Follow-ups
        $todayFollowUps = Lead::where('user_id', $userId)
            ->whereDate('follow_up_date', $today)
            ->get(['id', 'name', 'company', 'phone', 'follow_up_date']);

        // Overdue Follow-ups
        $overdueFollowUps = Lead::where('user_id', $userId)
            ->whereDate('follow_up_date', '<', $today)
            ->whereNotIn('status', ['converted', 'lost'])
            ->get(['id', 'name', 'company', 'phone', 'follow_up_date']);

        // Recent Leads
        $recentLeads = Lead::where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        // Recent Activities
        $recentActivities = LeadActivity::whereHas('lead', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->with(['lead:id,name', 'user:id,name'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'metrics' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'converted_leads' => $convertedLeads,
                'lost_leads' => $lostLeads,
                'today_follow_ups' => $todayFollowUpsCount,
                'overdue_follow_ups' => $overdueFollowUpsCount,
                'pipeline_value' => (float)$pipelineValue,
            ],
            'charts' => [
                'status' => $statusChart,
                'source' => $sourceChart,
            ],
            'today_follow_ups' => $todayFollowUps,
            'overdue_follow_ups' => $overdueFollowUps,
            'recent_leads' => $recentLeads,
            'recent_activities' => $recentActivities,
        ]);
    }

    public function index(Request $request)
    {
        $query = Lead::query()
            ->where('user_id', $request->user()->id);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        $leads = $query->latest()->paginate(10);

        return response()->json($leads);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'source' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:new,contacted,qualified,lost,converted'],
            'priority' => ['required', 'in:low,medium,high'],
            'notes' => ['nullable', 'string'],
            'follow_up_date' => ['nullable', 'date'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
        ]);

        $lead = Lead::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        $addNote = LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user_id,
            'note' => $request->note
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'type' => 'lead_added',
            'description' => 'Lead added',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead created successfully',
            'lead' => $lead,
        ], 201);
    }

    public function show(Request $request, Lead $lead)
    {
        if ($lead->user_id !== $request->user()->id) {
            abort(403);
        }

        return $lead->load([
            'notes.user:id,name',
            'activities.user:id,name'
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        if ($lead->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'source' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'required', 'in:new,contacted,qualified,lost,converted'],
            'priority' => ['sometimes', 'required', 'in:low,medium,high'],
            'follow_up_date' => ['nullable', 'date'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
        ]);

        $lead->update($validated);

        $editNote = LeadNote::where('lead_id', $lead->id)
            ->update([
                'note' => $request->notes
            ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'type' => 'lead_updated',
            'description' => 'Lead Updated',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead updated successfully',
            'lead' => $lead,
        ], 200);
    }

    public function destroy(Request $request, Lead $lead)
    {
        if ($lead->user_id !== $request->user()->id) {
            abort(403);
        }

        $lead->delete();

        LeadActivity::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'type' => 'lead_deleted',
            'description' => 'Lead added',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead deleted successfully',
        ], 200);
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        if ($lead->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:new,contacted,qualified,proposal_sent,converted,lost'],
        ]);

        $oldStatus = $lead->status;

        $lead->update([
            'status' => $validated['status'],
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'type' => 'status_changed',
            'description' => "Status changed from {$oldStatus} to {$lead->status}",
            'old_value' => $oldStatus,
            'new_value' => $lead->status,
        ]);

        return response()->json([
            'message' => 'Status updated successfully.',
            'lead' => $lead,
            'old_status' => $oldStatus,
            'new_status' => $lead->status,
        ], 200);
    }

    public function assignLead(Request $request, Lead $lead)
{
    $validated = $request->validate([
        'assigned_user_id' => ['required', 'integer', 'exists:users,id'],
    ]);

    $salesUser = User::where('id', $validated['assigned_user_id'])
        ->where('roles', 2)
        ->first();

    if (!$salesUser) {
        return response()->json([
            'message' => 'Selected user must be a Sales Executive.'
        ], 422);
    }

    $lead->update([
        'assigned_user_id' => $validated['assigned_user_id'],
    ]);

    return response()->json([
        'message' => 'Lead assigned successfully.',
        'data' => $lead->load('assignedUser'),
    ]);
}
}
