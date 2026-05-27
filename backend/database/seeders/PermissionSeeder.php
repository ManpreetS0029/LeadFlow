<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [

            // Dashboard
            'dashboard.view',

            // Leads
            'leads.view',
            'leads.create',
            'leads.update',
            'leads.delete',

            'leads.assign',

            'leads.notes.create',
            'leads.notes.delete',

            'leads.status.change',

            'leads.search',
            'leads.filters',

            'leads.view_all',
            'leads.view_assigned',

            // Users
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
        ];

        foreach ($permissions as $permission) {

            DB::table('permissions')->updateOrInsert(
                ['name' => $permission],
                ['name' => $permission]
            );
        }
    }
}