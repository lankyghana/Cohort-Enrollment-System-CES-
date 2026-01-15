<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Models\Course;

class BackfillCourseSlugs extends Command
{
    protected $signature = 'courses:backfill-slugs';
    protected $description = 'Backfill slugs for courses missing a slug';

    public function handle()
    {
        $count = 0;
        foreach (Course::whereNull('slug')->orWhere('slug', '')->get() as $course) {
            $slugBase = Str::slug($course->title);
            $slug = $slugBase;
            $i = 1;
            // Ensure uniqueness
            while (Course::where('slug', $slug)->where('id', '!=', $course->id)->exists()) {
                $slug = $slugBase . '-' . $i;
                $i++;
            }
            $course->slug = $slug;
            $course->save();
            $this->info("Backfilled slug for course ID {$course->id}: {$slug}");
            $count++;
        }
        $this->info("Backfilled slugs for {$count} courses.");
        return 0;
    }
}
