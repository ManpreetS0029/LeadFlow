<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Lead;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        Lead::factory()
            ->count(10)
            ->create([
                'user_id' => $user->id,
            ]);
    }
}
