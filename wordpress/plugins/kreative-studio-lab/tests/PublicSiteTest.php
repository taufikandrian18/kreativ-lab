<?php
use PHPUnit\Framework\TestCase;

/**
 * The CMS's own front end is never shown: every visit goes to the public site
 * (includes/class-public-site.php).
 */
class PublicSiteTest extends TestCase {
    public function test_sends_everything_that_is_not_a_case_study_to_the_home_page() {
        $this->assertSame( 'https://website.taufikandrian.my.id/kreative-lab/', KSL_Public_Site::target() );
        $this->assertSame( KSL_Public_Site::target(), KSL_Public_Site::target( '   ' ) );
    }

    public function test_sends_a_case_study_to_its_own_page_on_the_public_site() {
        $this->assertSame(
            'https://website.taufikandrian.my.id/kreative-lab/archive/drx-wear/',
            KSL_Public_Site::target( 'DRX Wear' )
        );
    }

    public function test_names_case_studies_exactly_as_the_front_end_routes_them() {
        // Every case study in the fixture, against the slug the front end builds its
        // route from (frontend/lib/slugify.ts, mirrored in scripts/fetch-cms.mjs).
        $fixture = json_decode( file_get_contents( __DIR__ . '/fixtures/rest-contract.json' ), true );
        $this->assertNotEmpty( $fixture['archive_projects'] );
        foreach ( $fixture['archive_projects'] as $project ) {
            $expected = trim( preg_replace( '/[^a-z0-9]+/', '-', strtolower( $project['title'] ) ), '-' );
            $this->assertSame( $expected, KSL_Public_Site::slugify( $project['title'] ) );
        }
        $this->assertSame( 'n8n-collective', KSL_Public_Site::slugify( 'N8N Collective' ) );
    }

    public function test_points_the_admin_bar_site_links_at_the_public_site() {
        $bar = new class {
            public array $nodes = [ 'site-name' => [ 'href' => 'cms' ], 'view-site' => [ 'href' => 'cms' ] ];
            public function get_node( $id ) {
                return isset( $this->nodes[ $id ] ) ? (object) $this->nodes[ $id ] : null;
            }
            public function add_node( $args ) {
                $this->nodes[ $args['id'] ] = [ 'href' => $args['href'] ];
            }
        };
        KSL_Public_Site::admin_bar( $bar );
        $this->assertSame( KSL_Public_Site::target(), $bar->nodes['site-name']['href'] );
        $this->assertSame( KSL_Public_Site::target(), $bar->nodes['view-site']['href'] );
    }

    public function test_leaves_an_admin_bar_without_those_links_alone() {
        $bar = new class {
            public array $added = [];
            public function get_node( $id ) {
                return null;
            }
            public function add_node( $args ) {
                $this->added[] = $args;
            }
        };
        KSL_Public_Site::admin_bar( $bar );
        $this->assertSame( [], $bar->added );
    }
}
