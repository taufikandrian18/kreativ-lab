<?php
use PHPUnit\Framework\TestCase;

class Test_ACF_Field_Schema extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_archive_project_field_names_match_spec() {
        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Fields_Archive_Project::register();

        $names = array_map( fn( $f ) => $f['name'], $captured['fields'] );
        $expected = [
            'archive_no', 'client', 'industry', 'year_range',
            'scope', 'lab', 'hero_image', 'gallery', 'accent_color',
        ];
        sort( $names );
        sort( $expected );
        $this->assertSame( $expected, $names );
    }

    public function test_archive_project_lab_field_has_exact_choices() {
        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Fields_Archive_Project::register();

        $lab_field = array_values( array_filter(
            $captured['fields'],
            fn( $f ) => $f['name'] === 'lab'
        ) )[0];

        $this->assertSame(
            [ 'product' => 'Product', 'creative' => 'Creative', 'both' => 'Both' ],
            $lab_field['choices']
        );
    }

    public function test_client_logo_field_names_match_spec() {
        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Fields_Client_Logo::register();

        $names = array_map( fn( $f ) => $f['name'], $captured['fields'] );
        $expected = [ 'name', 'logo', 'order' ];
        sort( $names );
        sort( $expected );
        $this->assertSame( $expected, $names );
    }

    public function test_options_page_field_names_match_spec() {
        WP_Mock::userFunction( 'acf_add_options_page', [ 'times' => 1 ] );

        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Options_Page::register();

        $names = array_map( fn( $f ) => $f['name'], $captured['fields'] );
        $expected = [
            'phone_primary', 'phone_secondary', 'email',
            'instagram', 'address', 'og_image',
        ];
        sort( $names );
        sort( $expected );
        $this->assertSame( $expected, $names );
    }
}
