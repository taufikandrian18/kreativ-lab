<?php
use PHPUnit\Framework\TestCase;

class Test_Site_Pages extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
        WP_Mock::userFunction( 'sanitize_key' )->andReturnUsing(
            fn( $k ) => preg_replace( '/[^a-z0-9_\-]/', '', strtolower( $k ) )
        );
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_schema_covers_every_route_and_the_chrome() {
        $keys = array_column( KSL_Site_Pages::schema(), 'key' );
        $this->assertSame(
            [ 'global', 'home', 'about', 'product_lab', 'creative_lab', 'archive', 'contact', 'not_found' ],
            $keys
        );
    }

    public function test_every_field_is_well_formed_and_unique_within_its_page() {
        $types = [ 'text', 'textarea', 'lines', 'pairs', 'groups', 'image', 'file', 'message' ];
        foreach ( KSL_Site_Pages::schema() as $page ) {
            $names = [];
            foreach ( $page['sections'] as $section ) {
                foreach ( $section['fields'] as $field ) {
                    $this->assertContains( $field['type'], $types, "{$page['key']}.{$field['name']}" );
                    $this->assertMatchesRegularExpression( '/^[a-z0-9_]+$/', $field['name'] );
                    $names[] = $field['name'];
                    if ( in_array( $field['type'], [ 'text', 'textarea', 'lines', 'pairs', 'groups' ], true ) ) {
                        // Every text field ships with the copy the site shows today.
                        $this->assertNotSame( '', trim( $field['default'] ?? '' ), "{$page['key']}.{$field['name']}" );
                    }
                }
            }
            $this->assertSame( count( $names ), count( array_unique( $names ) ), $page['key'] );
        }
    }

    public function test_field_group_targets_its_page_and_has_a_tab_per_section() {
        $home  = KSL_Site_Pages::page( 'home' );
        $group = KSL_Site_Pages::field_group( $home );

        $this->assertSame( 'group_ksl_page_home', $group['key'] );
        $this->assertSame( 'ksl_site_page', $group['location'][0][0]['param'] );
        $this->assertSame( 'home', $group['location'][0][0]['value'] );

        $tabs = array_filter( $group['fields'], fn( $f ) => $f['type'] === 'tab' );
        $this->assertCount( count( $home['sections'] ), $tabs );

        $keys = array_column( $group['fields'], 'key' );
        $this->assertSame( count( $keys ), count( array_unique( $keys ) ) );

        $by_name = array_column( $group['fields'], null, 'name' );
        $this->assertSame( 'textarea', $by_name['manifesto_steps']['type'] );
        $this->assertSame( '', $by_name['manifesto_steps']['new_lines'] );
        $this->assertSame( 'array', $by_name['hero_poster']['return_format'] );
        $this->assertSame( 'mp4', $by_name['hero_video_wide']['mime_types'] );
    }

    public function test_parsers_turn_textareas_into_structure() {
        $this->assertSame( [ 'a', 'b' ], KSL_Site_Pages::parse_lines( "  a \r\n\n b\n" ) );

        $this->assertSame(
            [ [ 'first' => 'It begins', 'second' => 'with understanding.' ], [ 'first' => 'Alone', 'second' => '' ] ],
            KSL_Site_Pages::parse_pairs( "It begins | with understanding.\nAlone" )
        );

        $this->assertSame(
            [
                [ 'name' => '', 'items' => [ 'Loose' ] ],
                [ 'name' => 'Print & Packaging', 'items' => [ 'Gift Sets', 'Publications' ] ],
            ],
            KSL_Site_Pages::parse_groups( "Loose\nPrint & Packaging:\nGift Sets\nPublications\nEmpty group:" )
        );
    }

    public function test_shape_turns_empty_fields_into_empty_values_not_missing_keys() {
        $shaped = KSL_Site_Pages::shape( KSL_Site_Pages::page( 'home' ), [
            'hero_headline'   => '  NEW HEADLINE  ',
            'manifesto_every' => "product\ndetail",
            'hero_poster'     => false,
        ] );

        $this->assertSame( 'home', $shaped['key'] );
        $this->assertSame( 'NEW HEADLINE', $shaped['fields']['hero_headline'] );
        $this->assertSame( [ 'product', 'detail' ], $shaped['fields']['manifesto_every'] );
        $this->assertSame( '', $shaped['fields']['hero_marquee'] );
        $this->assertSame( [], $shaped['fields']['manifesto_steps'] );
        $this->assertNull( $shaped['fields']['hero_poster']['url'] );
        $this->assertSame( [ 'url' => null, 'mime' => null ], $shaped['fields']['hero_video_wide'] );
        $this->assertArrayNotHasKey( 'teaser_note', $shaped['fields'] );
    }

    public function test_refresh_copy_replaces_only_untouched_previous_defaults() {
        $field = [ 'default' => 'New copy.', 'was' => [ "Old copy.\nSecond line." ] ];

        // Still the old default (as WordPress stores it, with CRLF) — refreshed.
        $this->assertSame( 'New copy.', KSL_Site_Pages::refreshed_value( $field, "Old copy.\r\nSecond line.  " ) );
        // An editor's own words — never touched.
        $this->assertNull( KSL_Site_Pages::refreshed_value( $field, 'Something the studio wrote.' ) );
        // Already current — nothing to do.
        $this->assertNull( KSL_Site_Pages::refreshed_value( $field, 'New copy.' ) );
        // A field with no history — nothing to compare against.
        $this->assertNull( KSL_Site_Pages::refreshed_value( [ 'default' => 'x' ], 'y' ) );
    }

    public function test_every_previous_default_differs_from_the_current_one() {
        foreach ( KSL_Site_Pages::schema() as $page ) {
            foreach ( KSL_Site_Pages::fields( $page ) as $field ) {
                foreach ( $field['was'] ?? [] as $old ) {
                    $this->assertNotSame( $field['default'], $old, "{$page['key']}.{$field['name']}" );
                }
            }
        }
    }
}
