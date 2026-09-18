<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_CPT_Client_Logo {
    const SLUG = 'client_logo';

    public static function register(): void {
        register_post_type(
            self::SLUG,
            [
                'label'        => __( 'Client Logos', 'kreative-studio-lab' ),
                'public'       => true,
                'show_ui'      => true,
                'show_in_rest' => true,
                'rest_base'    => 'client-logos',
                'supports'     => [ 'title', 'thumbnail' ],
                'menu_icon'    => 'dashicons-images-alt2',
                'has_archive'  => false,
                'rewrite'      => false,
            ]
        );
    }
}
