<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * ACF location rule "Site Page is <key>", so the Home field group appears on the Home
 * post and nowhere else. ACF's built-in rules can only target a post by ID, which differs
 * between the VPS and every local install; the page key stored by `wp ksl seed` does not.
 *
 * Loaded only once ACF itself is, because it extends an ACF class.
 */
class KSL_ACF_Location_Site_Page extends ACF_Location {
    public function initialize() {
        $this->name        = 'ksl_site_page';
        $this->label       = __( 'Site Page', 'kreative-studio-lab' );
        $this->category    = 'post';
        $this->object_type = 'post';
    }

    public function match( $rule, $screen, $field_group ) {
        $post_id = isset( $screen['post_id'] ) ? (int) $screen['post_id'] : 0;
        if ( ! $post_id ) {
            return false;
        }
        $key = get_post_meta( $post_id, KSL_Site_Pages::META_KEY, true );
        return $this->compare_to_rule( $key, $rule );
    }

    public function get_values( $rule ) {
        $values = [];
        foreach ( KSL_Site_Pages::schema() as $page ) {
            $values[ $page['key'] ] = $page['title'];
        }
        return $values;
    }
}
