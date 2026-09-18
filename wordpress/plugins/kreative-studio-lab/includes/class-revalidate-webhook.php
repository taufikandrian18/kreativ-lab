<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_Revalidate_Webhook {
    const RELEVANT_TYPES = [
        'archive_project',
        'client_logo',
    ];

    public static function maybe_fire( int $post_id, $post ): void {
        if ( $post->post_status !== 'publish' ) {
            return;
        }

        $post_type = get_post_type( $post_id );
        if ( ! in_array( $post_type, self::RELEVANT_TYPES, true ) ) {
            return;
        }

        $url = getenv( 'KSL_REVALIDATE_URL' );
        if ( ! $url ) {
            return;
        }

        wp_remote_post( $url, [
            'headers' => [
                'Content-Type'          => 'application/json',
                'X-KSL-Webhook-Secret'  => getenv( 'KSL_REVALIDATE_SECRET' ),
            ],
            'body'    => wp_json_encode( [
                'post_type' => $post_type,
                'post_id'   => $post_id,
            ] ),
            'timeout' => 5,
            'blocking' => false,
        ] );
    }
}
