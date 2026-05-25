<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),

            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'company' => fake()->company(),
    
            'source' => fake()->randomElement(['website', 'facebook', 'linkedin', 'referral', 'cold_call']),
            'status' => fake()->randomElement(['new', 'contacted', 'qualified', 'lost', 'converted']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),

            'follow_up_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
