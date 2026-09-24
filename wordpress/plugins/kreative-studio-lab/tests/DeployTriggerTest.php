<?php
use PHPUnit\Framework\TestCase;

class Test_Deploy_Trigger extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
        WP_Mock::userFunction( 'wp_json_encode' )->andReturnUsing( fn( $data ) => json_encode( $data ) );
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
        putenv( 'KSL_GITHUB_REPO' );
        putenv( 'KSL_GITHUB_TOKEN' );
    }

    private function configure(): void {
        putenv( 'KSL_GITHUB_REPO=owner/site' );
        putenv( 'KSL_GITHUB_TOKEN=tok' );
    }

    private function post( string $type, int $id = 42 ): object {
        return (object) [ 'ID' => $id, 'post_type' => $type ];
    }

    public function test_dispatches_to_github_when_an_archive_project_is_published() {
        $this->configure();

        WP_Mock::userFunction( 'wp_remote_post' )
            ->once()
            ->with(
                'https://api.github.com/repos/owner/site/dispatches',
                Mockery::on( function ( $args ) {
                    $body = json_decode( $args['body'], true );
                    return $args['headers']['Authorization'] === 'Bearer tok'
                        && $body['event_type'] === 'cms-publish'
                        && $body['client_payload']['post_type'] === 'archive_project'
                        && $body['client_payload']['post_id'] === 42
                        && $args['blocking'] === false;
                } )
            );

        KSL_Deploy_Trigger::maybe_fire( 'publish', 'draft', $this->post( 'archive_project' ) );
        $this->assertTrue( true );
    }

    public function test_dispatches_when_published_content_is_updated() {
        $this->configure();
        WP_Mock::userFunction( 'wp_remote_post' )->once();

        KSL_Deploy_Trigger::maybe_fire( 'publish', 'publish', $this->post( 'site_setting', 7 ) );
        $this->assertTrue( true );
    }

    public function test_dispatches_when_a_site_page_is_edited() {
        $this->configure();
        WP_Mock::userFunction( 'wp_remote_post' )->once();

        KSL_Deploy_Trigger::maybe_fire( 'publish', 'publish', $this->post( 'site_page', 37 ) );
        $this->assertTrue( true );
    }

    public function test_dispatches_when_live_content_is_unpublished_or_trashed() {
        // Removing a case study must rebuild the site, or it stays live forever.
        $this->configure();
        WP_Mock::userFunction( 'wp_remote_post' )->twice();

        KSL_Deploy_Trigger::maybe_fire( 'draft', 'publish', $this->post( 'archive_project' ) );
        KSL_Deploy_Trigger::maybe_fire( 'trash', 'publish', $this->post( 'client_logo' ) );
        $this->assertTrue( true );
    }

    public function test_does_not_fire_for_changes_that_never_touch_published_content() {
        $this->configure();
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        KSL_Deploy_Trigger::maybe_fire( 'draft', 'draft', $this->post( 'archive_project' ) );
        KSL_Deploy_Trigger::maybe_fire( 'draft', 'auto-draft', $this->post( 'archive_project' ) );
        $this->assertTrue( true );
    }

    public function test_does_not_fire_for_unrelated_post_type() {
        $this->configure();
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        KSL_Deploy_Trigger::maybe_fire( 'publish', 'draft', $this->post( 'post' ) );
        $this->assertTrue( true );
    }

    public function test_does_nothing_until_repo_and_token_are_configured() {
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        KSL_Deploy_Trigger::maybe_fire( 'publish', 'draft', $this->post( 'archive_project' ) );
        $this->assertTrue( true );
    }
}
