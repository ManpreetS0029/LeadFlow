<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = DB::table('roles')->pluck('id', 'name');

        $permissions = DB::table('permissions')->pluck('id', 'name');

        $rolePermissions = [

            // Admin
            'admin' => [
                'dashboard.view',

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

                'users.view',
                'users.create',
                'users.update',
                'users.delete',
            ],

            // Manager
            'manager' => [
                'dashboard.view',

                'leads.view',
                'leads.create',
                'leads.update',

                'leads.assign',

                'leads.notes.create',

                'leads.status.change',

                'leads.search',
                'leads.filters',

                'leads.view_all',

                'users.view',
            ],

            // Sales Executive
            'sales_executive' => [
                'dashboard.view',

                'leads.view',
                'leads.update',

                'leads.notes.create',

                'leads.status.change',

                'leads.search',
                'leads.filters',

                'leads.view_assigned',
            ],
        ];

        foreach ($rolePermissions as $roleName => $permissionNames) {

            $roleId = $roles[$roleName] ?? null;

            if (!$roleId) {
                continue;
            }

            foreach ($permissionNames as $permissionName) {

                $permissionId = $permissions[$permissionName] ?? null;

                if (!$permissionId) {
                    continue;
                }

                DB::table('role_permissions')->updateOrInsert([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }
}