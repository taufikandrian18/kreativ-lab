<?php
use PHPUnit\Framework\TestCase;

class Test_Revalidate_Webhook extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_fires_webhook_for_published_archive_project() {
        WP_Mock::userFunction( 'get_post_type' )->andReturn( 'archive_project' );
        WP_Mock::userFunction( 'getenv' )->with( 'KSL_REVALIDATE_URL' )->andReturn( 'https://front.example/api/revalidate' );
        WP_Mock::userFunction( 'getenv' )->with( 'KSL_REVALIDATE_SECRET' )->andReturn( 'shh' );

        WP_Mock::userFunction( 'wp_remote_post' )
            ->once()
            ->with(
                'https://front.example/api/revalidate',
                Mockery::on( function ( $args ) {
                    $body = json_decode( $args['body'], true );
                    return $args['headers']['X-KSL-Webhook-Secret'] === 'shh'
                        && $body['post_type'] === 'archive_project'
                        && $body['post_id'] === 42;
                } )
            );

        $post = (object) [ 'ID' => 42, 'post_status' => 'publish' ];
        KSL_Revalidate_Webhook::maybe_fire( 42, $post );
        $this->assertTrue( true );
    }

    public function test_does_not_fire_for_unrelated_post_type() {
        WP_Mock::userFunction( 'get_post_type' )->andReturn( 'post' );
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        $post = (object) [ 'ID' => 42, 'post_status' => 'publish' ];
        KSL_Revalidate_Webhook::maybe_fire( 42, $post );
        $this->assertTrue( true );
    }

    public function test_does_not_fire_for_non_publish_status() {
        WP_Mock::userFunction( 'get_post_type' )->andReturn( 'archive_project' );
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        $post = (object) [ 'ID' => 42, 'post_status' => 'draft' ];
        KSL_Revalidate_Webhook::maybe_fire( 42, $post );
        $this->assertTrue( true );
    }
}
