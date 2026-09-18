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
        $raw = [
            'archive_no'   => '01',
            'client'       => 'Nathan Tjoe A On',
            'industry'     => 'Clothing Brand',
            'year_range'   => '2025 – 2026',
            'scope'        => [
                [ 'item' => 'Creative Direction' ],
                [ 'item' => 'Product RnD' ],
            ],
            'lab'          => 'both',
            'hero_image'   => [ 'url' => 'https://example.test/hero.jpg', 'alt' => 'N8N hero' ],
            'gallery'      => [
                [ 'url' => 'https://example.test/g1.jpg', 'alt' => 'Gallery 1' ],
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
            'hero_image'   => [ 'url' => 'https://example.test/hero.jpg', 'alt' => 'N8N hero' ],
            'gallery'      => [ [ 'url' => 'https://example.test/g1.jpg', 'alt' => 'Gallery 1' ] ],
            'accent_color' => '#1c3fd6',
        ], $shaped );
    }

    public function test_shape_client_logo_produces_stable_contract() {
        $raw = [
            'name'  => 'BMW Motorrad',
            'logo'  => [ 'url' => 'https://example.test/bmw.svg', 'alt' => 'BMW Motorrad logo' ],
            'order' => 2,
        ];

        $shaped = KSL_REST_Contract::shape_client_logo( $raw );

        $this->assertSame( [
            'name'  => 'BMW Motorrad',
            'logo'  => [ 'url' => 'https://example.test/bmw.svg', 'alt' => 'BMW Motorrad logo' ],
            'order' => 2,
        ], $shaped );
    }

    public function test_register_attaches_rest_field_to_both_post_types() {
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'archive_project', 'ksl_project', Mockery::type( 'array' ) );
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'client_logo', 'ksl_logo', Mockery::type( 'array' ) );

        KSL_REST_Contract::register();
        $this->assertTrue( true );
    }
}
