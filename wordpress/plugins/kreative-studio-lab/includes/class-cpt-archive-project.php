<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_CPT_Archive_Project {
    const SLUG = 'archive_project';

    public static function register(): void {
        register_post_type(
            self::SLUG,
            [
                'label'        => __( 'Archive Projects', 'kreative-studio-lab' ),
                'public'       => true,
                'show_ui'      => true,
                'show_in_rest' => true,
                'rest_base'    => 'archive-projects',
                'supports'     => [ 'title', 'thumbnail' ],
                'menu_icon'    => 'dashicons-portfolio',
                'has_archive'  => false,
                'rewrite'      => false,
            ]
        );
    }
}
