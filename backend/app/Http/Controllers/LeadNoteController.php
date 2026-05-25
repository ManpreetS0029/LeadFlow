<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\LeadActivity;
use Illuminate\Http\Request;

class LeadNoteController extends Controller
{
    public function index(Request $request, Lead $lead)
    {
        if ($lead->user_id !== $request->user()->id) {
            abort(403);
        }

        $notes = $lead->notes()
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json([
            'notes' => $notes,
        ]);
    }

    public function store(Request $request, Lead $lead)
    {
        if ($lead->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:5000'],
        ]);

        $note = $lead->notes()->create([
            'user_id' => $request->user()->id,
            'note' => $validated['note'],
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'user_id' => $request->user()->id,
            'type' => 'note_added',
            'description' => 'Note added',
        ]);

        return response()->json([
            'message' => 'Note added successfully.',
            'note' => $note->load('user:id,name'),
        ], 201);
    }

    public function destroy(Request $request, LeadNote $note)
    {
        if ($note->lead->user_id !== $request->user()->id) {
            abort(403);
        }

        $leadId = $note->lead_id;

        $note->delete();

        LeadActivity::create([
            'lead_id' => $leadId,
            'user_id' => $request->user()->id,
            'type' => 'note_deleted',
            'description' => 'Note deleted',
        ]);

        return response()->json([
            'message' => 'Note deleted successfully.',
        ]);
    }
}