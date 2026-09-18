<?php
use PHPUnit\Framework\TestCase;

class Test_CPT_Registration extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_archive_project_registers_with_show_in_rest() {
        WP_Mock::userFunction( '__', [ 'return' => function ( $text ) { return $text; } ] );
        WP_Mock::userFunction( 'register_post_type' )
            ->once()
            ->with(
                'archive_project',
                Mockery::on( function ( $args ) {
                    return $args['public'] === true
                        && $args['show_in_rest'] === true
                        && $args['show_ui'] === true
                        && $args['supports'] === [ 'title', 'thumbnail' ]
                        && $args['rest_base'] === 'archive-projects';
                } )
            );

        KSL_CPT_Archive_Project::register();
        $this->assertTrue( true );
    }

    public function test_client_logo_registers_with_show_in_rest() {
        WP_Mock::userFunction( '__', [ 'return' => function ( $text ) { return $text; } ] );
        WP_Mock::userFunction( 'register_post_type' )
            ->once()
            ->with(
                'client_logo',
                Mockery::on( function ( $args ) {
                    return $args['public'] === true
                        && $args['show_in_rest'] === true
                        && $args['supports'] === [ 'title', 'thumbnail' ]
                        && $args['rest_base'] === 'client-logos';
                } )
            );

        KSL_CPT_Client_Logo::register();
        $this->assertTrue( true );
    }
}
