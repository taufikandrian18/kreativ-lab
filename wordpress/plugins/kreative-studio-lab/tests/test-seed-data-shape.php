<?php
use PHPUnit\Framework\TestCase;

class Test_Seed_Data_Shape extends TestCase {
    public function test_archive_projects_fixture_has_six_entries_with_required_keys() {
        $data = json_decode(
            file_get_contents( dirname( __DIR__ ) . '/data/archive-projects.json' ),
            true
        );

        $this->assertCount( 6, $data );

        $required = [ 'archive_no', 'title', 'client', 'industry', 'year_range', 'lab' ];
        foreach ( $data as $entry ) {
            foreach ( $required as $key ) {
                $this->assertArrayHasKey( $key, $entry );
            }
        }
    }

    public function test_archive_projects_fixture_lab_values_are_valid_enum() {
        $data = json_decode(
            file_get_contents( dirname( __DIR__ ) . '/data/archive-projects.json' ),
            true
        );

        foreach ( $data as $entry ) {
            $this->assertContains( $entry['lab'], [ 'product', 'creative', 'both' ] );
        }
    }

    public function test_client_logos_fixture_has_confirmed_entries_only() {
        $data = json_decode(
            file_get_contents( dirname( __DIR__ ) . '/data/client-logos.json' ),
            true
        );

        $this->assertCount( 24, $data );

        foreach ( $data as $entry ) {
            $this->assertArrayHasKey( 'name', $entry );
            $this->assertArrayHasKey( 'order', $entry );
        }
    }
}
