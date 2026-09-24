<?php
use PHPUnit\Framework\TestCase;

class Test_REST_Contract extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_shape_archive_project_produces_stable_contract() {
        // 'scope' is a newline-delimited textarea (ACF free), not a repeater (ACF Pro) —
        // see spec §3 amendment. The public contract's 'scope' output shape is unchanged.
        $raw = [
            'archive_no'   => '01',
            'client'       => 'Nathan Tjoe A On',
            'industry'     => 'Clothing Brand',
            'year_range'   => '2025 – 2026',
            'scope'        => "Creative Direction\nProduct RnD",
            'lab'          => 'both',
            'hero_image'   => [ 'url' => 'https://example.test/hero.jpg', 'alt' => 'N8N hero', 'width' => 1600, 'height' => 1000 ],
            'gallery'      => [
                // ACF can hand back width/height as numeric strings; the contract casts.
                [ 'url' => 'https://example.test/g1.jpg', 'alt' => 'Gallery 1', 'width' => '800', 'height' => '1200' ],
            ],
            'accent_color' => '#1c3fd6',
        ];

        $shaped = KSL_REST_Contract::shape_archive_project( $raw, 'N8N Collective' );

        $this->assertSame( [
            'archive_no'   => '01',
            'title'        => 'N8N Collective',
            'client'       => 'Nathan Tjoe A On',
            'industry'     => 'Clothing Brand',
            'year_range'   => '2025 – 2026',
            'scope'        => [ 'Creative Direction', 'Product RnD' ],
            'lab'          => 'both',
            'hero_image'   => [ 'url' => 'https://example.test/hero.jpg', 'alt' => 'N8N hero', 'width' => 1600, 'height' => 1000 ],
            'gallery'      => [ [ 'url' => 'https://example.test/g1.jpg', 'alt' => 'Gallery 1', 'width' => 800, 'height' => 1200 ] ],
            'accent_color' => '#1c3fd6',
            'featured'     => false,
            'reel'         => [
                'wide'   => [ 'url' => null, 'mime' => null ],
                'narrow' => [ 'url' => null, 'mime' => null ],
                'poster' => [ 'url' => null, 'alt' => null, 'width' => null, 'height' => null ],
            ],
        ], $shaped );
    }

    public function test_shape_client_logo_produces_stable_contract() {
        // 'order' as a string, not an int: confirmed live against a real WordPress instance
        // that ACF's 'number' field type can round-trip through get_field() as "2" rather
        // than 2, even though the field is typed 'number'. Locks in shape_client_logo()'s
        // explicit (int) cast so this can't silently regress back to a numeric string.
        $raw = [
            'name'  => 'BMW Motorrad',
            'logo'  => [ 'url' => 'https://example.test/bmw.svg', 'alt' => 'BMW Motorrad logo' ],
            'order' => '2',
        ];

        $shaped = KSL_REST_Contract::shape_client_logo( $raw );

        $this->assertSame( [
            'name'  => 'BMW Motorrad',
            'logo'  => [ 'url' => 'https://example.test/bmw.svg', 'alt' => 'BMW Motorrad logo', 'width' => null, 'height' => null ],
            'order' => 2,
        ], $shaped );
    }

    public function test_shape_archive_project_scope_ignores_blank_lines_and_whitespace() {
        $raw = [
            'archive_no'   => '01',
            'client'       => 'Nathan Tjoe A On',
            'industry'     => 'Clothing Brand',
            'year_range'   => '2025 – 2026',
            'scope'        => "  Creative Direction  \n\nProduct RnD\n",
            'lab'          => 'both',
            'hero_image'   => [ 'url' => null, 'alt' => null ],
            'gallery'      => [],
            'accent_color' => null,
        ];

        $shaped = KSL_REST_Contract::shape_archive_project( $raw, 'N8N Collective' );

        $this->assertSame( [ 'Creative Direction', 'Product RnD' ], $shaped['scope'] );
    }

    public function test_shape_site_setting_produces_stable_contract() {
        // Replaces the ACF options page — see spec §3 amendment.
        $raw = [
            'phone_primary'   => '+62 812 0000 0000',
            'phone_secondary' => '+62 813 0000 0000',
            'email'           => 'hello@kreativestudiolab.example',
            'instagram'       => '@kreativestudiolab',
            'address'         => 'Jakarta, Indonesia',
            'og_image'        => [ 'url' => 'https://example.test/og.jpg', 'alt' => 'KSL' ],
        ];

        $shaped = KSL_REST_Contract::shape_site_setting( $raw );

        $this->assertSame( [
            'phone_primary'   => '+62 812 0000 0000',
            'phone_secondary' => '+62 813 0000 0000',
            'email'           => 'hello@kreativestudiolab.example',
            'instagram'       => '@kreativestudiolab',
            'address'         => 'Jakarta, Indonesia',
            'og_image'        => [ 'url' => 'https://example.test/og.jpg', 'alt' => 'KSL', 'width' => null, 'height' => null ],
        ], $shaped );
    }

    public function test_shape_image_turns_an_empty_acf_field_into_all_nulls() {
        // ACF returns false, not null, for an image field nobody has filled in.
        $this->assertSame(
            [ 'url' => null, 'alt' => null, 'width' => null, 'height' => null ],
            KSL_REST_Contract::shape_image( false )
        );
    }

    public function test_shape_archive_project_carries_featured_flag_and_reel() {
        $raw = [
            'archive_no' => '07', 'client' => 'C', 'industry' => 'I', 'year_range' => '2026',
            'scope' => '', 'lab' => 'creative', 'hero_image' => false, 'gallery' => [],
            'accent_color' => null,
            // ACF true_false comes back as 1/0, not a boolean.
            'featured'     => 1,
            'reel_wide'    => [ 'url' => 'https://example.test/w.mp4', 'mime_type' => 'video/mp4', 'filesize' => 9 ],
            'reel_narrow'  => false,
            'reel_poster'  => [ 'url' => 'https://example.test/p.jpg', 'alt' => '', 'width' => 900, 'height' => 900 ],
        ];

        $shaped = KSL_REST_Contract::shape_archive_project( $raw, 'New Client' );

        $this->assertTrue( $shaped['featured'] );
        $this->assertSame( [ 'url' => 'https://example.test/w.mp4', 'mime' => 'video/mp4' ], $shaped['reel']['wide'] );
        $this->assertSame( [ 'url' => null, 'mime' => null ], $shaped['reel']['narrow'] );
        $this->assertSame( 900, $shaped['reel']['poster']['width'] );
    }

    public function test_register_attaches_rest_field_to_all_three_post_types() {
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'archive_project', 'ksl_project', Mockery::type( 'array' ) );
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'client_logo', 'ksl_logo', Mockery::type( 'array' ) );
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'site_setting', 'ksl_site_setting', Mockery::type( 'array' ) );

        KSL_REST_Contract::register();
        $this->assertTrue( true );
    }
}
