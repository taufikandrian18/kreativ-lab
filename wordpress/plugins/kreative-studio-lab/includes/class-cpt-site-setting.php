<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Replaces an ACF options page (ACF Pro only — no license, see spec §3 amendment).
 * Singleton BY CONVENTION, not by any technical constraint: `wp ksl seed` creates exactly
 * one published post of this type, and the frontend reads element [0] of the collection
 * endpoint. WordPress itself does not enforce a single-post limit on a CPT.
 */
class KSL_CPT_Site_Setting {
    const SLUG = 'site_setting';

    public static function register(): void {
        register_post_type(
            self::SLUG,
            [
                'label'        => __( 'Site Settings', 'kreative-studio-lab' ),
                'public'       => true,
                'show_ui'      => true,
                'show_in_rest' => true,
                'rest_base'    => 'site-settings',
                'supports'     => [ 'title' ],
                'menu_icon'    => 'dashicons-admin-generic',
                'has_archive'  => false,
                'rewrite'      => false,
            ]
        );
    }
}
